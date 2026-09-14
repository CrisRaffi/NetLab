import type { Topology, NetworkInterface, ValidationCheck } from '../../types';
import { getNetworkAddress, isSameSubnet } from '../../utils/ip';

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
    case 'missing-route': {
      device.config.routes = device.config.routes.filter(r => r.destination !== variant.routeDest);
      break;
    }
    case 'wrong-route': {
      device.config.routes = device.config.routes.map(r =>
        r.destination === variant.routeDest
          ? { ...r, gateway: variant.wrongRouteGateway ?? r.gateway }
          : r
      );
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
  const candidates = pool.filter(p => p.scenario.id !== excludeKey || p.variant.id !== excludeKey);
  const list = excludeKey && candidates.length > 0 ? candidates : pool;
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

function activeIfaces(topology: Topology): { deviceId: string; deviceName: string; iface: NetworkInterface }[] {
  return topology.devices.flatMap(d =>
    d.interfaces.filter(i => i.status === 'up').map(i => ({ deviceId: d.id, deviceName: d.name, iface: i }))
  );
}

export function diagnose(topology: Topology): DiagnosisFinding[] {
  const findings: DiagnosisFinding[] = [];
  const active = activeIfaces(topology);

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

  for (const { deviceName, iface } of active) {
    if (iface.ip && !iface.subnetMask) {
      findings.push({ severity: 'warning', text: `${deviceName} (${iface.id}): IP sem máscara de sub-rede definida.` });
    } else if (iface.ip && iface.subnetMask) {
      const network = getNetworkAddress(iface.ip, iface.subnetMask);
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
      } else {
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
    if ((d.type === 'router' || d.type === 'firewall') && d.config.routes.length === 0) {
      findings.push({
        severity: 'info',
        text: `${d.name}: sem rotas estáticas cadastradas. Confira a tabela com 'route print'.`,
      });
    }
  }

  return findings;
}