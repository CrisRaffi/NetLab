import type { Device, Topology, SimulatedPacket, NetworkInterface } from '../../types';
import { isSameSubnet, maskToCidr, isValidIp, getNetworkAddress } from '../../utils/ip';
import { buildArpRequest, buildArpReply, buildIcmpEcho } from './PacketFactory';
import type { ArpEntry } from '../protocols/arp';

export interface IpIndexEntry {
  deviceId: string;
  interfaceId: string;
  iface: NetworkInterface;
}

export function buildIpIndex(topology: Topology): Map<string, IpIndexEntry> {
  const index = new Map<string, IpIndexEntry>();
  for (const device of topology.devices) {
    for (const iface of device.interfaces) {
      if (iface.ip && isValidIp(iface.ip)) {
        index.set(iface.ip, { deviceId: device.id, interfaceId: iface.id, iface });
      }
    }
  }
  return index;
}

function isSwitch(device: Device) {
  return device.type === 'switch';
}

export function computeL2Neighbors(topology: Topology): Map<string, Set<string>> {
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const neighbors = new Map<string, Set<string>>();
  for (const d of topology.devices) neighbors.set(d.id, new Set());

  const connectionsFrom = (deviceId: string) =>
    topology.connections
      .filter(c => c.deviceId1 === deviceId || c.deviceId2 === deviceId)
      .map(c => (c.deviceId1 === deviceId ? c.deviceId2 : c.deviceId1));

  for (const dev of topology.devices) {
    if (isSwitch(dev)) continue;
    const visited = new Set<string>([dev.id]);
    const queue = [...connectionsFrom(dev.id)];
    while (queue.length) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      const node = deviceById.get(id);
      if (!node) continue;
      if (node.type === 'switch') {
        queue.push(...connectionsFrom(id));
      } else if (node.type === 'router' || node.type === 'firewall' || node.type === 'access_point' || node.type === 'core') {
        // Roteador/AP funcionam como ponte nas portas LAN (estilização de roteador doméstico):
        // visíveis como vizinhos (gateway) e transparentes na camada 2.
        neighbors.get(dev.id)!.add(id);
        queue.push(...connectionsFrom(id));
      } else {
        neighbors.get(dev.id)!.add(id);
      }
    }
  }

  for (const [a, set] of neighbors) {
    for (const b of set) {
      neighbors.get(b)?.add(a);
    }
  }

  return neighbors;
}

export function findL2Path(topology: Topology, from: string, to: string): string[] {
  if (from === to) return [from];
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const prev = new Map<string, string>();
  const visited = new Set<string>([from]);
  const queue = [from];

  const connectionsFrom = (deviceId: string) =>
    topology.connections
      .filter(c => c.deviceId1 === deviceId || c.deviceId2 === deviceId)
      .map(c => (c.deviceId1 === deviceId ? c.deviceId2 : c.deviceId1));

  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === to) break;
    for (const nb of connectionsFrom(cur)) {
      if (visited.has(nb)) continue;
      const node = deviceById.get(nb);
      if (!node) continue;
      if (node.type !== 'switch' && node.type !== 'router' && node.type !== 'firewall' && node.type !== 'access_point' && node.type !== 'core' && nb !== to) continue;
      visited.add(nb);
      prev.set(nb, cur);
      queue.push(nb);
    }
  }

  if (!visited.has(to)) return [];
  const path: string[] = [to];
  let cur = to;
  while (prev.has(cur)) {
    cur = prev.get(cur)!;
    path.unshift(cur);
  }
  return path;
}

export interface RouteDecision {
  gateway: string;
  interfaceName?: string;
}

export function lookupRoute(device: Device, targetIp: string): RouteDecision | null {
  const specific = device.config.routes
    .filter(r => r.destination !== '0.0.0.0')
    .sort((a, b) => maskToCidr(b.mask) - maskToCidr(a.mask));
  for (const r of specific) {
    if (isSameSubnet(targetIp, r.destination, r.mask)) {
      return { gateway: r.gateway, interfaceName: r.interfaceName };
    }
  }
  const def = device.config.routes.find(r => r.destination === '0.0.0.0');
  if (def) return { gateway: def.gateway, interfaceName: def.interfaceName };
  const iface = device.interfaces.find(i => i.status === 'up' && i.ip && i.gateway);
  if (iface) return { gateway: iface.gateway!, interfaceName: iface.name };
  return null;
}

export type RouteError =
  | 'no-ip'
  | 'no-route'
  | 'gateway-unreachable'
  | 'arp-failed'
  | 'loop'
  | 'ttl-exceeded'
  | 'target-down'
  | 'invalid-ip';

export interface RouteResult {
  delivered: boolean;
  path: string[];
  error?: RouteError;
  at?: string;
  gateway?: string;
}

