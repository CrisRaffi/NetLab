import type { Exercise, NetworkInterface, Device, Connection, Route, DeviceType } from '../../types';

function iface(id: string, ip?: string, opts: { mask?: string; gw?: string; dns?: string } = {}): NetworkInterface {
  const mac = 'AA:BB:CC:DE' + ':' + String(id.charCodeAt(0) + id.length)
    .padStart(2, '0')
    .slice(-2);
  return {
    id,
    name: id,
    type: 'ethernet',
    mac,
    ip: ip ?? undefined,
    subnetMask: opts.mask,
    gateway: opts.gw,
    dns: opts.dns,
    status: 'up',
    speed: 100,
  };
}

function device(id: string, type: DeviceType, name: string, x: number, y: number, interfaces: NetworkInterface[], routes: Route[] = []): Device {
  return {
    id,
    type,
    name,
    position: { x, y },
    interfaces,
    config: { hostname: name, routes },
  };
}

function conn(a: string, ia: string, b: string, ib: string): Connection {
  return {
    id: `conn-${a}-${b}`,
    deviceId1: a,
    interfaceId1: ia,
    deviceId2: b,
    interfaceId2: ib,
    type: 'ethernet',
    status: 'connected',
    bandwidth: 100,
    latency: 1,
  };
}

export const LAB_01_FIRST_NETWORK: Exercise = {
  id: 'lab-01-first-network',
  title: 'Minha Primeira Rede',
  description: 'Conecte dois computadores e configure-os para que consigam se comunicar. Este é o primeiro passo no mundo das redes.',
  difficulty: 1,
  category: 'configuration',
  concepts: ['networking-basics', 'ethernet-basics', 'ipv4-basics'],
  prerequisites: [],
  initialTopology: {
    id: 'topo-01',
    name: 'Minha Primeira Rede',
    devices: [
      device('pc1', 'pc', 'PC-01', 120, 160, [iface('eth0')]),
      device('pc2', 'pc', 'PC-02', 400, 160, [iface('eth0')]),
    ],
    connections: [
      conn('pc1', 'eth0', 'pc2', 'eth0'),
    ],
  },
  objective: 'Configure PC-01 com IP 192.168.1.10 e PC-02 com IP 192.168.1.20, ambos com máscara 255.255.255.0. Depois faça um ping de PC-01 para PC-02.',
  hints: [
    { level: 1, text: 'Comece verificando a configuração IP dos computadores com o comando ipconfig.' },
    { level: 2, text: 'Os dois computadores precisam estar na mesma rede. Compare os IPs e a máscara de sub-rede.' },
    { level: 3, text: 'PC-01 deve ter IP 192.168.1.10 e PC-02 deve ter IP 192.168.1.20, ambos com máscara 255.255.255.0.' },
  ],
  solution: {
    explanation: 'Dois computadores em uma mesma sub-rede (192.168.1.0/24) conseguem se comunicar diretamente, pois a máscara 255.255.255.0 garante que ambos pertencem à mesma rede. O ping usa ICMP Echo Request/Reply para testar a conectividade.',
    steps: [
      'Selecione PC-01 e configure eth0 com IP 192.168.1.10 e máscara 255.255.255.0',
      'Selecione PC-02 e configure eth0 com IP 192.168.1.20 e máscara 255.255.255.0',
      'Abra o console de PC-01 e execute: ping 192.168.1.20',
    ],
    commands: ['ipconfig', 'ping 192.168.1.20'],
  },
  validation: [
    { type: 'config', target: 'pc1/eth0/ip', expected: '192.168.1.10', description: 'PC-01 deve ter IP 192.168.1.10' },
    { type: 'config', target: 'pc2/eth0/ip', expected: '192.168.1.20', description: 'PC-02 deve ter IP 192.168.1.20' },
    { type: 'config', target: 'pc1/eth0/subnetMask', expected: '255.255.255.0', description: 'Máscara de PC-01 deve ser 255.255.255.0' },
    { type: 'connectivity', target: 'pc1 -> pc2', expected: 'success', description: 'PC-01 deve conseguir fazer ping em PC-02' },
  ],
  xpReward: 50,
  estimatedTime: 10,
};

