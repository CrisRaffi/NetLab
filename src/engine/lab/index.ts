import type { Topology, Device, NetworkInterface, Connection, Route, DeviceType } from '../../types';
import { ping, buildIpIndex } from '../simulation/network';
import { executeCommand } from '../commands';
import type { ArpEntry } from '../protocols/arp';

export interface CheckResult {
  description: string;
  passed: boolean;
  details?: string;
}

export interface LabValidation {
  passed: boolean;
  total: number;
  passedCount: number;
  results: CheckResult[];
}

export interface ValidationContext {
  arpTables?: Record<string, ArpEntry[]>;
}

const ETH_IFACE_COUNT: Record<string, number> = {
  pc: 1,
  server: 1,
  hub: 8,
  switch: 8,
  router: 2,
  access_point: 1,
  firewall: 2,
  printer: 1,
  ip_camera: 1,
  ip_phone: 1,
  cloud: 1,
  core: 6,
};

const HEX = '0123456789ABCDEF';

function makeIface(id: string, deviceIndex: number, portIndex: number, isSwitch: boolean): NetworkInterface {
  return {
    id,
    name: isSwitch ? `FastEthernet0/${portIndex + 1}` : id,
    type: 'ethernet',
    mac: `AA:BB:CC:${HEX[(deviceIndex >> 4) % 16]}${HEX[deviceIndex % 16]}:${HEX[(portIndex >> 4) % 16]}${HEX[portIndex % 16]}:00`,
    status: 'up',
    speed: 100,
  };
}

const VALID_DEVICE_TYPES = new Set<DeviceType>([
  'pc',
  'server',
  'hub',
  'switch',
  'router',
  'access_point',
  'firewall',
  'printer',
  'ip_camera',
  'ip_phone',
  'cloud',
  'core',
]);

const FALLBACK_DEVICE_TYPE: DeviceType = 'switch';

export function normalizeTopology(topo: Topology): Topology {
  const devices = topo.devices.map((device, deviceIndex) => {
    const type: DeviceType = VALID_DEVICE_TYPES.has(device.type)
      ? device.type
      : FALLBACK_DEVICE_TYPE;

    const usedInterfaceIds = topo.connections.flatMap(c => [
      { deviceId: c.deviceId1, ifaceId: c.interfaceId1 },
      { deviceId: c.deviceId2, ifaceId: c.interfaceId2 },
    ]).filter(x => x.deviceId === device.id).map(x => x.ifaceId);

    const existing = device.interfaces.map(i => ({
      ...i,
      status: i.status ?? ('up' as const),
      speed: i.speed ?? 100,
      type: i.type ?? ('ethernet' as const),
    }));
    const have = new Set(existing.map(i => i.id));

    const isSwitch = type === 'switch';
    let portIndex = existing.length;
    for (const id of usedInterfaceIds) {
      if (!have.has(id)) {
        existing.push(makeIface(id, deviceIndex, portIndex, isSwitch));
        have.add(id);
        portIndex++;
      }
    }

    const needed = Math.max(ETH_IFACE_COUNT[type] ?? 1, usedInterfaceIds.length);
    for (let n = existing.length; n < needed; n++) {
      const id = n === 0 ? 'eth0' : `eth${n}`;
      existing.push(makeIface(id, deviceIndex, n, isSwitch));
      have.add(id);
    }

    return { ...device, type, interfaces: existing };
  });

  const connections = topo.connections.map(c => ({
    ...c,
    type: c.type ?? ('ethernet' as const),
    status: c.status ?? ('connected' as const),
    bandwidth: c.bandwidth ?? 100,
    latency: c.latency ?? 1,
  })) satisfies Connection[];

  return { ...topo, devices, connections, blocks: topo.blocks ?? [] };
}

function findDevice(topology: Topology, ref: string): Device | undefined {
  return (
    topology.devices.find(d => d.id === ref) ??
    topology.devices.find(d => d.name === ref) ??
    topology.devices.find(d => d.config.hostname === ref)
  );
}

