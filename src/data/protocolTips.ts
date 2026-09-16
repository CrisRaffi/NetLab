export const PROTOCOL_TIPS: Record<string, string> = {
  'HTTP': 'HyperText Transfer Protocol – transferência de páginas web',
  'HTTPS': 'HTTP Seguro – http sobre TLS (criptografado)',
  'TLS': 'Transport Layer Security – criptografa a conexão',
  'SSL': 'Secure Sockets Layer – protocolo antigo de criptografia (base do TLS)',
  'SMTP': 'Simple Mail Transfer Protocol – envio de e-mails',
  'DNS': 'Domain Name System – resolve nomes em IPs',
  'TCP/IP': 'Modelo em camadas da Internet (Transmission Control Protocol / Internet Protocol)',
  'LAN': 'Local Area Network – rede local',
  'WAN': 'Wide Area Network – rede de longa distância',
  'CIDR': 'Classless Inter-Domain Routing – notação de IP com prefixo (ex: /24)',
  'FTP': 'File Transfer Protocol – transferência de arquivos',
  'SNMP': 'Simple Network Management Protocol – gerência de rede',
  'SIP': 'Session Initiation Protocol – sinalização VoIP',
  'RPC': 'Remote Procedure Call – chamada de função remota',
  'NetBIOS': 'Network Basic Input/Output System – compartilhamento local',
  'MPEG': 'Moving Picture Experts Group – formato de vídeo',
  'JPEG': 'Joint Photographic Experts Group – formato de imagem',
  'TCP': 'Transmission Control Protocol – transporte confiável, com conexão',
  'UDP': 'User Datagram Protocol – transporte rápido, sem conexão',
  'IPv4': 'Internet Protocol versão 4 – endereço de 32 bits',
  'IPv6': 'Internet Protocol versão 6 – endereço de 128 bits',
  'ICMP': 'Internet Control Message Protocol – ping e erros',
  'Ethernet': 'Padrão de rede local com fio (undercabeçalho do quadro)',
  'Wi-Fi': 'Wireless Fidelity – rede sem fio (padrão IEEE 802.11)',
  '802.11': 'Família de padrões IEEE para redes sem fio',
  'ARP': 'Address Resolution Protocol – IP → MAC',
  'PDU': 'Protocol Data Unit – unidade de dados de cada camada',
  'OSI': 'Open Systems Interconnection – modelo de referência em 7 camadas',
  'IP': 'Internet Protocol – endereço lógico do dispositivo',
  'MAC': 'Media Access Control – endereço físico da placa de rede',
  'DHCP': 'Dynamic Host Configuration Protocol – IP automático',
  'NAT': 'Network Address Translation – tradução de endereços',
  'TTL': 'Time To Live – limitador de saltos do pacote',
  'RTT': 'Round Trip Time – tempo de ida e volta de um pacote',
  'MTU': 'Maximum Transmission Unit – maior quadro que a rede aceita',
  'VLAN': 'Virtual LAN – segmentação lógica da rede',
};

export function protocolTip(text: string | undefined): string | undefined {
  if (!text) return undefined;
  const exact = PROTOCOL_TIPS[text];
  if (exact) return exact;
  const found = Object.keys(PROTOCOL_TIPS).find((ac) =>
    new RegExp(`\\b${ac.replace(/[/.]/g, '.')}\\b`).test(text),
  );
  return found ? PROTOCOL_TIPS[found] : undefined;
}