import type { PacketLayer } from '../../types';

export interface ArpEntry {
  ip: string;
  mac: string;
  interfaceName: string;
}

export function arpLayer(
  operation: 'Request' | 'Reply',
  senderMac: string,
  senderIp: string,
  targetMac: string,
  targetIp: string
): PacketLayer {
  return {
    name: 'ARP',
    protocol: 'ARP',
    fields: {
      'Operação': operation === 'Request' ? '1 (Request)' : '2 (Reply)',
      'MAC do remetente': senderMac,
      'IP do remetente': senderIp,
      'MAC do destino': targetMac,
      'IP do destino': targetIp,
    },
  };
}