function configValue(device: Device, ifaceId: string, field: string): string | undefined {
  const iface = device.interfaces.find(i => i.id === ifaceId);
  if (!iface) return undefined;
  switch (field) {
    case 'ip':
      return iface.ip;
    case 'mask':
    case 'subnetmask':
      return iface.subnetMask;
    case 'gateway':
      return iface.gateway;
    case 'dns':
      return iface.dns;
    case 'mac':
      return iface.mac;
    case 'status':
      return iface.status;
    default:
      return undefined;
  }
}

function checkConfig(topology: Topology, check: { target?: string; expected?: unknown; description: string }): CheckResult {
  const parts = check.target?.split('/') ?? [];
  const deviceRef = parts[0];
  const ifaceId = parts[1];
  const field = (parts[2] ?? 'ip').toLowerCase();
  const device = findDevice(topology, deviceRef ?? '');
  if (!device || !ifaceId) {
    return { description: check.description, passed: false, details: `Não encontrei ${check.target}.` };
  }
  const actual = configValue(device, ifaceId, field) ?? '';
  const expected = typeof check.expected === 'string' ? check.expected.toLowerCase() : undefined;
  if (expected === undefined) {
    const cleared = actual === '';
    return { description: check.description, passed: cleared, details: cleared ? undefined : `esperava campo vazio, encontrei ${actual || '(vazio)'}` };
  }
  const passed = actual.toLowerCase() === expected;
  return { description: check.description, passed, details: passed ? undefined : `esperava ${expected}, encontrei ${actual || '(vazio)'}` };
}

function resolveHostIp(topology: Topology, ref: string): string | undefined {
  const device = findDevice(topology, ref);
  if (!device) return undefined;
  return (
    device.interfaces.find(i => i.status === 'up' && i.ip)?.ip ??
    device.interfaces.find(i => i.ip)?.ip
  );
}

function checkConnectivity(topology: Topology, check: { target?: string; expected?: unknown; description: string }): CheckResult {
  const parts = (check.target ?? '').split(/->/).map(s => s.trim());
  const source = parts[0] ?? '';
  const dest = parts[1] ?? '';
  const sourceDevice = findDevice(topology, source);
  if (!sourceDevice) {
    return { description: check.description, passed: false, details: `Fonte ${source} não encontrada.` };
  }
  const destIp =
    dest.includes('.') && /^\d+\.\d+\.\d+\.\d+$/.test(dest)
      ? dest
      : resolveHostIp(topology, dest);
  if (!destIp) {
    return { description: check.description, passed: false, details: `Destino ${dest} sem endereço IP configurado.` };
  }
  const result = ping(topology, sourceDevice.id, destIp);
  const wantSuccess = check.expected === 'success';
  const passed = result.success === wantSuccess;
  const details = result.success
    ? undefined
    : (result.output.find(l => l.startsWith('Resposta'))
        ?? result.output[1]
        ?? 'Falha geral.');
  return { description: check.description, passed, details };
}

function checkTopology(topology: Topology, check: { target?: string; expected?: unknown; description: string }): CheckResult {
  const target = check.target ?? '';
  const wantTruthy = check.expected !== false && check.expected !== 0;
  let found = false;
  let detail: string | undefined;

  if (target.startsWith('device-type:')) {
    const type = target.split(':')[1]!;
    found = topology.devices.some(d => d.type === type);
    detail = foundedDevices(topology, type);
  } else if (target.startsWith('device:')) {
    found = !!findDevice(topology, target.slice(7));
  } else if (target.startsWith('ip:')) {
    const ip = target.slice(3);
    found = [...buildIpIndex(topology).values()].some(e => e.iface.status === 'up' && e.iface.ip === ip);
    if (!found) detail = `Nenhum equipamento com IP ${ip} ativo.`;
  } else if (target.startsWith('gateway:')) {
    const gw = target.slice(8);
    found = topology.devices.some(d => d.interfaces.some(i => i.gateway === gw));
  } else if (target.startsWith('connection:')) {
    const [, a, b] = target.split(':');
    const da = findDevice(topology, a);
    const db = findDevice(topology, b);
    if (da && db) {
      found = topology.connections.some(
        c =>
          (c.deviceId1 === da.id && c.deviceId2 === db.id) ||
          (c.deviceId1 === db.id && c.deviceId2 === da.id)
      );
    }
    if (!found) detail = `Nenhum cabo conectando ${a} e ${b}.`;
  }

  const desired = wantTruthy ? 'presente' : 'ausente';
  const passed = found === wantTruthy;
  return {
    description: check.description,
    passed,
    details: passed ? undefined : detail ?? `Esperava item ${desired} (${target}).`,
  };
}