export const LAB_02_SUBNETS_DIFFERENT: Exercise = {
  id: 'lab-02-subnets-different',
  title: 'Redes Diferentes',
  description: 'Os dois computadores não conseguem se comunicar. Investigue o problema e descubra por quê.',
  difficulty: 2,
  category: 'troubleshooting',
  concepts: ['subnet-mask', 'ipv4-basics', 'gateway'],
  prerequisites: ['lab-01-first-network'],
  initialTopology: {
    id: 'topo-02',
    name: 'Redes Diferentes',
    devices: [
      {
        id: 'pc1',
        type: 'pc',
        name: 'PC-01',
        position: { x: 120, y: 160 },
        interfaces: [iface('eth0', '192.168.10.50', { mask: '255.255.255.0' })],
        config: { hostname: 'PC-01', routes: [] },
      },
      {
        id: 'pc2',
        type: 'pc',
        name: 'PC-02',
        position: { x: 400, y: 160 },
        interfaces: [iface('eth0', '192.168.20.50', { mask: '255.255.255.0' })],
        config: { hostname: 'PC-02', routes: [] },
      },
    ],
    connections: [conn('pc1', 'eth0', 'pc2', 'eth0')],
  },
  objective: 'Descubra por que PC-01 não consegue fazer ping em PC-02 (192.168.20.50) e resolva o problema adicionando um roteador como gateway.',
  hints: [
    { level: 1, text: 'Use o comando ipconfig em ambos os computadores para ver as configurações.' },
    { level: 2, text: 'Compare os IPs e as máscaras. As máscaras são iguais, mas o terceiro octeto dos IPs é diferente. Isso significa algo?' },
    { level: 3, text: 'Adicione um roteador entre os dois PCs. Configure ele com IPs 192.168.10.1 e 192.168.20.1 e aponte os gateways dos PCs para esses IPs.' },
  ],
  solution: {
    explanation: 'PC-01 (192.168.10.50/24) está na rede 192.168.10.0/24. PC-02 (192.168.20.50/24) está na rede 192.168.20.0/24. Computadores só conseguem se comunicar diretamente se estiverem na mesma sub-rede. Para redes diferentes, é necessário um roteador configurado como gateway.',
    steps: [
      'Verifique a configuração dos dois PCs com ipconfig',
      'Identifique que PC-01 está em 192.168.10.0/24 e PC-02 em 192.168.20.0/24',
      'Adicione um roteador entre os dois PCs e conecte-o aos dois switches existentes',
      'Configure o roteador com interfaces 192.168.10.1 e 192.168.20.1',
      'Configure o gateway de PC-01 como 192.168.10.1 e de PC-02 como 192.168.20.1',
      'Teste o ping de PC-01 para 192.168.20.50',
    ],
    commands: ['ipconfig', 'ping 192.168.20.50', 'route print'],
  },
  validation: [
    { type: 'topology', target: 'device-type:router', expected: true, description: 'Deve existir um roteador na rede' },
    { type: 'config', target: 'pc1/eth0/gateway', expected: '192.168.10.1', description: 'Gateway de PC-01 deve ser 192.168.10.1' },
    { type: 'config', target: 'pc2/eth0/gateway', expected: '192.168.20.1', description: 'Gateway de PC-02 deve ser 192.168.20.1' },
    { type: 'connectivity', target: 'pc1 -> 192.168.20.50', expected: 'success', description: 'PC-01 deve conseguir fazer ping em 192.168.20.50' },
  ],
  xpReward: 75,
  estimatedTime: 15,
};

