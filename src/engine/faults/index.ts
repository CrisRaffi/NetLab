import type { Topology, NetworkInterface, ValidationCheck } from '../../types';
import { getNetworkAddress, isSameSubnet, maskToCidr, getUsableHosts } from '../../utils/ip';

export type FaultType =
  | 'wrong-ip'
  | 'duplicate-ip'
  | 'wrong-mask'
  | 'wrong-gateway'
  | 'missing-gateway'
  | 'interface-down'
  | 'missing-route'
  | 'wrong-route';

export interface FaultVariant {
  id: string;
  type: FaultType;
  symptom: string;
  fix: string;
  target?: { deviceId: string; interfaceId?: string };
  wrongIp?: string;
  wrongMask?: string;
  wrongGateway?: string;
  copyFrom?: { deviceId: string; interfaceId: string };
  routeDest?: string;
  wrongRouteGateway?: string;
}

export interface BreakScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  concepts: string[];
  estimatedTime: number;
  xpReward: number;
  generalHints: string[];
  health: Topology;
  validation: ValidationCheck[];
  variants: FaultVariant[];
}

export function cloneTopology(topo: Topology): Topology {
  return {
    id: topo.id,
    name: topo.name,
    devices: topo.devices.map(d => ({
      ...d,
      position: { ...d.position },
      interfaces: d.interfaces.map(i => ({
        ...i,
        id: i.id,
        name: i.name,
        type: i.type,
        mac: i.mac,
        ip: i.ip,
        subnetMask: i.subnetMask,
        gateway: i.gateway,
        dns: i.dns,
        vlan: i.vlan,
        status: i.status,
        speed: i.speed,
      })),
      config: { ...d.config, routes: d.config.routes.map(r => ({ ...r })) },
    })),
    connections: topo.connections.map(c => ({ ...c })),
  };
}

function ifaceOf(topo: Topology, target: FaultVariant['target']) {
  const device = topo.devices.find(d => d.id === target?.deviceId);
  const iface = device?.interfaces.find(i => i.id === target?.interfaceId);
  return { device, iface };
}

export function applyFault(topo: Topology, variant: FaultVariant): Topology {
  const { device, iface } = ifaceOf(topo, variant.target);

  if (variant.type === 'missing-route' || variant.type === 'wrong-route') {
    if (!device) return topo;
    if (variant.type === 'missing-route') {
      device.config.routes = device.config.routes.filter(r => r.destination !== variant.routeDest);
    } else {
      device.config.routes = device.config.routes.map(r =>
        r.destination === variant.routeDest
          ? { ...r, gateway: variant.wrongRouteGateway ?? r.gateway }
          : r
      );
    }
    return topo;
  }

  if (!device || !iface) return topo;

  switch (variant.type) {
    case 'wrong-ip': {
      iface.ip = variant.wrongIp;
      break;
    }
    case 'duplicate-ip': {
      const src = topo.devices.find(d => d.id === variant.copyFrom?.deviceId);
      const srcIface = src?.interfaces.find(i => i.id === variant.copyFrom?.interfaceId);
      if (srcIface?.ip) iface.ip = srcIface.ip;
      break;
    }
    case 'wrong-mask': {
      iface.subnetMask = variant.wrongMask;
      break;
    }
    case 'wrong-gateway': {
      iface.gateway = variant.wrongGateway;
      break;
    }
    case 'missing-gateway': {
      iface.gateway = undefined;
      break;
    }
    case 'interface-down': {
      iface.status = 'down';
      break;
    }
  }
  return topo;
}

export function buildBrokenTopology(scenario: BreakScenario, variant: FaultVariant): Topology {
  return applyFault(cloneTopology(scenario.health), variant);
}

export function chooseChallenge(
  scenarios: BreakScenario[],
  excludeKey?: string
): { scenario: BreakScenario; variant: FaultVariant } {
  const pool: { scenario: BreakScenario; variant: FaultVariant }[] = scenarios.flatMap(s =>
    s.variants.map(v => ({ scenario: s, variant: v }))
  );
  const candidates = excludeKey
    ? pool.filter(p => challengeKey(p.scenario, p.variant) !== excludeKey)
    : pool;
  const list = candidates.length > 0 ? candidates : pool;
  const pick = list[Math.floor(Math.random() * list.length)]!;
  return pick;
}

export function challengeKey(scenario: BreakScenario, variant: FaultVariant): string {
  return `${scenario.id}-${variant.id}`;
}

export interface DiagnosisFinding {
  severity: 'error' | 'warning' | 'info';
  text: string;
}

function activeIfaces(topology: Topology): { deviceId: string; deviceName: string; deviceType: string; iface: NetworkInterface }[] {
  return topology.devices.flatMap(d =>
    d.interfaces.filter(i => i.status === 'up').map(i => ({ deviceId: d.id, deviceName: d.name, deviceType: d.type, iface: i }))
  );
}

const HOST_TYPES = new Set(['pc', 'server', 'printer', 'ip_camera', 'ip_phone', 'access_point', 'cloud']);
const L3_TYPES = new Set(['router', 'firewall']);

function broadcastDomains(topology: Topology): string[][] {
  const adjacency = new Map<string, string[]>();
  for (const d of topology.devices) adjacency.set(d.id, []);
  const isL3 = (id: string) => L3_TYPES.has(topology.devices.find(d => d.id === id)?.type ?? '');
  for (const c of topology.connections) {
    if (isL3(c.deviceId1) || isL3(c.deviceId2)) continue;
    adjacency.get(c.deviceId1)?.push(c.deviceId2);
    adjacency.get(c.deviceId2)?.push(c.deviceId1);
  }
  const seen = new Set<string>();
  const components: string[][] = [];
  for (const d of topology.devices) {
    if (seen.has(d.id) || isL3(d.id)) continue;
    const comp: string[] = [];
    const stack = [d.id];
    seen.add(d.id);
    while (stack.length > 0) {
      const current = stack.pop()!;
      comp.push(current);
      for (const next of adjacency.get(current) ?? []) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push(next);
        }
      }
    }
    components.push(comp);
  }
  return components;
}

