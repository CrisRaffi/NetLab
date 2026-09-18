import type { Topology, SimulatedPacket, PacketLayer } from '../../types';
import { computeL2Neighbors } from './network';
import { ipv4Layer } from '../protocols/ipv4';

export interface NatInfo {
  deviceId: string;
  deviceName: string;
  publicIp: string;
  privateIp: string;
  publicIfaceId: string;
}

function isRfc1918(ip: string): boolean {
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  const match = ip.match(/^172\.(\d+)\./);
  return !!match && Number(match[1]) >= 16 && Number(match[1]) <= 31;
}

/**
 * Localiza o roteador/firewall com NAT de borda no caminho L3:
 * um equipamento com uma porta "pública" voltada para a Internet (cloud)
 * e uma porta privada (RFC 1918).
 */
export function findNatOnPath(topology: Topology, path: string[]): NatInfo | null {
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const l2 = computeL2Neighbors(topology);

  for (const id of path) {
    const device = deviceById.get(id);
    if (!device) continue;
    if (device.type !== 'router' && device.type !== 'firewall' && device.type !== 'core') continue;
    if (device.type === 'core') continue;

    const neighbors = l2.get(id) ?? new Set<string>();
    const hasCloudNeighbor = [...neighbors].some(nid => deviceById.get(nid)?.type === 'cloud');
    if (!hasCloudNeighbor) continue;

    const cloudLink = topology.connections.find(
      c =>
        (c.deviceId1 === id || c.deviceId2 === id) &&
        deviceById.get(c.deviceId1 === id ? c.deviceId2 : c.deviceId1)?.type === 'cloud',
    );
    if (!cloudLink) continue;
    const publicIfaceId = cloudLink.deviceId1 === id ? cloudLink.interfaceId1 : cloudLink.interfaceId2;
    const publicIface = device.interfaces.find(i => i.id === publicIfaceId && i.status === 'up' && i.ip);
    if (!publicIface) continue;

    const privateIface = device.interfaces.find(i => i.status === 'up' && i.ip && i.ip !== publicIface.ip && isRfc1918(i.ip));
    if (!privateIface) continue;

    return {
      deviceId: id,
      deviceName: device.name,
      publicIp: publicIface.ip!,
      privateIp: privateIface.ip!,
      publicIfaceId,
    };
  }

  return null;
}

function ipProtocolOf(packet: SimulatedPacket): 'ICMP' | 'TCP' | 'UDP' {
  if (packet.type === 'tcp') return 'TCP';
  if (packet.type === 'dns' || packet.type === 'dhcp' || packet.type === 'udp') return 'UDP';
  return 'ICMP';
}

function buildNatLayer(direction: 'outbound' | 'inbound', info: NatInfo, original: string): PacketLayer {
  return {
    name: 'NAT',
    protocol: 'NAT',
    fields:
      direction === 'outbound'
        ? {
            'Mecanismo': 'NAT/PAT',
            'IP privado': original,
            'Traduzido para': info.publicIp,
            'Equipamento': `${info.deviceName} (borda da rede)`,
            'Observação': 'Pacote reescrito ao cruzar a Internet',
          }
        : {
            'Mecanismo': 'NAT/PAT',
            'IP público': original,
            'Traduzido para': info.privateIp,
            'Equipamento': `${info.deviceName} (borda da rede)`,
            'Observação': 'Resposta traduzida de volta para a LAN',
          },
  };
}

/**
 * Reescreve o pacote simulando a tradução NAT/PAT no roteador de borda.
 */
export function translateForNat(
  packet: SimulatedPacket,
  direction: 'outbound' | 'inbound',
  info: NatInfo,
): SimulatedPacket {
  const proto = ipProtocolOf(packet);
  const originalIp = direction === 'outbound' ? packet.source.ip : packet.destination.ip;

  const sourceIp = direction === 'outbound' ? info.publicIp : packet.source.ip;
  const destIp = direction === 'inbound' ? info.privateIp : packet.destination.ip;

  const layers = packet.layers.map(layer =>
    layer.name === 'IPv4'
      ? ipv4Layer(sourceIp, destIp, proto, packet.ttl)
      : layer,
  );

  return {
    ...packet,
    source: { ...packet.source, ip: sourceIp },
    destination: { ...packet.destination, ip: destIp },
    layers: [...layers, buildNatLayer(direction, info, originalIp)],
  };
}