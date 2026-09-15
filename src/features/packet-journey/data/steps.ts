export interface EncapStep {
  id: 'dados' | 'tcp' | 'ip' | 'ethernet' | 'bits';
  title: string;
  pdu: string;
  accent: 'green' | 'blue' | 'purple' | 'yellow' | 'cyan';
  detail: string;
  fields: [string, string][];
}

export const ENCAP_ORDER: EncapStep['id'][] = ['dados', 'tcp', 'ip', 'ethernet', 'bits'];

export const ENCAP_STEPS: Record<EncapStep['id'], EncapStep> = {
  dados: {
    id: 'dados',
    title: 'DADOS',
    pdu: 'Dados',
    accent: 'green',
    detail: 'A informação pura, criada pela aplicação (camada 7).',
    fields: [['Mensagem', '"Olá servidor!"']],
  },
  tcp: {
    id: 'tcp',
    title: 'TCP',
    pdu: 'Segmento',
    accent: 'blue',
    detail: 'Transporte (camada 4): segmenta e identifica as portas da origem e do destino.',
    fields: [
      ['Porta origem', '51542'],
      ['Porta destino', '80'],
      ['Dados', '"Olá servidor!"'],
    ],
  },
  ip: {
    id: 'ip',
    title: 'IP',
    pdu: 'Pacote',
    accent: 'purple',
    detail: 'Rede (camada 3): adiciona os endereços lógicos — origem e destino do datagrama.',
    fields: [
      ['IP origem', '192.168.1.10'],
      ['IP destino', '192.168.1.20'],
      ['Protocolo', 'TCP'],
      ['Dados', 'TCP + dados'],
    ],
  },
  ethernet: {
    id: 'ethernet',
    title: 'ETHERNET',
    pdu: 'Quadro',
    accent: 'yellow',
    detail: 'Enlace (camada 2): adiciona os endereços físicos (MAC) para a entrega na rede local.',
    fields: [
      ['MAC origem', 'AA:BB:CC:01:02:03'],
      ['MAC destino', 'AA:BB:CC:04:05:06'],
      ['Conteúdo', 'IPv4 + TCP + dados'],
    ],
  },
  bits: {
    id: 'bits',
    title: 'BITS',
    pdu: 'Bits',
    accent: 'cyan',
    detail: 'Física (camada 1): tudo é convertido em sinais elétricos/ópticos que viajam pelo meio.',
    fields: [['Enquadramento', '0100101011000101 1011010010101100 ...']],
  },
};