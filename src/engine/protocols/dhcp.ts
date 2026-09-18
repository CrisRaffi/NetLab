import type { PacketLayer } from '../../types';

export type DhcpMessage =
  | 'DISCOVER'
  | 'OFFER'
  | 'REQUEST'
  | 'ACK'
  | 'NAK'
  | 'RELEASE';

export function buildDhcpLayer(
  message: DhcpMessage,
  extra: Record<string, string> = {},
): PacketLayer {
  const types: Record<DhcpMessage, string> = {
    DISCOVER: '1 (DHCPDISCOVER)',
    OFFER: '2 (DHCPOFFER)',
    REQUEST: '3 (DHCPREQUEST)',
    ACK: '5 (DHCPACK)',
    NAK: '6 (DHCPNAK)',
    RELEASE: '7 (DHCPRELEASE)',
  };
  const xid = `0x${Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, '0')
    .toUpperCase()}`;
  return {
    name: 'DHCP',
    protocol: 'DHCP',
    fields: {
      'Tipo de mensagem': types[message],
      'Transaction ID': xid,
      ...extra,
      'Transporte': 'UDP porta 67 (servidor) / 68 (cliente)',
    },
  };
}