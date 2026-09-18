import type { SimulatedPacket, NetworkInterface, PacketLayer } from '../../types';
import { ethernetLayer, BROADCAST_MAC } from '../protocols/ethernet';
import { ipv4Layer } from '../protocols/ipv4';
import { arpLayer } from '../protocols/arp';
import { icmpLayer } from '../protocols/icmp';
import { buildTcpLayer, type TcpFlag } from '../protocols/tcp';
import { buildUdpLayer } from '../protocols/udp';
import { buildDnsLayer } from '../protocols/dns';
import { buildDhcpLayer } from '../protocols/dhcp';

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
}

function withPorts(
  packet: SimulatedPacket,
  srcPort: number,
  dstPort: number,
): SimulatedPacket {
  return {
    ...packet,
    source: { ...packet.source, port: srcPort },
    destination: { ...packet.destination, port: dstPort },
  };
}

export function buildArpRequest(iface: NetworkInterface, sourceIp: string, targetIp: string): SimulatedPacket {
  return {
    id: nextId('arp-req'),
    type: 'arp',
    source: { mac: iface.mac, ip: sourceIp },
    destination: { mac: BROADCAST_MAC, ip: targetIp },
    ttl: 1,
    layers: [ethernetLayer(iface.mac, BROADCAST_MAC, 'ARP'), arpLayer('Request', iface.mac, sourceIp, '00:00:00:00:00:00', targetIp)],
  };
}

export function buildArpReply(
  responder: NetworkInterface,
  responderIp: string,
  requesterMac: string,
  requesterIp: string
): SimulatedPacket {
  return {
    id: nextId('arp-rep'),
    type: 'arp',
    source: { mac: responder.mac, ip: responderIp },
    destination: { mac: requesterMac, ip: requesterIp },
    ttl: 1,
    layers: [ethernetLayer(responder.mac, requesterMac, 'ARP'), arpLayer('Reply', responder.mac, responderIp, requesterMac, requesterIp)],
  };
}

export function buildIcmpEcho(
  direction: 'request' | 'reply',
  srcMac: string,
  dstMac: string,
  srcIp: string,
  dstIp: string,
  ttl: number,
  sequence: number,
  identifier: number
): SimulatedPacket {
  const isRequest = direction === 'request';
  return {
    id: nextId(isRequest ? 'icmp-req' : 'icmp-rep'),
    type: 'icmp',
    source: { mac: srcMac, ip: srcIp },
    destination: { mac: dstMac, ip: dstIp },
    ttl,
    layers: [
      ethernetLayer(srcMac, dstMac, 'IPv4'),
      ipv4Layer(srcIp, dstIp, 'ICMP', ttl),
      icmpLayer(isRequest ? 'Echo Request' : 'Echo Reply', sequence, identifier),
    ],
  };
}

export function buildTcpSegment(
  flag: TcpFlag,
  srcMac: string,
  dstMac: string,
  srcIp: string,
  dstIp: string,
  srcPort: number,
  dstPort: number,
  seq: number,
  ack: number,
  extraLayers: PacketLayer[] = [],
): SimulatedPacket {
  const ttl = 64;
  return withPorts(
    {
      id: nextId('tcp'),
      type: 'tcp',
      source: { mac: srcMac, ip: srcIp },
      destination: { mac: dstMac, ip: dstIp },
      ttl,
      layers: [
        ethernetLayer(srcMac, dstMac, 'IPv4'),
        ipv4Layer(srcIp, dstIp, 'TCP', ttl),
        buildTcpLayer(flag, srcPort, dstPort, seq, ack),
        ...extraLayers,
      ],
    },
    srcPort,
    dstPort,
  );
}

export function buildDnsPacket(
  operation: 'Query' | 'Response',
  srcMac: string,
  dstMac: string,
  srcIp: string,
  dstIp: string,
  question: string,
  answers: string[],
  srcPort = 49300,
  _dstPort = 53,
): SimulatedPacket {
  const ttl = 64;
  const port = operation === 'Query' ? srcPort : 53;
  const dport = operation === 'Query' ? 53 : srcPort;
  const length = 48 + answers.join('').length;
  return {
    id: nextId(operation === 'Query' ? 'dns-q' : 'dns-r'),
    type: 'dns',
    source: { mac: srcMac, ip: srcIp, port },
    destination: { mac: dstMac, ip: dstIp, port: dport },
    ttl,
    layers: [
      ethernetLayer(srcMac, dstMac, 'IPv4'),
      ipv4Layer(srcIp, dstIp, 'UDP', ttl),
      buildUdpLayer(port, dport, length),
      buildDnsLayer(operation, question, 'A', answers),
    ],
  };
}

