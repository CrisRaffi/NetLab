import type { Topology, Device, NetworkInterface, DhcpConfig } from '../../types';
import { ipToNumber, numberToIp, isValidIp, getNetworkAddress, getBroadcastAddress } from '../../utils/ip';
import { buildIpIndex, type Transmission } from './network';
import { pathWithFlooding, type PathWithFlooding } from './network';
import { buildDhcpDiscover, buildDhcpOffer, buildDhcpRequest, buildDhcpAck, type DhcpOffer as DhcpOfferData } from './PacketFactory';

export interface DhcpLeaseResult {
  deviceId: string;
  interfaceId: string;
  ip: string;
  subnetMask: string;
  gateway: string;
  dns?: string;
  serverIp: string;
  serverId: string;
  leaseTime: number;
  networkName: string;
}

export interface DhcpOutcome {
  ok: boolean;
  output: string[];
  transmissions: Transmission[];
  lease?: DhcpLeaseResult;
}

interface QueueItem {
  id: string;
  tag: number;
}

function vlanOf(device: Device | undefined, ifaceId: string): number {
  const v = device?.interfaces.find(i => i.id === ifaceId)?.vlan ?? 0;
  return v;
}

function effVlan(v: number): number {
  return v > 0 ? v : 1;
}

/**
 * Servidores DHCP alcançáveis no mesmo domínio de broadcast.
 * O BFS só atravessa comutadores (switch/core/access_point/hub),
 * respeitando VLANs nas portas dos switches.
 */
export function dhcpReachableServers(topology: Topology, clientId: string): Device[] {
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const connectionsOf = (id: string) =>
    topology.connections
      .filter(c => c.deviceId1 === id || c.deviceId2 === id)
      .map(c => (c.deviceId1 === id ? c : { ...c, id: c.id }))
      .map(c => ({
        peer: c.deviceId1 === id ? c.deviceId2 : c.deviceId1,
        peerIface: c.deviceId1 === id ? c.interfaceId2 : c.interfaceId1,
        myIface: c.deviceId1 === id ? c.interfaceId1 : c.interfaceId2,
      }));

  const results: Device[] = [];
  const visited = new Set<string>([clientId]);
  const queue: QueueItem[] = [{ id: clientId, tag: 0 }];
  const isBridge = (t: string) => t === 'switch' || t === 'core' || t === 'access_point' || t === 'hub';

  while (queue.length) {
    const cur = queue.shift()!;
    const dev = deviceById.get(cur.id);
    if (!dev) continue;

    for (const link of connectionsOf(cur.id)) {
      const peer = deviceById.get(link.peer);
      if (!peer || visited.has(link.peer)) continue;

      const portVlan = vlanOf(dev, link.myIface);
      const peerVlan = vlanOf(peer, link.peerIface);
      if (portVlan > 0 && peerVlan > 0 && portVlan !== peerVlan) continue;

      const entryTag = Math.max(effVlan(portVlan), effVlan(peerVlan));
      if (dev.type === 'switch' && cur.tag > 0 && entryTag !== cur.tag) continue;
      if (dev.type === 'core' && cur.tag > 0 && entryTag !== cur.tag) continue;

      visited.add(link.peer);
      if (isBridge(peer.type)) {
        if (peer.type === 'hub') {
          queue.push({ id: link.peer, tag: 0 });
        } else {
          queue.push({ id: link.peer, tag: entryTag });
        }
      } else if (peer.type === 'server' && peer.config.dhcp?.enabled) {
        results.push(peer);
      }
    }
  }

  return results;
}

function firstFreeIp(
  topology: Topology,
  config: DhcpConfig,
  leases: DhcpLeaseResult[],
  preferred?: string,
): string | undefined {
  const start = ipToNumber(config.rangeStart);
  const end = ipToNumber(config.rangeEnd);
  if (start > end) return undefined;

  const used = new Set<string>();
  for (const entry of buildIpIndex(topology).values()) used.add(entry.iface.ip ?? '');
  for (const l of leases) used.add(l.ip);

  const net = getNetworkAddress(config.rangeStart, config.subnetMask);
  const bcast = getBroadcastAddress(config.rangeStart, config.subnetMask);

  if (preferred && isValidIp(preferred)) {
    const num = ipToNumber(preferred);
    if (num >= start && num <= end && !used.has(preferred) && preferred !== net && preferred !== bcast) {
      return preferred;
    }
  }

  for (let num = start; num <= end; num++) {
    const ip = numberToIp(num);
    if (ip === net || ip === bcast || used.has(ip) || ip === config.gateway || ip === config.dns) continue;
    return ip;
  }
  return undefined;
}