export const LAB_03_GATEWAY: Exercise = {
  id: 'lab-03-gateway',
  title: 'Gateway Incorreto',
  description: 'O computador consegue acessar dispositivos da própria rede, mas não consegue sair para outras redes. Encontre o problema.',
  difficulty: 3,
  category: 'troubleshooting',
  concepts: ['gateway', 'routing-basics', 'ipv4-basics'],
  prerequisites: ['lab-02-subnets-different'],
  initialTopology: {
    id: 'topo-03',
    name: 'Gateway Incorreto',
    devices: [
      {
        id: 'pc1',
        type: 'pc',
        name: 'PC-01',
        position: { x: 120, y: 200 },
        interfaces: [iface('eth0', '192.168.1.10', { mask: '255.255.255.0', gw: '192.168.1.254' })],
        config: { hostname: 'PC-01', routes: [] },
      },
      device('switch1', 'switch', 'SW-01', 260, 200, []),
      device('router1', 'router', 'R-01', 400, 200, [
        iface('eth0', '192.168.1.1', { mask: '255.255.255.0' }),
        iface('eth1', '10.0.0.1', { mask: '255.255.255.0' }),
      ]),
      {
        id: 'server1',
        type: 'server',
        name: 'SRV-01',
        position: { x: 550, y: 200 },
        interfaces: [iface('eth0', '10.0.0.50', { mask: '255.255.255.0', gw: '10.0.0.1' })],
        config: { hostname: 'SRV-01', routes: [] },
      },
    ],
    connections: [
      conn('pc1', 'eth0', 'switch1', 'f0/1'),
      conn('switch1', 'f0/2', 'router1', 'eth0'),
      conn('router1', 'eth1', 'server1', 'eth0'),
    ],
  },
  objective: 'PC-01 consegue pingar o servidor? Descubra o motivo da falha e resolva.',
  hints: [
    { level: 1, text: 'Verifique a configuração de gateway de PC-01 com ipconfig.' },
    { level: 2, text: 'O gateway do PC-01 deve ser o IP do roteador na rede do PC. Qual interface do roteador está na rede 192.168.1.0/24?' },
    { level: 3, text: 'O gateway configurado é 192.168.1.254, mas o roteador usa o IP 192.168.1.1 na interface eth0. O gateway precisa apontar para o IP real do roteador.' },
  ],
  solution: {
    explanation: 'Para que PC-01 envie pacotes para fora da sua rede (192.168.1.0/24), ele precisa do gateway. O gateway deve ser o IP do roteador na rede onde o PC está. No cenário, o roteador tem 192.168.1.1 na interface eth0, mas o PC está configurado com 192.168.1.254. Nenhum dispositivo possui esse IP, então os pacotes para 10.0.0.50 são descartados.',
    steps: [
      'Selecione PC-01 e altere o gateway de 192.168.1.254 para 192.168.1.1',
      'Teste com ping 10.0.0.50 pelo console de PC-01',
    ],
    commands: ['ipconfig', 'ping 10.0.0.50', 'tracert 10.0.0.50'],
  },
  validation: [
    { type: 'connectivity', target: 'pc1 -> 10.0.0.50', expected: 'success', description: 'PC-01 deve conseguir fazer ping no servidor' },
    { type: 'config', target: 'pc1/eth0/gateway', expected: '192.168.1.1', description: 'Gateway de PC-01 deve ser 192.168.1.1' },
  ],
  xpReward: 100,
  estimatedTime: 15,
};

export const LAB_04_SUBNETTING: Exercise = {
  id: 'lab-04-subnetting',
  title: 'Dividindo a Rede',
  description: 'A rede 192.168.1.0/24 ficou pequena para a empresa. Vamos dividi-la em duas sub-redes /25 e configurar dois departamentos.',
  difficulty: 3,
  category: 'subnetting',
  concepts: ['subnetting', 'subnet-mask', 'cidr'],
  prerequisites: ['lab-03-gateway'],
  initialTopology: {
    id: 'topo-04',
    name: 'Sub-redes',
    devices: [
      device('pcA', 'pc', 'PC-A', 100, 150, [iface('eth0')]),
      device('swA', 'switch', 'SW-A', 260, 150, []),
      device('r1', 'router', 'R-01', 440, 150, [
        iface('eth0'),
        iface('eth1'),
      ]),
      device('swB', 'switch', 'SW-B', 620, 150, []),
      device('pcB', 'pc', 'PC-B', 780, 150, [iface('eth0')]),
    ],
    connections: [
      conn('pcA', 'eth0', 'swA', 'f0/1'),
      conn('swA', 'f0/2', 'r1', 'eth0'),
      conn('r1', 'eth1', 'swB', 'f0/1'),
      conn('swB', 'f0/2', 'pcB', 'eth0'),
    ],
  },
  objective: 'A rede 192.168.1.0/24 deve ser dividida em duas sub-redes /25. A sub-rede A (192.168.1.0/25) atende o PC-A e a B (192.168.1.128/25) o PC-B. Configure IPs, máscaras e os gateways para que os dois PCs se comuniquem.',
  hints: [
    { level: 1, text: 'Uma /24 dividida ao meio resulta em duas /25: 192.168.1.0/25 e 192.168.1.128/25.' },
    { level: 2, text: 'PC-A usa 192.168.1.10 com máscara 255.255.255.128. Qual deve ser a máscara e o gateway de PC-B?' },
    { level: 3, text: 'PC-B: 192.168.1.140/255.255.255.128, gateway 192.168.1.129. R-01 usa 192.168.1.1 (eth0) e 192.168.1.129 (eth1).' },
  ],
  solution: {
    explanation: 'Uma rede 192.168.1.0/24 dividida ao meio gera 192.168.1.0/25 (hosts .1 a .126) e 192.168.1.128/25 (hosts .129 a .254). A máscara de ambas é 255.255.255.128. O roteador precisa de uma interface em cada sub-rede para encaminhar o tráfego entre os departamentos, e cada PC aponta o gateway para a interface do roteador na sua sub-rede.',
    steps: [
      'Configure R-01: eth0 com 192.168.1.1/255.255.255.128 e eth1 com 192.168.1.129/255.255.255.128',
      'Configure PC-A: 192.168.1.10/255.255.255.128, gateway 192.168.1.1',
      'Configure PC-B: 192.168.1.140/255.255.255.128, gateway 192.168.1.129',
      'Teste o ping de PC-A para PC-B (192.168.1.140)',
    ],
    commands: ['ipconfig', 'ping 192.168.1.140'],
  },
  validation: [
    { type: 'config', target: 'pcA/eth0/ip', expected: '192.168.1.10', description: 'PC-A deve ter IP 192.168.1.10' },
    { type: 'config', target: 'pcB/eth0/ip', expected: '192.168.1.140', description: 'PC-B deve ter IP 192.168.1.140' },
    { type: 'config', target: 'pcA/eth0/subnetMask', expected: '255.255.255.128', description: 'PC-A deve usar máscara /25 (255.255.255.128)' },
    { type: 'config', target: 'pcB/eth0/subnetMask', expected: '255.255.255.128', description: 'PC-B deve usar máscara /25 (255.255.255.128)' },
    { type: 'config', target: 'pcA/eth0/gateway', expected: '192.168.1.1', description: 'Gateway de PC-A é a interface eth0 de R-01' },
    { type: 'config', target: 'pcB/eth0/gateway', expected: '192.168.1.129', description: 'Gateway de PC-B é a interface eth1 de R-01' },
    { type: 'config', target: 'r1/eth1/ip', expected: '192.168.1.129', description: 'R-01 deve ter 192.168.1.129 na eth1' },
    { type: 'connectivity', target: 'pcA -> pcB', expected: 'success', description: 'PC-A deve pingar PC-B' },
  ],
  xpReward: 120,
  estimatedTime: 20,
};

