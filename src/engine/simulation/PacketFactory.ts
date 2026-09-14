import type { SimulatedPacket, NetworkInterface } from '../../types';
import { ethernetLayer, BROADCAST_MAC } from '../protocols/ethernet';
import { ipv4Layer } from '../protocols/ipv4';
import { arpLayer } from '../protocols/arp';
import { icmpLayer } from '../protocols/icmp';

let idCounter = 0;
function nextId(prefix: string) {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}`;
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
