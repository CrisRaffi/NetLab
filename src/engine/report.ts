import type { Topology, Device, Connection, NetworkInterface } from '../types';
import { getNetworkAddress, maskToCidr, isValidIp } from '../utils/ip';

interface SubnetMember {
  deviceId: string;
  deviceName: string;
  interfaceName: string;
  ip: string;
  isGateway: boolean;
}

interface SubnetReport {
  network: string;
  mask: string;
  cidr: number;
  members: SubnetMember[];
}

interface LeaseReport {
  deviceId: string;
  deviceName: string;
  interfaceId: string;
  ip: string;
  serverId: string;
  serverName: string;
  leaseTime: number;
}

export interface NetworkReport {
  format: 'netlab-network-report';
  version: 1;
  generatedAt: string;
  topology: {
    id: string;
    name: string;
    deviceCount: number;
    connectionCount: number;
  };
  summary: {
    devices: number;
    connections: number;
    interfacesWithIp: number;
    subnets: number;
    leases: number;
    ips: string[];
  };
  devices: Array<{
    id: string;
    type: Device['type'];
    name: string;
    hostname: string;
    position: { x: number; y: number };
    interfaces: Array<{
      name: string;
      type: NetworkInterface['type'];
      mac: string;
      ip: string | null;
      subnetMask: string | null;
      gateway: string | null;
      dns: string | null;
      vlan: number | null;
      status: NetworkInterface['status'];
      speed: number;
    }>;
    dhcp: Device['config']['dhcp'] | null;
    dnsRecords: Device['config']['dnsRecords'] | null;
    routes: Device['config']['routes'];
  }>;
  connections: Array<{
    id: string;
    type: Connection['type'];
    status: Connection['status'];
    bandwidth: number;
    latency: number;
    device1: { id: string; name: string };
    iface1: { name: string; vlan: number | null };
    device2: { id: string; name: string };
    iface2: { name: string; vlan: number | null };
    effectiveVlan: number | 'blocked';
  }>;
  dhcpLeases: LeaseReport[];
  subnets: SubnetReport[];
}

const effVlan = (v: number): number => (v > 0 ? v : 1);

function linkEffectiveVlan(
  aVlan: number | undefined,
  bVlan: number | undefined,
): number | 'blocked' {
  const a = aVlan ?? 0;
  const b = bVlan ?? 0;
  if (a > 0 && b > 0 && a !== b) return 'blocked';
  return Math.max(effVlan(a), effVlan(b));
}

function deviceEntry(device: Device) {
  return {
    id: device.id,
    type: device.type,
    name: device.name,
    hostname: device.config.hostname,
    position: { x: device.position.x, y: device.position.y },
    interfaces: device.interfaces.map(i => ({
      name: i.name,
      type: i.type,
      mac: i.mac,
      ip: i.ip ?? null,
      subnetMask: i.subnetMask ?? null,
      gateway: i.gateway ?? null,
      dns: i.dns ?? null,
      vlan: i.vlan ?? null,
      status: i.status,
      speed: i.speed,
    })),
    dhcp: device.config.dhcp ?? null,
    dnsRecords: device.config.dnsRecords ?? null,
    routes: device.config.routes,
  };
}

function buildSubnets(topology: Topology): SubnetReport[] {
  const gateways = new Set<string>();
  for (const d of topology.devices) {
    for (const i of d.interfaces) if (i.gateway && isValidIp(i.gateway)) gateways.add(i.gateway);
  }

  const byNetwork = new Map<string, SubnetReport>();
  for (const d of topology.devices) {
    for (const i of d.interfaces) {
      if (!i.ip || !i.subnetMask || !isValidIp(i.ip)) continue;
      const network = getNetworkAddress(i.ip, i.subnetMask);
      const cidr = maskToCidr(i.subnetMask);
      const key = `${network}/${cidr}`;
      if (!byNetwork.has(key)) {
        byNetwork.set(key, { network, mask: i.subnetMask, cidr, members: [] });
      }
      byNetwork.get(key)!.members.push({
        deviceId: d.id,
        deviceName: d.name,
        interfaceName: i.name,
        ip: i.ip,
        isGateway: gateways.has(i.ip),
      });
    }
  }
  return [...byNetwork.values()].sort((a, b) => a.network.localeCompare(b.network));
}

export function buildNetworkReport(
  topology: Topology,
  leases: Array<{
    deviceId: string;
    deviceName: string;
    interfaceId: string;
    ip: string;
    serverId: string;
    serverName: string;
    leaseTime: number;
  }> = [],
): NetworkReport {
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));

  const connections = topology.connections.map(c => {
    const d1 = deviceById.get(c.deviceId1);
    const d2 = deviceById.get(c.deviceId2);
    const i1 = d1?.interfaces.find(i => i.id === c.interfaceId1);
    const i2 = d2?.interfaces.find(i => i.id === c.interfaceId2);
    return {
      id: c.id,
      type: c.type,
      status: c.status,
      bandwidth: c.bandwidth,
      latency: c.latency,
      device1: { id: c.deviceId1, name: d1?.name ?? c.deviceId1 },
      iface1: { name: i1?.name ?? c.interfaceId1, vlan: i1?.vlan ?? null },
      device2: { id: c.deviceId2, name: d2?.name ?? c.deviceId2 },
      iface2: { name: i2?.name ?? c.interfaceId2, vlan: i2?.vlan ?? null },
      effectiveVlan: linkEffectiveVlan(i1?.vlan, i2?.vlan),
    };
  });

  const ips: string[] = [];
  for (const d of topology.devices) {
    for (const i of d.interfaces) if (i.ip && isValidIp(i.ip)) ips.push(i.ip);
  }

  return {
    format: 'netlab-network-report',
    version: 1,
    generatedAt: new Date().toISOString(),
    topology: {
      id: topology.id,
      name: topology.name,
      deviceCount: topology.devices.length,
      connectionCount: topology.connections.length,
    },
    summary: {
      devices: topology.devices.length,
      connections: topology.connections.length,
      interfacesWithIp: ips.length,
      subnets: new Set(ips.map(ip => {
        const d = [...topology.devices.flatMap(x => x.interfaces.filter(i => i.ip === ip))];
        const iface = d[0];
        return iface?.subnetMask ? `${getNetworkAddress(ip, iface.subnetMask)}/${maskToCidr(iface.subnetMask)}` : '?';
      })).size,
      leases: leases.length,
      ips,
    },
    devices: topology.devices.map(deviceEntry),
    connections,
    dhcpLeases: leases,
    subnets: buildSubnets(topology),
  };
}

export function downloadNetworkReport(report: NetworkReport): void {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `netlab-rede-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}