import type { PacketLayer } from '../../types';

export function buildHttpLayer(
  command: 'GET' | 'Reply',
  url: string,
  extra: Record<string, string> = {},
): PacketLayer {
  return {
    name: 'HTTP',
    protocol: 'HTTP',
    fields:
      command === 'GET'
        ? {
            'Requisição': `GET ${url} HTTP/1.1`,
            'Host': url,
            'Conexão': 'keep-alive',
            ...extra,
          }
        : {
            'Resposta': 'HTTP/1.1 200 OK',
            'Servidor': 'nginx/1.24 (simulado)',
            'Conteúdo': 'HTML',
            ...extra,
          },
  };
}