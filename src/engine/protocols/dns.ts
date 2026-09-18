import type { PacketLayer } from '../../types';

export interface DnsRecord {
  name: string;
  ip: string;
}

export interface DnsResolution {
  records: DnsRecord[];
  serverHostname?: string;
  serverIp?: string;
}

export function buildDnsLayer(
  operation: 'Query' | 'Response',
  question: string,
  type = 'A',
  answers: string[] = [],
): PacketLayer {
  return {
    name: 'DNS',
    protocol: 'DNS',
    fields: {
      'Operação': operation,
      'ID': '0x0B4F',
      'Pergunta': `${question} (${type})`,
      'Respostas': answers.length
        ? answers.join('\n')
        : '(nenhuma — NXDOMAIN)',
      'Transporte': 'UDP porta 53',
    },
  };
}