export function findRoute(topology: Topology, sourceDeviceId: string, targetIp: string): RouteResult {
  if (!isValidIp(targetIp)) return { delivered: false, path: [], error: 'invalid-ip' };

  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const ipIndex = buildIpIndex(topology);
  const l2 = computeL2Neighbors(topology);

  const targetEntry = ipIndex.get(targetIp);
  if (targetEntry && targetEntry.iface.status !== 'up') {
    return { delivered: false, path: [], error: 'target-down' };
  }

  let current = sourceDeviceId;
  const path: string[] = [];
  const visited = new Set<string>();

  for (let hop = 0; hop < 32; hop++) {
    const device = deviceById.get(current);
    if (!device) return { delivered: false, path, error: 'no-route', at: current };
    if (visited.has(current)) return { delivered: false, path, error: 'loop', at: current };
    visited.add(current);
    path.push(current);

    if (current === targetEntry?.deviceId) return { delivered: true, path };

    const matching = device.interfaces.find(
      i => i.status === 'up' && i.ip && i.subnetMask && isSameSubnet(i.ip, targetIp, i.subnetMask)
    );
    if (matching) {
      const neighborIds = l2.get(current) ?? new Set();
      let neighbor: Device | undefined;
      for (const nid of neighborIds) {
        const nd = deviceById.get(nid);
        if (nd && nd.interfaces.some(i => i.status === 'up' && i.ip === targetIp)) {
          neighbor = nd;
          break;
        }
      }
      if (neighbor) {
        path.push(neighbor.id);
        return { delivered: true, path };
      }
      return { delivered: false, path, error: 'arp-failed', at: current };
    }

    const route = lookupRoute(device, targetIp);
    if (!route) return { delivered: false, path, error: 'no-route', at: current };

    const neighborIds = l2.get(current) ?? new Set();
    let gw: Device | undefined;
    for (const nid of neighborIds) {
      const nd = deviceById.get(nid);
      if (nd && nd.interfaces.some(i => i.status === 'up' && i.ip === route.gateway)) {
        gw = nd;
        break;
      }
    }
    if (!gw) {
      return { delivered: false, path, error: 'gateway-unreachable', at: current, gateway: route.gateway };
    }
    current = gw.id;
  }

  return { delivered: false, path, error: 'ttl-exceeded' };
}

export interface Transmission {
  packet: SimulatedPacket;
  points: { x: number; y: number }[];
}

export interface PingResult {
  success: boolean;
  output: string[];
  transmissions: Transmission[];
  arpLearned: { deviceId: string; entry: ArpEntry }[];
  reason?: RouteError;
}

function pathPointsFor(topology: Topology, routePath: string[], reverse = false): { x: number; y: number }[] {
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const full: string[] = [];
  for (let i = 0; i < routePath.length - 1; i++) {
    const seg = findL2Path(topology, routePath[i], routePath[i + 1]);
    const effective = seg.length ? seg : [routePath[i], routePath[i + 1]];
    if (full.length) full.push(...effective.slice(1));
    else full.push(...effective);
  }
  if (full.length === 0) full.push(...routePath);
  const points = full.map(id => {
    const d = deviceById.get(id);
    return d ? { x: d.position.x, y: d.position.y } : { x: 0, y: 0 };
  });
  return reverse ? points.reverse() : points;
}

