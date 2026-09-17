import type { DeviceType } from '../types';

export interface DeviceGuide {
  role: string;
  how: string;
  config: string[];
}

export const DEVICE_GUIDES: Record<DeviceType, DeviceGuide> = {
  pc: {
    role: 'Estação de trabalho / cliente final.',
    how: 'Envia e recebe dados. O IP identifica o host, a máscara define a rede local e o gateway é a porta de saída para outras redes.',
    config: [
      'Defina IP e máscara em Config → Interfaces',
      'Se for sair da rede local, informe o Gateway',
      'Teste com ping e ipconfig no console',
    ],
  },
  server: {
    role: 'Disponibiliza serviços (HTTP, DHCP, arquivos) para a rede.',
    how: 'Escuta por requisições. Exige IP fixo e deve permanecer sempre online.',
    config: [
      'Configure IP estático + máscara',
      'Ajuste o gateway se atender outras sub-redes',
      'Verifique o acesso com ping',
    ],
  },
  hub: {
    role: 'Repetidor de camada 1 (física): interliga dispositivos em um único domínio de colisão.',
    how: 'Ao receber um quadro em qualquer porta, replica os bits para TODAS as outras portas (flooding). Não aprende MAC, não filtra e não tem IP próprio — todo o tráfego chega a todos, e cada placa de rede descarta o que não lhe interessa.',
    config: [
      'Conecte PCs e servidores direto nas portas',
      'Não configura IP — só repete o sinal',
      'Todos compartilham a mesma banda (half-duplex)',
    ],
  },
  switch: {
    role: 'Interliga dispositivos da mesma rede (camada 2).',
    how: 'Encaminha quadros pelo endereço MAC, aprendendo a porta de cada dispositivo. Não precisa de IP para funcionar na LAN.',
    config: [
      'Conecte PCs e servidores nas portas',
      'Não configura IP — só distribui os quadros',
      'Confira o status das portas (UP/DOWN)',
    ],
  },
  router: {
    role: 'Interliga redes diferentes (camada 3) e faz roteamento.',
    how: 'Cada interface eth pertence a uma sub-rede; o wlan0 (WiFi) cria rede sem fio. Encaminha pacotes entre sub-redes usando rotas.',
    config: [
      'Dê um IP por sub-rede em cada interface',
      'O gateway dos clientes deve ser o IP do roteador',
      'Para outras redes, cadastre rotas em Config → Rotas',
    ],
  },
  access_point: {
    role: 'Estende a rede com conexão sem fio (WiFi).',
    how: 'Conecta por cabo ao switch/roteador e distribui acesso wireless aos clientes. O rádio WiFi aceita vários clientes ao mesmo tempo.',
    config: [
      'Ligue por cabo a um switch ou roteador',
      'Defina IP na mesma rede dos demais',
      'Conecte clientes usando o modo WiFi',
    ],
  },
  firewall: {
    role: 'Controla o tráfego entre redes (segurança).',
    how: 'Inspeciona os pacotes que passam entre suas interfaces e bloqueia o que violar as regras.',
    config: [
      'Uma interface na rede interna e outra na externa',
      'Configure IP em cada interface',
      'Cadastre rotas para encaminhar entre as redes',
    ],
  },
  printer: {
    role: 'Impressora compartilhada na rede.',
    how: 'Recebe trabalhos de impressão enviados por outros hosts via IP.',
    config: ['Defina IP fixo na rede', 'Teste conectividade com ping'],
  },
  ip_camera: {
    role: 'Câmera de vigilância IP.',
    how: 'Transmite vídeo pela rede usando endereço IP próprio.',
    config: ['Defina IP fixo na rede', 'Teste conectividade com ping'],
  },
  ip_phone: {
    role: 'Telefone sobre IP (VoIP).',
    how: 'Realiza chamadas pela rede usando o IP como identidade.',
    config: ['Defina IP fixo na rede', 'Teste conectividade com ping'],
  },
  cloud: {
    role: 'Rede externa (Internet/nuvem).',
    how: 'Representa a Internet: o ponto de saída da sua rede para o mundo exterior. Servidores na nuvem respondem por IP próprio.',
    config: ['Representa a Internet — não precisa configurar'],
  },
  core: {
    role: 'Roteador que interliga várias sub-redes automaticamente.',
    how: 'Cada interface eth conecta a uma rede diferente (LAN, DMZ, WiFi, WAN). O IP colocado numa interface vira o gateway daquela sub-rede e o roteamento entre elas é feito sozinho — sem precisar cadastrar rotas.',
    config: [
      'Conecte cada interface a uma rede diferente',
      'Configure IP em cada interface (ex: 192.168.1.1/24, 192.168.2.1/24)',
      'Os dispositivos das redes usarão esses IPs como gateway',
      'Não precisa configurar rotas — o roteamento é automático',
    ],
  },
};