export const LAB_05_STATIC_ROUTE: Exercise = {
  id: 'lab-05-static-route',
  title: 'Roteamento Estático',
  description: 'Dois roteadores interligam duas redes. Sem rotas, o tráfego não chega ao destino. Adicione as rotas estáticas necessárias.',
  difficulty: 4,
  category: 'configuration',
  concepts: ['routing-basics', 'gateway', 'ipv4-basics'],
  prerequisites: ['lab-04-subnetting'],
  initialTopology: {
    id: 'topo-05',
    name: 'Roteamento Estático',
    devices: [
      device('pc1', 'pc', 'PC-01', 80, 160, [iface('eth0', '10.0.0.10', { mask: '255.255.255.0', gw: '10.0.0.1' })]),
      device('r1', 'router', 'R-1', 280, 160, [
        iface('eth0', '10.0.0.1', { mask: '255.255.255.0' }),
        iface('eth1', '172.16.0.1', { mask: '255.255.255.252' }),
      ]),
      device('r2', 'router', 'R-2', 480, 160, [
        iface('eth0', '172.16.0.2', { mask: '255.255.255.252' }),
        iface('eth1', '203.0.113.1', { mask: '255.255.255.0' }),
      ]),
      device('pc2', 'pc', 'PC-02', 680, 160, [iface('eth0', '203.0.113.10', { mask: '255.255.255.0', gw: '203.0.113.1' })]),
    ],
    connections: [
      conn('pc1', 'eth0', 'r1', 'eth0'),
      conn('r1', 'eth1', 'r2', 'eth0'),
      conn('r2', 'eth1', 'pc2', 'eth0'),
    ],
  },
  objective: 'PC-01 precisa alcançar PC-02. Adicione a rota estática correta em R-1 (para 203.0.113.0/24) e em R-2 (para 10.0.0.0/24). Use o painel de Rotas para configurar.',
  hints: [
    { level: 1, text: 'Use route print no console de R-1 para ver quais redes ele conhece. Ele conhece as redes diretamente conectadas, mas não a rede de PC-02.' },
    { level: 2, text: 'R-1 precisa de uma rota para 203.0.113.0/24 com gateway (próximo salto) 172.16.0.2. R-2 precisa da rota de volta para 10.0.0.0/24 via 172.16.0.1.' },
    { level: 3, text: 'No painel de propriedades de R-1: destino 203.0.113.0, máscara 255.255.255.0, gateway 172.16.0.2. Em R-2: destino 10.0.0.0, máscara 255.255.255.0, gateway 172.16.0.1.' },
  ],
  solution: {
    explanation: 'Roteadores só encaminham pacotes para redes que conhecem (diretas ou via rotas estáticas). R-1 conhece 10.0.0.0/24 e 172.16.0.0/30, mas não a 203.0.113.0/24. Para chegar lá, o pacote deve seguir pelo R-2 (172.16.0.2). O processo é o mesmo na volta para R-2.',
    steps: [
      'Em R-1, adicione rota: destino 203.0.113.0, máscara 255.255.255.0, gateway 172.16.0.2',
      'Em R-2, adicione rota: destino 10.0.0.0, máscara 255.255.255.0, gateway 172.16.0.1',
      'Confira com route print nos roteadores',
      'Teste ping de PC-01 (10.0.0.10) para PC-02 (203.0.113.10)',
    ],
    commands: ['route print', 'ping 203.0.113.10'],
  },
  validation: [
    { type: 'route', target: 'r1|203.0.113.0', expected: '172.16.0.2', description: 'R-1 deve ter rota para 203.0.113.0/24 via 172.16.0.2' },
    { type: 'route', target: 'r2|10.0.0.0', expected: '172.16.0.1', description: 'R-2 deve ter rota para 10.0.0.0/24 via 172.16.0.1' },
    { type: 'connectivity', target: 'pc1 -> pc2', expected: 'success', description: 'PC-01 deve pingar PC-02' },
  ],
  xpReward: 150,
  estimatedTime: 20,
};

