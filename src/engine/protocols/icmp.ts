import type { PacketLayer } from '../../types';

export function icmpLayer(type: 'Echo Request' | 'Echo Reply', sequence: number, identifier: number): PacketLayer {
  return {
    name: 'ICMP',
    protocol: 'ICMP',
    fields: {
      'Tipo': type === 'Echo Request' ? '8 (Echo Request)' : '0 (Echo Reply)',
      'Código': '0',
      'Identificador': `0x${identifier.toString(16).padStart(4, '0')}`,
      'Sequência': String(sequence),
      'Dados': '32 bytes',
    },
  };
}
