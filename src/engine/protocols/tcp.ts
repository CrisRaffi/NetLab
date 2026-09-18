import type { PacketLayer } from '../../types';

export type TcpFlag =
  | 'SYN'
  | 'SYN-ACK'
  | 'ACK'
  | 'PSH-ACK'
  | 'FIN-ACK'
  | 'RST';

export function buildTcpLayer(
  flags: TcpFlag,
  srcPort: number,
  dstPort: number,
  seq: number,
  ack: number,
  window = 64240,
): PacketLayer {
  const flagBits: Record<TcpFlag, string> = {
    SYN: '0x002 (SYN)',
    'SYN-ACK': '0x012 (SYN + ACK)',
    ACK: '0x010 (ACK)',
    'PSH-ACK': '0x018 (PSH + ACK)',
    'FIN-ACK': '0x011 (FIN + ACK)',
    RST: '0x004 (RST)',
  };
  return {
    name: 'TCP',
    protocol: 'TCP',
    fields: {
      'Porta de origem': String(srcPort),
      'Porta de destino': String(dstPort),
      'Flags': flagBits[flags],
      'Seq': String(seq),
      'Ack': String(ack),
      'Janela': String(window),
    },
  };
}