export const LAB_06_ARP: Exercise = {
  id: 'lab-06-arp',
  title: 'Tabela ARP',
  description: 'Antes de enviar um pacote, o computador precisa descobrir o endereço MAC do destino. Veja isso acontecendo na prática.',
  difficulty: 2,
  category: 'theory',
  concepts: ['arp', 'mac-address', 'ethernet-basics'],
  prerequisites: ['lab-03-gateway'],
  initialTopology: {
    id: 'topo-06',
    name: 'ARP',
    devices: [
      device('pc-a', 'pc', 'PC-A', 100, 160, [iface('eth0', '192.168.1.10', { mask: '255.255.255.0' })]),
      device('sw1', 'switch', 'SW-01', 280, 160, []),
      device('srv', 'server', 'SRV-01', 460, 160, [iface('eth0', '192.168.1.30', { mask: '255.255.255.0' })]),
    ],
    connections: [
      conn('pc-a', 'eth0', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'srv', 'eth0'),
    ],
  },
  objective: 'Faça um ping de PC-A para o servidor (192.168.1.30). Depois execute arp -a no console de PC-A e verifique que o MAC do servidor foi aprendido.',
  hints: [
    { level: 1, text: 'Execute ping 192.168.1.30 no console de PC-A.' },
    { level: 2, text: 'Depois do ping, execute arp -a no console de PC-A. Você verá o IP 192.168.1.30 mapeado para um MAC.' },
    { level: 3, text: 'A primeira vez que PC-A fala com o servidor ele envia um broadcast ARP (visível em Pacotes). As próximas comunicações usam o MAC já armazenado.' },
  ],
  solution: {
    explanation: 'Quando PC-A quer enviar um pacote a 192.168.1.30, ele não sabe o MAC de destino. Ele envia um broadcast ARP "quem é 192.168.1.30?". O servidor responde unicast com seu MAC, e PC-A guarda isso na tabela ARP (arp -a). Nas próximas comunicações o MAC já é conhecido.',
    steps: [
      'Abra o console de PC-A',
      'Execute ping 192.168.1.30',
      'Execute arp -a e veja o MAC do servidor aprendido',
    ],
    commands: ['ping 192.168.1.30', 'arp -a'],
  },
  validation: [
    { type: 'connectivity', target: 'pc-a -> srv', expected: 'success', description: 'PC-A deve conseguir pingar o servidor' },
    { type: 'arp', target: 'pc-a', expected: '192.168.1.30', description: 'Tabela ARP de PC-A deve conter o servidor (faça um ping primeiro)' },
  ],
  xpReward: 60,
  estimatedTime: 10,
};