export function ping(topology: Topology, sourceDeviceId: string, targetIp: string): PingResult {
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const source = deviceById.get(sourceDeviceId);

  if (!source) {
    return { success: false, output: ['Falha: equipamento não encontrado.'], transmissions: [], arpLearned: [], reason: 'no-ip' };
  }

  const srcIface = source.interfaces.find(i => i.status === 'up' && i.ip && i.subnetMask);
  if (!srcIface) {
    return {
      success: false,
      output: ['O adaptador de rede não possui endereço IP configurado.'],
      transmissions: [],
      arpLearned: [],
      reason: 'no-ip',
    };
  }

  if (!isValidIp(targetIp)) {
    return {
      success: false,
      output: [`Ping: não foi possível resolver o nome ou endereço ${targetIp}.`],
      transmissions: [],
      arpLearned: [],
      reason: 'invalid-ip',
    };
  }

  const route = findRoute(topology, sourceDeviceId, targetIp);
  const ipIndex = buildIpIndex(topology);
  const targetIface = ipIndex.get(targetIp)?.iface;

  if (!route.delivered) {
    const output: string[] = [`Disparando ${targetIp} com 32 bytes de dados:`];
    switch (route.error) {
      case 'no-route':
        output.push(`Destino inalcançável: nenhuma rota para ${targetIp}.`, 'Falha geral.');
        break;
      case 'gateway-unreachable':
        output.push(`Resposta de ${route.gateway}: host de destino inacessível.`);
        break;
      case 'arp-failed':
        output.push('Esgotado o tempo limite do pedido.', 'Esgotado o tempo limite do pedido.', 'Esgotado o tempo limite do pedido.', 'Esgotado o tempo limite do pedido.');
        break;
      case 'loop':
      case 'ttl-exceeded':
        output.push('TTL esgotado durante o trânsito.', 'Falha geral.');
        break;
      case 'target-down':
        output.push('Host de destino inacessível.');
        break;
      default:
        output.push('Falha geral.');
    }
    output.push('', `Estatísticas do Ping para ${targetIp}:`, '    Pacotes: Enviados = 4, Recebidos = 0, Perdidos = 4 (100% de perda).');
    return { success: false, output, transmissions: [], arpLearned: [], reason: route.error };
  }

  const transmissions: Transmission[] = [];
  const arpLearned: { deviceId: string; entry: ArpEntry }[] = [];

  const targetEntry2 = ipIndex.get(targetIp);
  const routeDecision = lookupRoute(source, targetIp);
  const firstHop = route.path[1];
  const nextHopIp =
    firstHop && targetEntry2 && firstHop === targetEntry2.deviceId
      ? targetIp
      : (routeDecision?.gateway ?? targetIp);

  const nextHopEntry = ipIndex.get(nextHopIp);
  const nextHopMac = nextHopEntry?.iface.mac ?? 'FF:FF:FF:FF:FF:FF';

  const arpSource = (source.interfaces.find(
    i =>
      i.status === 'up' &&
      i.ip &&
      isSameSubnet(i.ip, nextHopIp, i.subnetMask ?? '255.255.255.0')
  ) ??
    source.interfaces.find(i => i.status === 'up' && i.ip))!;

  if (nextHopEntry && nextHopIp !== arpSource.ip) {
    transmissions.push({
      packet: buildArpRequest(arpSource, arpSource.ip!, nextHopIp),
      points: pathPointsFor(topology, [sourceDeviceId, nextHopEntry.deviceId]),
    });
    transmissions.push({
      packet: buildArpReply(nextHopEntry.iface, nextHopIp, arpSource.mac, arpSource.ip!),
      points: pathPointsFor(topology, [sourceDeviceId, nextHopEntry.deviceId], true),
    });
    arpLearned.push({
      deviceId: sourceDeviceId,
      entry: { ip: nextHopIp, mac: nextHopEntry.iface.mac, interfaceName: arpSource.name },
    });
    arpLearned.push({
      deviceId: nextHopEntry.deviceId,
      entry: { ip: arpSource.ip!, mac: arpSource.mac, interfaceName: nextHopEntry.iface.name },
    });
  }

  const routers = route.path.filter(id => {
    const t = deviceById.get(id)?.type;
    return t === 'router' || t === 'firewall';
  }).length;
  const ttl = Math.max(1, 128 - routers);

  transmissions.push({
    packet: buildIcmpEcho('request', arpSource.mac, nextHopMac, arpSource.ip!, targetIp, ttl + routers, 1, 0x0100),
    points: pathPointsFor(topology, route.path),
  });

  if (targetIface) {
    transmissions.push({
      packet: buildIcmpEcho('reply', targetIface.mac, nextHopMac, targetIp, srcIface.ip!, ttl, 1, 0x0100),
      points: pathPointsFor(topology, route.path, true),
    });
  }

  const output = [
    `Disparando ${targetIp} com 32 bytes de dados:`,
    `Resposta de ${targetIp}: bytes=32 tempo=1ms TTL=${ttl}`,
    `Resposta de ${targetIp}: bytes=32 tempo=1ms TTL=${ttl}`,
    `Resposta de ${targetIp}: bytes=32 tempo=1ms TTL=${ttl}`,
    `Resposta de ${targetIp}: bytes=32 tempo=1ms TTL=${ttl}`,
    '',
    `Estatísticas do Ping para ${targetIp}:`,
    '    Pacotes: Enviados = 4, Recebidos = 4, Perdidos = 0 (0% de perda),',
  ];

  return { success: true, output, transmissions, arpLearned };
}

