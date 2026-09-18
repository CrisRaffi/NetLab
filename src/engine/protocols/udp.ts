import type { PacketLayer } from '../../types';

export function buildUdpLayer(
  srcPort: number,
  dstPort: number,
  length: number,
): PacketLayer {
  return {
    name: 'UDP',
    protocol: 'UDP',
    fields: {
      'Porta de origem': String(srcPort),
      'Porta de destino': String(dstPort),
      'Tamanho': `${length} bytes`,
    },
  };
}