export const LAB_07_DNS: Exercise = {
  id: 'lab-07-dns',
  title: 'DNS na Prática',
  description: 'Computadores conversam por IP, mas nós preferimos nomes. O DNS faz esse papel. Teste a resolução de nomes na sua rede.',
  difficulty: 2,
  category: 'theory',
  concepts: ['dns', 'ipv4-basics'],
  prerequisites: ['lab-01-first-network'],
  initialTopology: {
    id: 'topo-07',
    name: 'DNS',
    devices: [
      device('pc-a', 'pc', 'PC-A', 100, 160, [iface('eth0', '10.0.0.10', { mask: '255.255.255.0', gw: '10.0.0.1' })]),
      device('sw1', 'switch', 'SW-01', 280, 160, []),
      device('srv', 'server', 'SRV-01', 460, 160, [iface('eth0', '10.0.0.50', { mask: '255.255.255.0', gw: '10.0.0.1' })]),
    ],
    connections: [
      conn('pc-a', 'eth0', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'srv', 'eth0'),
    ],
  },
  objective: 'No console de PC-A, use nslookup para descobrir o IP do servidor pelo nome SRV-01. Depois faça um ping de PC-A para o servidor.',
  hints: [
    { level: 1, text: 'Execute nslookup SRV-01 no console de PC-A.' },
    { level: 2, text: 'A resposta mostra o nome e o endereço resolvido: 10.0.0.50.' },
    { level: 3, text: 'O mesmo acontece quando você acessa um site: seu computador consulta o DNS para descobrir o IP.' },
  ],
  solution: {
    explanation: 'O serviço nslookup consulta o DNS e devolve o IP associado ao nome. Em uma rede real, o computador precisa saber o endereço do servidor DNS (campo DNS). Aqui o laboratório resolve os nomes dos equipamentos da topologia.',
    steps: [
      'Abra o console de PC-A',
      'Execute nslookup SRV-01 e veja o IP 10.0.0.50',
      'Execute ping 10.0.0.50',
    ],
    commands: ['nslookup SRV-01', 'ping 10.0.0.50'],
  },
  validation: [
    { type: 'command_output', target: 'pc-a|nslookup SRV-01', expected: '10.0.0.50', description: 'nslookup SRV-01 deve resolver para 10.0.0.50' },
    { type: 'command_output', target: 'pc-a|ping 10.0.0.50', expected: 'Resposta de 10.0.0.50', description: 'O ping deve responder' },
  ],
  xpReward: 60,
  estimatedTime: 10,
};

export const LAB_08_DUPLICATE_IP: Exercise = {
  id: 'lab-08-duplicate-ip',
  title: 'IP Duplicado',
  description: 'Alguém copiou a configuração de rede. Dois computadores com o mesmo IP, e agora ninguém se entende.',
  difficulty: 3,
  category: 'troubleshooting',
  concepts: ['ipv4-basics', 'arp', 'subnet-mask'],
  prerequisites: ['lab-02-subnets-different'],
  initialTopology: {
    id: 'topo-08',
    name: 'IP Duplicado',
    devices: [
      device('pc1', 'pc', 'PC-01', 100, 160, [iface('eth0', '192.168.1.10', { mask: '255.255.255.0' })]),
      device('sw1', 'switch', 'SW-01', 280, 160, []),
      device('pc2', 'pc', 'PC-02', 460, 160, [iface('eth0', '192.168.1.10', { mask: '255.255.255.0' })]),
    ],
    connections: [
      conn('pc1', 'eth0', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'pc2', 'eth0'),
    ],
  },
  objective: 'PC-01 e PC-02 estão com o mesmo IP (192.168.1.10)! Encontre o problema e configure IPs únicos para que os dois computadores se comuniquem.',
  hints: [
    { level: 1, text: 'Use ipconfig nos dois computadores e compare os endereços.' },
    { level: 2, text: 'Endereços IP precisam ser únicos dentro da mesma rede. Os dois PCs usam 192.168.1.10.' },
    { level: 3, text: 'Mantenha PC-01 com 192.168.1.10 e altere PC-02 para 192.168.1.20.' },
  ],
  solution: {
    explanation: 'Cada host em uma rede deve ter um endereço IP único. Com dois hosts usando 192.168.1.10, o ARP responde de forma imprevisível e o tráfego é confuso. Alterando PC-02 para 192.168.1.20 a rede volta a funcionar.',
    steps: [
      'Compare ipconfig em PC-01 e PC-02',
      'Confirme o IP duplicado 192.168.1.10',
      'Altere PC-02 para 192.168.1.20 (mantendo máscara 255.255.255.0)',
      'Teste ping de PC-01 para PC-02 (192.168.1.20)',
    ],
    commands: ['ipconfig', 'ping 192.168.1.20'],
  },
  validation: [
    { type: 'config', target: 'pc1/eth0/ip', expected: '192.168.1.10', description: 'PC-01 deve ficar com 192.168.1.10' },
    { type: 'config', target: 'pc2/eth0/ip', expected: '192.168.1.20', description: 'PC-02 deve ser alterado para 192.168.1.20' },
    { type: 'connectivity', target: 'pc1 -> pc2', expected: 'success', description: 'PC-01 deve pingar PC-02' },
  ],
  xpReward: 100,
  estimatedTime: 15,
};