function foundedDevices(topology: Topology, type: string): string | undefined {
  const devices = topology.devices.filter(d => d.type === type);
  return devices.length === 0 ? 'Nenhum equipamento desse tipo encontrado.' : undefined;
}

function checkCommandOutput(
  topology: Topology,
  check: { target?: string; expected?: unknown; description: string }
): CheckResult {
  const [deviceRef, command] = (check.target ?? '').split('|').map(s => s.trim());
  const device = findDevice(topology, deviceRef ?? '');
  if (!device || !command) {
    return { description: check.description, passed: false, details: 'Formato inválido: deviceId|comando' };
  }
  const result = executeCommand(command, {
    topology,
    deviceId: device.id,
    arpTable: [],
  });
  const output = result.output.join('\n');
  const expected =
    typeof check.expected === 'string'
      ? { contains: check.expected }
      : (check.expected as { contains?: string; notContains?: string } | undefined) ?? {};
  const notMatches = expected.notContains ? output.includes(expected.notContains) : false;
  const matches = expected.contains ? output.includes(expected.contains) : true;
  const passed = matches && !notMatches;
  return {
    description: check.description,
    passed,
    details: passed
      ? undefined
      : `Saída não contém "${expected.contains ?? ''}"${expected.notContains ? ` ou contém "${expected.notContains}"` : ''}.`,
  };
}

function checkArp(
  ctx: ValidationContext,
  check: { target?: string; expected?: unknown; description: string }
): CheckResult {
  const deviceId = check.target;
  const ip = typeof check.expected === 'string' ? check.expected : '';
  const table = (deviceId && ctx.arpTables?.[deviceId]) || [];
  const found = table.some(e => e.ip === ip);
  return {
    description: check.description,
    passed: found,
    details: found ? undefined : `Nenhuma entrada ARP para ${ip} em ${deviceId}. Faça um ping primeiro.`,
  };
}

function checkRoute(topology: Topology, check: { target?: string; expected?: unknown; description: string }): CheckResult {
  const [deviceRef, network] = (check.target ?? '').split('|').map(s => s.trim());
  const device = findDevice(topology, deviceRef ?? '');
  if (!device || !network) {
    return { description: check.description, passed: false, details: 'Formato inválido: deviceId|rede' };
  }
  const expectedGateway = typeof check.expected === 'string' ? check.expected : undefined;
  const match = device.config.routes.find(r => r.destination === network && (expectedGateway === undefined || r.gateway === expectedGateway));
  return {
    description: check.description,
    passed: !!match,
    details: match ? undefined : `Rota para ${network}${expectedGateway ? ` via ${expectedGateway}` : ''} não encontrada em ${device?.name ?? deviceRef}.`,
  };
}

export function runValidation(
  topology: Topology,
  checks: { type: string; target?: string; expected?: unknown; description: string }[],
  ctx: ValidationContext = {}
): LabValidation {
  const results: CheckResult[] = checks.map(check => {
    switch (check.type) {
      case 'config':
        return checkConfig(topology, check);
      case 'connectivity':
        return checkConnectivity(topology, check);
      case 'topology':
        return checkTopology(topology, check);
      case 'command_output':
        return checkCommandOutput(topology, check);
      case 'arp':
        return checkArp(ctx, check);
      case 'route':
        return checkRoute(topology, check);
      default:
        return { description: check.description, passed: false, details: `Tipo de validação desconhecido: ${check.type}` };
    }
  });

  return {
    passed: results.every(r => r.passed),
    total: results.length,
    passedCount: results.filter(r => r.passed).length,
    results,
  };
}

export function normalizeRoutes(routes: Route[]): Route[] {
  return routes.map(r => ({
    destination: r.destination.trim(),
    gateway: r.gateway.trim(),
    mask: r.mask.trim() || '255.255.255.0',
    metric: r.metric ?? 1,
    interfaceName: r.interfaceName ?? '',
  }));
}