export function teardownDhcp(topology: Topology, deviceId: string, interfaceId: string): { output: string[]; release?: { deviceId: string; interfaceId: string } } {
  const device = topology.devices.find(d => d.id === deviceId);
  const iface = device?.interfaces.find(i => i.id === interfaceId);
  if (!device || !iface) return { output: ['Interface não encontrada.'] };
  return {
    output: [
      `Liberando endereço IPv4 da interface ${iface.name}...`,
      'DHCP /release concluído.',
    ],
    release: { deviceId, interfaceId },
  };
}

export function requestDhcpLease(
  topology: Topology,
  deviceId: string,
  interfaceId: string,
  existingLeases: DhcpLeaseResult[] = [],
  preferredIp?: string,
): DhcpOutcome {
  const device = topology.devices.find(d => d.id === deviceId);
  const iface = device?.interfaces.find(i => i.id === interfaceId);
  if (!device || !iface) {
    return { ok: false, output: ['Interface não encontrada.'], transmissions: [] };
  }

  const servers = dhcpReachableServers(topology, deviceId);
  if (servers.length === 0) {
    return {
      ok: false,
      output: [
        `Solicitando IP da interface ${iface.name}...`,
        'Nenhum servidor DHCP alcançável na rede.',
      ],
      transmissions: [],
    };
  }

  const server = servers[0];
  const serverIface = server.interfaces.find(i => i.status === 'up' && i.ip);
  const config = server.config.dhcp;
  if (!config || !serverIface || !serverIface.ip) {
    return {
      ok: false,
      output: ['O servidor DHCP encontrado não está configurado corretamente.'],
      transmissions: [],
    };
  }

  const ip = firstFreeIp(topology, config, existingLeases, preferredIp);
  if (!ip) {
    return {
      ok: false,
      output: ['A faixa de endereços do servidor DHCP está esgotada.'],
      transmissions: [],
    };
  }

  const serverMac = serverIface.mac;
  const forward: PathWithFlooding = pathWithFlooding(topology, [deviceId, server.id]);
  const backward: PathWithFlooding = pathWithFlooding(topology, [deviceId, server.id], true);

  const offer: DhcpOfferData = {
    ip,
    subnetMask: config.subnetMask,
    gateway: config.gateway,
    dns: config.dns,
    leaseTime: config.leaseTime,
    serverIp: serverIface.ip,
  };

  const transmissions: Transmission[] = [
    { packet: buildDhcpDiscover(iface.mac), points: forward.points, branches: forward.branches },
    { packet: buildDhcpOffer(serverMac, serverIface.ip, iface.mac, offer), points: backward.points, branches: backward.branches },
    { packet: buildDhcpRequest(iface.mac, ip, serverIface.ip), points: forward.points, branches: forward.branches },
    { packet: buildDhcpAck(serverMac, serverIface.ip, iface.mac, offer), points: backward.points, branches: backward.branches },
  ];

  const lease: DhcpLeaseResult = {
    deviceId,
    interfaceId,
    ip,
    subnetMask: config.subnetMask,
    gateway: config.gateway,
    dns: config.dns,
    serverIp: serverIface.ip,
    serverId: server.id,
    leaseTime: config.leaseTime,
    networkName: server.name,
  };

  return {
    ok: true,
    output: [
      `Solicitando IP da interface ${iface.name} via DHCP...`,
      `Lease obtido: ${ip}`,
      `  Máscara     : ${config.subnetMask}`,
      `  Gateway     : ${config.gateway}`,
      config.dns ? `  DNS         : ${config.dns}` : '',
      `  Servidor    : ${server.name} (${serverIface.ip})`,
      `  Duração     : ${config.leaseTime} s`,
      '',
      'Conversa DHCP: DISCOVER → OFFER → REQUEST → ACK',
    ].filter(Boolean),
    transmissions,
    lease,
  };
}

export function renewDhcpLease(
  topology: Topology,
  deviceId: string,
  interfaceId: string,
  existingLeases: DhcpLeaseResult[],
): DhcpOutcome {
  const device = topology.devices.find(d => d.id === deviceId);
  const iface = device?.interfaces.find(i => i.id === interfaceId);
  if (!device || !iface) return { ok: false, output: ['Interface não encontrada.'], transmissions: [] };
  const current = iface.ip;
  const result = requestDhcpLease(topology, deviceId, interfaceId, existingLeases, current);
  if (result.ok) {
    result.output = [
      `Renovando endereço IPv4 da interface ${iface.name}...`,
      ...result.output,
    ];
  }
  return result;
}

export type { NetworkInterface };