export const LAB_09_WRONG_MASK: Exercise = {
  id: 'lab-09-wrong-mask',
  title: 'Máscara Errada',
  description: 'PC-01 não acessa o servidor. A rede parece certa, mas algo no cliente está errado. Investigue a máscara.',
  difficulty: 2,
  category: 'troubleshooting',
  concepts: ['subnet-mask', 'ipv4-basics'],
  prerequisites: ['lab-02-subnets-different'],
  initialTopology: {
    id: 'topo-09',
    name: 'Máscara Errada',
    devices: [
      device('pc1', 'pc', 'PC-01', 100, 160, [iface('eth0', '192.168.10.50', { mask: '255.255.255.252' })]),
      device('sw1', 'switch', 'SW-01', 280, 160, []),
      device('r1', 'router', 'R-01', 460, 160, [iface('eth0', '192.168.10.1', { mask: '255.255.255.0' })]),
      device('srv', 'server', 'SRV-01', 620, 160, [iface('eth0', '192.168.10.20', { mask: '255.255.255.0', gw: '192.168.10.1' })]),
    ],
    connections: [
      conn('pc1', 'eth0', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'r1', 'eth0'),
      conn('sw1', 'f0/3', 'srv', 'eth0'),
    ],
  },
  objective: 'PC-01 foi configurado com máscara 255.255.255.252 (uma /30), mas ele pertence à rede 192.168.10.0/24. Corrija a máscara e adicione o gateway para acessar o servidor.',
  hints: [
    { level: 1, text: 'Execute ipconfig em PC-01 e confira a máscara de sub-rede.' },
    { level: 2, text: 'Com máscara /30, PC-01 acha que a rede é 192.168.10.48/30. Ele não reconhece nem o roteador nem o servidor como vizinhos.' },
    { level: 3, text: 'Altere a máscara de PC-01 para 255.255.255.0 e configure o gateway 192.168.10.1.' },
  ],
  solution: {
    explanation: 'A máscara define qual é a rede de cada host. Com 255.255.255.252 (/30), PC-01 considera sua rede apenas 192.168.10.48/30 — nem o roteador (192.168.10.1) nem o servidor (192.168.10.20) pertencem a ela. Corrigindo para 255.255.255.0 (/24) e apontando o gateway para 192.168.10.1, PC-01 volta a enxergar a rede e o servidor.',
    steps: [
      'Compare ipconfig em PC-01 com o restante da rede',
      'Identifique a máscara errada: 255.255.255.252 em vez de 255.255.255.0',
      'Altere a máscara de PC-01 para 255.255.255.0',
      'Configure o gateway de PC-01 como 192.168.10.1',
      'Teste ping 192.168.10.20',
    ],
    commands: ['ipconfig', 'ping 192.168.10.20'],
  },
  validation: [
    { type: 'config', target: 'pc1/eth0/subnetMask', expected: '255.255.255.0', description: 'Máscara de PC-01 deve ser 255.255.255.0 (/24)' },
    { type: 'config', target: 'pc1/eth0/gateway', expected: '192.168.10.1', description: 'Gateway de PC-01 deve ser 192.168.10.1' },
    { type: 'connectivity', target: 'pc1 -> srv', expected: 'success', description: 'PC-01 deve pingar o servidor' },
  ],
  xpReward: 60,
  estimatedTime: 15,
};