export function diagnose(topology: Topology): DiagnosisFinding[] {
  const findings: DiagnosisFinding[] = [];
  const active = activeIfaces(topology);
  const hasRouter = topology.devices.some(d => d.type === 'router' || d.type === 'firewall');

  const byIp = new Map<string, { deviceName: string; ifaceId: string }[]>();
  for (const { deviceName, iface } of active) {
    if (!iface.ip) continue;
    const list = byIp.get(iface.ip) ?? [];
    list.push({ deviceName, ifaceId: iface.id });
    byIp.set(iface.ip, list);
  }
  for (const [ip, holders] of byIp) {
    if (holders.length > 1) {
      findings.push({
        severity: 'error',
        text: `IP duplicado: ${ip} está em uso por ${holders.map(h => `${h.deviceName} (${h.ifaceId})`).join(' e ')}.`,
      });
    }
  }

  for (const c of topology.connections) {
    const d1 = topology.devices.find(d => d.id === c.deviceId1);
    const d2 = topology.devices.find(d => d.id === c.deviceId2);
    const i1 = d1?.interfaces.find(i => i.id === c.interfaceId1);
    const i2 = d2?.interfaces.find(i => i.id === c.interfaceId2);
    if (d1 && d2 && i1 && i2 && i1.status === 'up' && i2.status === 'up' && i1.ip && i1.subnetMask && i2.ip) {
      if (!isSameSubnet(i1.ip, i2.ip, i1.subnetMask)) {
        findings.push({
          severity: 'warning',
          text: `Cabo ${d1.name}(${i1.id}) ↔ ${d2.name}(${i2.id}): os IPs ${i1.ip} e ${i2.ip} estão em sub-redes diferentes.`,
        });
      }
    }
  }

  for (const component of broadcastDomains(topology)) {
    const hostNets: { name: string; ifaceId: string; network: string }[] = [];
    for (const deviceId of component) {
      const d = topology.devices.find(x => x.id === deviceId);
      if (!d || !HOST_TYPES.has(d.type)) continue;
      for (const i of d.interfaces) {
        if (i.status === 'up' && i.ip && i.subnetMask) {
          hostNets.push({ name: d.name, ifaceId: i.id, network: getNetworkAddress(i.ip, i.subnetMask) });
        }
      }
    }
    if (hostNets.length < 2) continue;
    const counts = new Map<string, number>();
    for (const h of hostNets) counts.set(h.network, (counts.get(h.network) ?? 0) + 1);
    const majority = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]![0];
    for (const h of hostNets) {
      if (h.network !== majority) {
        findings.push({
          severity: 'warning',
          text: `${h.name} (${h.ifaceId}): o endereço está na rede ${h.network}, diferente dos demais do segmento (${majority}).`,
        });
      }
    }
  }

  for (const { deviceName, deviceType, iface } of active) {
    if (!HOST_TYPES.has(deviceType)) continue;
    if (iface.ip && !iface.subnetMask) {
      findings.push({ severity: 'warning', text: `${deviceName} (${iface.id}): IP sem máscara de sub-rede definida.` });
    } else if (iface.ip && iface.subnetMask) {
      const network = getNetworkAddress(iface.ip, iface.subnetMask);
      const cidr = maskToCidr(iface.subnetMask);
      if (cidr >= 30) {
        findings.push({
          severity: 'warning',
          text: `${deviceName} (${iface.id}): máscara ${iface.subnetMask} (/${cidr}) cria uma rede com apenas ${getUsableHosts(cidr)} hosts — pequena demais para uma estação.`,
        });
      }
      if (iface.gateway) {
        if (!isSameSubnet(iface.ip, iface.gateway, iface.subnetMask)) {
          findings.push({
            severity: 'error',
            text: `${deviceName} (${iface.id}): o gateway ${iface.gateway} está fora da rede ${network}.`,
          });
        } else if (!active.some(g => g.iface.ip === iface.gateway)) {
          findings.push({
            severity: 'warning',
            text: `${deviceName} (${iface.id}): o gateway ${iface.gateway} não existe como IP ativo na rede.`,
          });
        }
      } else if (hasRouter) {
        findings.push({ severity: 'warning', text: `${deviceName} (${iface.id}): gateway não configurado.` });
      }
    }
  }

  for (const d of topology.devices) {
    for (const iface of d.interfaces) {
      if (iface.status === 'down') {
        findings.push({ severity: 'warning', text: `${d.name} (${iface.id}): interface desativada — reative em UP/DOWN.` });
      }
    }
    if (d.type === 'router' || d.type === 'firewall') {
      for (const r of d.config.routes) {
        if (!active.some(g => g.iface.ip === r.gateway)) {
          findings.push({
            severity: 'error',
            text: `${d.name}: a rota para ${r.destination} aponta para o gateway ${r.gateway}, que não é um IP ativo.`,
          });
        }
      }
      if (d.config.routes.length === 0) {
        findings.push({
          severity: 'info',
          text: `${d.name}: sem rotas estáticas cadastradas. Confira a tabela com 'route print'.`,
        });
      }
    }
  }

  return findings;
}