export interface DhcpOffer {
  ip: string;
  subnetMask: string;
  gateway: string;
  dns?: string;
  leaseTime: number;
  serverIp: string;
}

function dhcpBase(
  type: 'ipv4' | 'ethernet',
  srcMac: string,
  dstMac: string,
  srcIp: string,
  dstIp: string,
): { eth: ReturnType<typeof ethernetLayer>; ipv4: ReturnType<typeof ipv4Layer> } {
  return {
    eth: ethernetLayer(srcMac, dstMac, 'IPv4'),
    ipv4: ipv4Layer(srcIp, dstIp, 'UDP', 1),
  };
}

export function buildDhcpDiscover(clientMac: string): SimulatedPacket {
  const { eth, ipv4 } = dhcpBase('ethernet', clientMac, BROADCAST_MAC, '0.0.0.0', '255.255.255.255');
  return withPorts(
    {
      id: nextId('dhcp-disc'),
      type: 'dhcp',
      source: { mac: clientMac, ip: '0.0.0.0', port: 68 },
      destination: { mac: BROADCAST_MAC, ip: '255.255.255.255', port: 67 },
      ttl: 1,
      layers: [eth, ipv4, buildUdpLayer(68, 67, 44), buildDhcpLayer('DISCOVER')],
    },
    68,
    67,
  );
}

export function buildDhcpOffer(
  serverMac: string,
  serverIp: string,
  clientMac: string,
  offer: DhcpOffer,
): SimulatedPacket {
  const { eth, ipv4 } = dhcpBase('ethernet', serverMac, clientMac, serverIp, '255.255.255.255');
  const extra: Record<string, string> = {
    'IP oferecido': offer.ip,
    'Máscara de sub-rede': offer.subnetMask,
    'Gateway': offer.gateway,
    'Servidor DHCP': serverIp,
    'Lease': `${offer.leaseTime} s`,
  };
  if (offer.dns) extra['DNS'] = offer.dns;
  return withPorts(
    {
      id: nextId('dhcp-offer'),
      type: 'dhcp',
      source: { mac: serverMac, ip: serverIp, port: 67 },
      destination: { mac: clientMac, ip: '0.0.0.0', port: 68 },
      ttl: 1,
      layers: [eth, ipv4, buildUdpLayer(67, 68, 52), buildDhcpLayer('OFFER', extra)],
    },
    67,
    68,
  );
}

export function buildDhcpRequest(
  clientMac: string,
  requestedIp: string,
  serverIp: string,
): SimulatedPacket {
  const { eth, ipv4 } = dhcpBase('ethernet', clientMac, BROADCAST_MAC, '0.0.0.0', '255.255.255.255');
  return withPorts(
    {
      id: nextId('dhcp-req'),
      type: 'dhcp',
      source: { mac: clientMac, ip: '0.0.0.0', port: 68 },
      destination: { mac: BROADCAST_MAC, ip: '255.255.255.255', port: 67 },
      ttl: 1,
      layers: [
        eth,
        ipv4,
        buildUdpLayer(68, 67, 48),
        buildDhcpLayer('REQUEST', {
          'IP solicitado': requestedIp,
          'Servidor DHCP': serverIp,
        }),
      ],
    },
    68,
    67,
  );
}

export function buildDhcpAck(
  serverMac: string,
  serverIp: string,
  clientMac: string,
  offer: DhcpOffer,
): SimulatedPacket {
  const { eth, ipv4 } = dhcpBase('ethernet', serverMac, clientMac, serverIp, offer.ip);
  const extra: Record<string, string> = {
    'IP concedido': offer.ip,
    'Máscara de sub-rede': offer.subnetMask,
    'Gateway': offer.gateway,
    'Servidor DHCP': serverIp,
    'Lease': `${offer.leaseTime} s`,
  };
  if (offer.dns) extra['DNS'] = offer.dns;
  return withPorts(
    {
      id: nextId('dhcp-ack'),
      type: 'dhcp',
      source: { mac: serverMac, ip: serverIp, port: 67 },
      destination: { mac: clientMac, ip: offer.ip, port: 68 },
      ttl: 1,
      layers: [
        eth,
        ipv4,
        buildUdpLayer(67, 68, 52),
        buildDhcpLayer('ACK', extra),
      ],
    },
    67,
    68,
  );
}

export type { DhcpOffer as DhcpOfferType };