export const LAB_10_ENTERPRISE: Exercise = {
  id: 'lab-10-enterprise',
  title: 'Rede Corporativa',
  description: 'Cenário final: três setores, um servidor e acesso à internet saem de um único roteador com um firewall na borda. Deixe tudo se comunicando.',
  difficulty: 4,
  category: 'design',
  concepts: ['routing-basics', 'subnetting', 'gateway', 'network-devices'],
  prerequisites: ['lab-04-subnetting', 'lab-05-static-route'],
  initialTopology: {
    id: 'topo-10',
    name: 'Rede Corporativa',
    devices: [
      device('pc1', 'pc', 'PC-01', 70, 140, [iface('eth0', '192.168.1.10', { mask: '255.255.255.0', gw: '192.168.1.1' })]),
      device('sw1', 'switch', 'SW-01', 210, 140, []),
      device('r1', 'router', 'R-01', 360, 80, [
        iface('eth0', '192.168.1.1', { mask: '255.255.255.0' }),
        iface('eth1', '192.168.2.1', { mask: '255.255.255.0' }),
        iface('eth2', '192.168.3.1', { mask: '255.255.255.0' }),
        iface('eth3', '10.0.0.1', { mask: '255.255.255.0' }),
      ]),
      device('pc2', 'pc', 'PC-02', 150, 260, [iface('eth0', '192.168.2.20', { mask: '255.255.255.0', gw: '192.168.2.1' })]),
      device('sw2', 'switch', 'SW-02', 290, 260, []),
      device('srv', 'server', 'SRV-01', 430, 80, [iface('eth0', '192.168.3.30', { mask: '255.255.255.0', gw: '192.168.3.1' })]),
      device('sw3', 'switch', 'SW-03', 500, 160, []),
      device('fw', 'firewall', 'FW-01', 560, 100, [
        iface('eth0', '10.0.0.2', { mask: '255.255.255.0' }),
        iface('eth1', '203.0.113.1', { mask: '255.255.255.0' }),
      ]),
      device('net', 'cloud', 'INTERNET', 720, 100, [iface('eth0', '203.0.113.10', { mask: '255.255.255.0', gw: '203.0.113.1' })]),
    ],
    connections: [
      conn('pc1', 'eth0', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'r1', 'eth0'),
      conn('pc2', 'eth0', 'sw2', 'f0/1'),
      conn('sw2', 'f0/2', 'r1', 'eth1'),
      conn('srv', 'eth0', 'sw3', 'f0/1'),
      conn('sw3', 'f0/2', 'r1', 'eth2'),
      conn('r1', 'eth3', 'fw', 'eth0'),
      conn('fw', 'eth1', 'net', 'eth0'),
    ],
  },
  objective: 'Todos os setores (192.168.1.0/24, 192.168.2.0/24 e 192.168.3.0/24) devem conversar entre si e chegar à INTERNET (203.0.113.10). Adicione as rotas estáticas necessárias em R-01 e FW-01.',
  hints: [
    { level: 1, text: 'R-01 conhece as três redes internas e a 10.0.0.0/24. Ele não conhece a 203.0.113.0/24.' },
    { level: 2, text: 'R-01 precisa de rota para 203.0.113.0/24 via 10.0.0.2 (FW). FW precisa de rota de volta para as redes internas (192.168.0.0/16) via 10.0.0.1 (R-01).' },
    { level: 3, text: 'Em R-01: destino 203.0.113.0, máscara 255.255.255.0, gateway 10.0.0.2. Em FW-01: destino 192.168.0.0, máscara 255.255.0.0, gateway 10.0.0.1.' },
  ],
  solution: {
    explanation: 'Um roteador separa os setores e o firewall separa a rede interna da internet. Para alcançar a internet, R-01 encaminha para o próximo salto no firewall (10.0.0.2), que tem a rota para fora. Na volta, o firewall precisa saber resumir todas as redes internas (192.168.0.0/16) e entregá-las a R-01.',
    steps: [
      'Confirme IPs, máscaras e gateways dos PCs e do servidor (já configurados)',
      'Em R-01 adicione: 203.0.113.0 / 255.255.255.0 via 10.0.0.2',
      'Em FW-01 adicione: 192.168.0.0 / 255.255.0.0 via 10.0.0.1',
      'Pingue o servidor a partir de PC-01 e PC-02',
      'Pingue a INTERNET (203.0.113.10) a partir de um PC',
    ],
    commands: ['route print', 'ping 192.168.3.30', 'ping 203.0.113.10'],
  },
  validation: [
    { type: 'route', target: 'r1|203.0.113.0', expected: '10.0.0.2', description: 'R-01 deve ter rota para a internet via FW' },
    { type: 'route', target: 'fw|192.168.0.0', expected: '10.0.0.1', description: 'FW-01 deve ter rota resumida de volta para as redes internas' },
    { type: 'connectivity', target: 'pc1 -> srv', expected: 'success', description: 'PC-01 deve alcançar o servidor' },
    { type: 'connectivity', target: 'pc2 -> srv', expected: 'success', description: 'PC-02 deve alcançar o servidor' },
    { type: 'connectivity', target: 'pc1 -> net', expected: 'success', description: 'PC-01 deve alcançar a internet' },
    { type: 'connectivity', target: 'pc2 -> net', expected: 'success', description: 'PC-02 deve alcançar a internet' },
  ],
  xpReward: 200,
  estimatedTime: 25,
};

export const INITIAL_EXERCISES: Exercise[] = [
  LAB_01_FIRST_NETWORK,
  LAB_02_SUBNETS_DIFFERENT,
  LAB_03_GATEWAY,
  LAB_04_SUBNETTING,
  LAB_05_STATIC_ROUTE,
  LAB_06_ARP,
  LAB_07_DNS,
  LAB_08_DUPLICATE_IP,
  LAB_09_WRONG_MASK,
  LAB_10_ENTERPRISE,
];