export function traceroute(topology: Topology, sourceDeviceId: string, targetIp: string): { success: boolean; output: string[]; transmissions: Transmission[] } {
  if (!isValidIp(targetIp)) {
    return { success: false, output: [`Não foi possível resolver o nome de destino ${targetIp}.`], transmissions: [] };
  }
  const route = findRoute(topology, sourceDeviceId, targetIp);
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const output: string[] = [
    `Rastreando a rota para ${targetIp} com no máximo 30 saltos:`,
    '',
  ];

  const hopIp = (device: Device, prev: Device): string => {
    for (const i of device.interfaces) {
      if (i.status !== 'up' || !i.ip || !i.subnetMask) continue;
      for (const p of prev.interfaces) {
        if (p.status !== 'up' || !p.ip) continue;
        if (isSameSubnet(i.ip, p.ip, i.subnetMask)) return i.ip;
      }
    }
    return device.interfaces.find(i => i.ip)?.ip ?? '*';
  };

  route.path.forEach((id, i) => {
    if (i === 0) return;
    const device = deviceById.get(id);
    if (!device) return;
    const prev = deviceById.get(route.path[i - 1])!;
    const ip = i === route.path.length - 1 ? targetIp : hopIp(device, prev);
    output.push(`  ${String(i).padStart(2, ' ')}    1 ms    1 ms    1 ms  ${ip}`);
  });

  if (!route.delivered) {
    output.push(`  ${String(route.path.length).padStart(2, ' ')}    *        *        *     Esgotado o tempo limite do pedido.`);
  } else {
    output.push('');
    output.push('Rastreamento concluído.');
  }

  const transmissions: Transmission[] = route.delivered
    ? [{
        packet: (() => {
          const src = deviceById.get(sourceDeviceId)!;
          const srcIface = src.interfaces.find(i => i.ip)!;
          const ipIndex = buildIpIndex(topology);
          const targetIface = ipIndex.get(targetIp)?.iface;
          return buildIcmpEcho('request', srcIface.mac, targetIface?.mac ?? 'FF:FF:FF:FF:FF:FF', srcIface.ip!, targetIp, 1, 1, 0x0100);
        })(),
        points: pathPointsFor(topology, route.path),
      }]
    : [];

  return { success: route.delivered, output, transmissions };
}

export function getRoutingTable(topology: Topology, deviceId: string): string[] {
  const device = topology.devices.find(d => d.id === deviceId);
  if (!device) return ['Dispositivo não encontrado.'];

  const lines: string[] = [
    '===========================================================================',
    'Lista de Interfaces',
    `${'Interface'.padEnd(22)}${'Endereço IP'.padEnd(18)}${'Máscara'.padEnd(18)}Gateway`,
  ];
  for (const i of device.interfaces) {
    if (!i.ip) continue;
    lines.push(`${i.name.padEnd(22)}${i.ip.padEnd(18)}${(i.subnetMask ?? '-').padEnd(18)}${i.gateway ?? ''}`);
  }
  lines.push('');
  lines.push('===========================================================================');
  lines.push('Rotas Ativas:');
  lines.push(`${'Destino'.padEnd(20)}${'Máscara'.padEnd(18)}${'Gateway'.padEnd(18)}${'Interface'.padEnd(16)}Métrica`);
  for (const i of device.interfaces) {
    if (!i.ip || !i.subnetMask) continue;
    const network = getNetworkAddress(i.ip, i.subnetMask);
    lines.push(`${network.padEnd(20)}${i.subnetMask.padEnd(18)}${'No vínculo'.padEnd(18)}${i.ip.padEnd(16)}281`);
    if (i.gateway) {
      lines.push(`${'0.0.0.0'.padEnd(20)}${'0.0.0.0'.padEnd(18)}${i.gateway.padEnd(18)}${i.ip.padEnd(16)}25`);
    }
  }
  for (const r of device.config.routes) {
    lines.push(`${r.destination.padEnd(20)}${r.mask.padEnd(18)}${r.gateway.padEnd(18)}${'-'.padEnd(16)}${r.metric}`);
  }
  return lines;
}

export function formatIpconfig(device: Device, all = false): string[] {
  const lines: string[] = [];
  const configured = device.interfaces.filter(i => i.ip);

  if (configured.length === 0) {
    return ['Nenhum adaptador de rede possui endereço IP configurado.', '', 'Use o painel de propriedades para configurar uma interface.'];
  }

  for (const iface of configured) {
    lines.push(`Adaptador: ${iface.name}`);
    lines.push(`   Endereço IPv4. . . . . . . . . . : ${iface.ip}`);
    lines.push(`   Máscara de Sub-rede. . . . . . . : ${iface.subnetMask ?? '255.255.255.0'}`);
    lines.push(`   Gateway Padrão . . . . . . . . . : ${iface.gateway ?? '(não configurado)'}`);
    if (all || iface.dns) {
      lines.push(`   DNS Primário . . . . . . . . . . : ${iface.dns ?? '(não configurado)'}`);
    }
    if (all) {
      lines.push(`   Endereço Físico. . . . . . . . . : ${iface.mac}`);
      lines.push(`   Status. . . . . . . . . . . . . : ${iface.status === 'up' ? 'Conectado' : 'Desconectado'}`);
      lines.push('   DHCP Habilitado . . . . . . . . : Não');
    }
    lines.push('');
  }
  return lines;
}
