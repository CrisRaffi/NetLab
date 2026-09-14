import type { PacketLayer } from '../../types';

export const BROADCAST_MAC = 'FF:FF:FF:FF:FF:FF';

export function ethernetLayer(srcMac: string, dstMac: string, etherType: 'IPv4' | 'ARP'): PacketLayer {
  return {
    name: 'Ethernet II',
    protocol: 'Ethernet',
    fields: {
      'MAC de origem': srcMac,
      'MAC de destino': dstMac,
      'Tipo': etherType === 'IPv4' ? '0x0800 (IPv4)' : '0x0806 (ARP)',
    },
  };
}
