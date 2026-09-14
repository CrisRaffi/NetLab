import type { PacketLayer } from '../../types';

export function ipv4Layer(srcIp: string, dstIp: string, protocol: 'ICMP' | 'TCP' | 'UDP', ttl: number): PacketLayer {
  return {
    name: 'IPv4',
    protocol: 'IPv4',
    fields: {
      'Versão': '4',
      'Tamanho do cabeçalho': '20 bytes',
      'TTL': String(ttl),
      'Protocolo': protocol === 'ICMP' ? '1 (ICMP)' : protocol === 'TCP' ? '6 (TCP)' : '17 (UDP)',
      'IP de origem': srcIp,
      'IP de destino': dstIp,
    },
  };
}

export function getIpClass(ip: string): 'A' | 'B' | 'C' | 'D' | 'E' {
  const first = Number(ip.split('.')[0]);
  if (first < 128) return 'A';
  if (first < 192) return 'B';
  if (first < 224) return 'C';
  if (first < 240) return 'D';
  return 'E';
}

export function isPrivateIp(ip: string): boolean {
  const n = ip.split('.').map(Number);
  if (n[0] === 10) return true;
  if (n[0] === 172 && n[1] >= 16 && n[1] <= 31) return true;
  if (n[0] === 192 && n[1] === 168) return true;
  return false;
}
