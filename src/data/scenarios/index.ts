import type { NetworkInterface, Device, Connection, DeviceType, Route } from '../../types';
import { normalizeTopology } from '../../engine/lab';
import type { BreakScenario, FaultVariant, FaultType } from '../../engine/faults';

function route(destination: string, mask: string, gateway: string): Route {
  return { destination, mask, gateway, metric: 1, interfaceName: '' };
}

function iface(id: string, ip?: string, opts: { mask?: string; gw?: string; dns?: string } = {}): NetworkInterface {
  const mac = 'BA:DB:EE:0' + String(id.length % 10) + ':' + String(id.charCodeAt(0) % 100).padStart(2, '0') + ':01';
  return {
    id,
    name: id,
    type: 'ethernet',
    mac,
    ip: ip ?? undefined,
    subnetMask: opts.mask,
    gateway: opts.gw,
    dns: opts.dns,
    status: 'up' as const,
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
    type: 'ethernet' as const,
    status: 'connected' as const,
    bandwidth: 100,
    latency: 1,
  };
}

interface ScenarioDraft extends Omit<BreakScenario, 'health'> {
  rawHealth: BreakScenario['health'];
}

function variant(id: string, type: FaultType, symptom: string, fix: string, extra: Partial<Omit<FaultVariant, 'id' | 'type' | 'symptom' | 'fix'>> = {}): FaultVariant {
  return { id, type, symptom, fix, ...extra };
}

const OFFICE: ScenarioDraft = {
  id: 'brk-office',
  title: 'Escritório',
  description: 'Uma pequena rede de escritório: dois computadores e um servidor em uma mesma sub-rede.',
  difficulty: 1,
  concepts: ['ipv4-basics', 'ethernet-basics', 'arp'],
  estimatedTime: 10,
  xpReward: 60,
  generalHints: [
    'Comece com ipconfig nos equipamentos envolvidos no sintoma.',
    'Compare IPs e máscaras entre os dispositivos da mesma rede.',
    'Teste a comunicação gradativamente: ping para o gateway/broadcast, depois para o destino.',
  ],
  rawHealth: {
    id: 'brk-office-health',
    name: 'Escritório (sadio)',
    devices: [
      device('pc-a', 'pc', 'PC-A', 100, 160, [iface('eth0', '192.168.1.10', { mask: '255.255.255.0' })]),
      device('sw1', 'switch', 'SW-01', 280, 160, []),
      device('pc-b', 'pc', 'PC-B', 460, 160, [iface('eth0', '192.168.1.20', { mask: '255.255.255.0' })]),
      device('srv', 'server', 'SRV-01', 620, 160, [iface('eth0', '192.168.1.30', { mask: '255.255.255.0' })]),
    ],
    connections: [
      conn('pc-a', 'eth0', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'pc-b', 'eth0'),
      conn('sw1', 'f0/3', 'srv', 'eth0'),
    ],
  },
  validation: [
    { type: 'config', target: 'pc-a/eth0/ip', expected: '192.168.1.10', description: 'PC-A deve ter IP 192.168.1.10' },
    { type: 'config', target: 'pc-b/eth0/ip', expected: '192.168.1.20', description: 'PC-B deve ter IP 192.168.1.20' },
    { type: 'config', target: 'srv/eth0/ip', expected: '192.168.1.30', description: 'O servidor deve ter IP 192.168.1.30' },
    { type: 'connectivity', target: 'pc-a -> pc-b', expected: 'success', description: 'PC-A deve pingar PC-B' },
    { type: 'connectivity', target: 'pc-a -> srv', expected: 'success', description: 'PC-A deve pingar o servidor' },
  ],
  variants: [
    variant('wrong-ip-pc-a', 'wrong-ip', 'PC-A não se comunica com mais ninguém na rede 192.168.1.0/24.', 'Corrija o IP de PC-A de volta para 192.168.1.10.', { target: { deviceId: 'pc-a', interfaceId: 'eth0' }, wrongIp: '192.168.2.10' }),
    variant('duplicate-ip-srv', 'duplicate-ip', 'PC-A não consegue mais pingar o servidor e o tráfego para 192.168.1.10 ficou confuso.', 'Dois equipamentos usam 192.168.1.10. Restaure o IP do servidor para 192.168.1.30.', { target: { deviceId: 'srv', interfaceId: 'eth0' }, copyFrom: { deviceId: 'pc-a', interfaceId: 'eth0' } }),
    variant('wrong-mask-pc-a', 'wrong-mask', 'PC-A acha que está em outra rede e ninguém responde aos seus pings.', 'Restabeleça a máscara de PC-A para 255.255.255.0.', { target: { deviceId: 'pc-a', interfaceId: 'eth0' }, wrongMask: '255.255.255.252' }),
    variant('interface-down-pc-a', 'interface-down', 'PC-A está offline: o link da placa de rede não sobe.', 'Reative a interface eth0 de PC-A usando o botão UP/DOWN.', { target: { deviceId: 'pc-a', interfaceId: 'eth0' } }),
  ],
};

const SECTORS: ScenarioDraft = {
  id: 'brk-sectors',
  title: 'Dois Setores',
  description: 'Dois setores separados por um roteador: cada um em uma sub-rede /24.',
  difficulty: 2,
  concepts: ['gateway', 'routing-basics', 'ipv4-basics'],
  estimatedTime: 15,
  xpReward: 90,
  generalHints: [
    'Confira com ipconfig o IP, a máscara e o gateway de cada equipamento.',
    'Pinga primeiro o gateway local; depois tente cruzar o roteador.',
    'Gateway e rota só funcionam se apontarem para um IP real e ativo.',
  ],
  rawHealth: {
    id: 'brk-sectors-health',
    name: 'Dois Setores (sadio)',
    devices: [
      device('pc-a', 'pc', 'PC-A', 90, 160, [iface('eth0', '192.168.1.10', { mask: '255.255.255.0', gw: '192.168.1.1' })]),
      device('sw-a', 'switch', 'SW-A', 230, 160, []),
      device('r1', 'router', 'R-01', 400, 160, [
        iface('eth0', '192.168.1.1', { mask: '255.255.255.0' }),
        iface('eth1', '192.168.2.1', { mask: '255.255.255.0' }),
      ]),
      device('sw-b', 'switch', 'SW-B', 580, 160, []),
      device('pc-b', 'pc', 'PC-B', 740, 160, [iface('eth0', '192.168.2.20', { mask: '255.255.255.0', gw: '192.168.2.1' })]),
    ],
    connections: [
      conn('pc-a', 'eth0', 'sw-a', 'f0/1'),
      conn('sw-a', 'f0/2', 'r1', 'eth0'),
      conn('r1', 'eth1', 'sw-b', 'f0/1'),
      conn('sw-b', 'f0/2', 'pc-b', 'eth0'),
    ],
  },
  validation: [
    { type: 'config', target: 'pc-a/eth0/ip', expected: '192.168.1.10', description: 'PC-A deve ter IP 192.168.1.10' },
    { type: 'config', target: 'pc-a/eth0/gateway', expected: '192.168.1.1', description: 'Gateway de PC-A deve ser 192.168.1.1' },
    { type: 'config', target: 'pc-b/eth0/gateway', expected: '192.168.2.1', description: 'Gateway de PC-B deve ser 192.168.2.1' },
    { type: 'config', target: 'r1/eth0/ip', expected: '192.168.1.1', description: 'R-01 deve ter 192.168.1.1 na eth0' },
    { type: 'connectivity', target: 'pc-a -> 192.168.2.20', expected: 'success', description: 'PC-A deve alcançar PC-B (192.168.2.20)' },
  ],
  variants: [
    variant('wrong-gateway-pc-a', 'wrong-gateway', 'PC-A não alcança o outro setor: o pacote sai para um "gateway" que não existe.', 'O gateway de PC-A deve ser 192.168.1.1 (interface eth0 de R-01).', { target: { deviceId: 'pc-a', interfaceId: 'eth0' }, wrongGateway: '192.168.1.254' }),
    variant('missing-gateway-pc-a', 'missing-gateway', 'PC-A fala na própria rede, mas não consegue sair para o outro setor.', 'Configure o gateway de PC-A como 192.168.1.1.', { target: { deviceId: 'pc-a', interfaceId: 'eth0' } }),
    variant('wrong-ip-pc-b', 'wrong-ip', 'PC-B não é encontrado a partir do setor A.', 'Restabeleça o IP de PC-B para 192.168.2.20.', { target: { deviceId: 'pc-b', interfaceId: 'eth0' }, wrongIp: '192.168.3.20' }),
    variant('interface-down-r1-eth1', 'interface-down', 'Ninguém no setor B consegue falar com o setor A.', 'Reative a interface eth1 do roteador R-01.', { target: { deviceId: 'r1', interfaceId: 'eth1' } }),
  ],
};

const INTERNET: ScenarioDraft = {
  id: 'brk-internet',
  title: 'Gateway da Internet',
  description: 'Um roteador e um firewall entregam a internet a uma rede interna. Rota de ida e rota de volta precisam existir.',
  difficulty: 3,
  concepts: ['routing-basics', 'gateway', 'static-routing'],
  estimatedTime: 20,
  xpReward: 120,
  generalHints: [
    'Teste em etapas: ping no gateway local, depois no firewall, depois na internet.',
    'Confira as rotas com route print em R-01 e FW-01.',
    'Tráfego de ida e de volta dependem de rotas em ambos os lados.',
  ],
  rawHealth: {
    id: 'brk-internet-health',
    name: 'Gateway da Internet (sadio)',
    devices: [
      device('pc1', 'pc', 'PC-01', 80, 160, [iface('eth0', '192.168.1.10', { mask: '255.255.255.0', gw: '192.168.1.1' })]),
      device('sw1', 'switch', 'SW-01', 230, 160, []),
      device('r1', 'router', 'R-01', 400, 100, [
        iface('eth0', '192.168.1.1', { mask: '255.255.255.0' }),
        iface('eth1', '10.0.0.1', { mask: '255.255.255.0' }),
      ], [route('203.0.113.0', '255.255.255.0', '10.0.0.2')]),
      device('fw', 'firewall', 'FW-01', 560, 100, [
        iface('eth0', '10.0.0.2', { mask: '255.255.255.0' }),
        iface('eth1', '203.0.113.1', { mask: '255.255.255.0' }),
      ], [route('192.168.0.0', '255.255.0.0', '10.0.0.1')]),
      device('net', 'cloud', 'INTERNET', 720, 100, [iface('eth0', '203.0.113.10', { mask: '255.255.255.0', gw: '203.0.113.1' })]),
    ],
    connections: [
      conn('pc1', 'eth0', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'r1', 'eth0'),
      conn('r1', 'eth1', 'fw', 'eth0'),
      conn('fw', 'eth1', 'net', 'eth0'),
    ],
  },
  validation: [
    { type: 'config', target: 'pc1/eth0/ip', expected: '192.168.1.10', description: 'PC-01 deve ter IP 192.168.1.10' },
    { type: 'route', target: 'r1|203.0.113.0', expected: '10.0.0.2', description: 'R-01 deve ter rota para a internet via FW' },
    { type: 'route', target: 'fw|192.168.0.0', expected: '10.0.0.1', description: 'FW-01 deve ter rota de retorno para as redes internas' },
    { type: 'connectivity', target: 'pc1 -> net', expected: 'success', description: 'PC-01 deve alcançar a internet (203.0.113.10)' },
    { type: 'connectivity', target: 'net -> 192.168.1.10', expected: 'success', description: 'A resposta da internet deve voltar até PC-01' },
  ],
  variants: [
    variant('missing-route-r1', 'missing-route', 'PC-01 não alcança a internet: R-01 não sabe a rota para fora.', 'Adicione em R-01 a rota estática 203.0.113.0/24 via 10.0.0.2.', { target: { deviceId: 'r1' }, routeDest: '203.0.113.0' }),
    variant('wrong-route-fw', 'wrong-route', 'PC-01 envia para a internet, mas a resposta não volta: rota de retorno errada no firewall.', 'Em FW-01, a rota de retorno (192.168.0.0/16) deve apontar para 10.0.0.1.', { target: { deviceId: 'fw' }, routeDest: '192.168.0.0', wrongRouteGateway: '10.0.0.99' }),
    variant('wrong-gateway-pc1', 'wrong-gateway', 'PC-01 não consegue ir a lugar nenhum fora da rede local.', 'Restabeleça o gateway de PC-01 para 192.168.1.1.', { target: { deviceId: 'pc1', interfaceId: 'eth0' }, wrongGateway: '192.168.1.254' }),
    variant('interface-down-fw-eth0', 'interface-down', 'A internet desapareceu para todos: o firewall ficou mudo no link interno.', 'Reative a interface eth0 do firewall FW-01.', { target: { deviceId: 'fw', interfaceId: 'eth0' } }),
  ],
};

const ROUTING: ScenarioDraft = {
  id: 'brk-routing',
  title: 'Cadeia de Roteadores',
  description: 'Dois roteadores em sequência. Redes diretas conhecidas, redes distantes dependem de rotas estáticas nos dois lados.',
  difficulty: 3,
  concepts: ['routing-basics', 'static-routing', 'subnetting'],
  estimatedTime: 20,
  xpReward: 150,
  generalHints: [
    'Vá pulando de hop em hop: ping no gateway, no roteador vizinho, no destino.',
    'Route print revela quais redes cada roteador conhece.',
    'Toda rede distante precisa de uma rota de ida e uma de volta.',
  ],
  rawHealth: {
    id: 'brk-routing-health',
    name: 'Cadeia de Roteadores (sadio)',
    devices: [
      device('pc1', 'pc', 'PC-01', 80, 160, [iface('eth0', '10.0.0.10', { mask: '255.255.255.0', gw: '10.0.0.1' })]),
      device('r1', 'router', 'R-1', 300, 160, [
        iface('eth0', '10.0.0.1', { mask: '255.255.255.0' }),
        iface('eth1', '172.16.0.1', { mask: '255.255.255.252' }),
      ], [route('192.168.2.0', '255.255.255.0', '172.16.0.2')]),
      device('r2', 'router', 'R-2', 520, 160, [
        iface('eth0', '172.16.0.2', { mask: '255.255.255.252' }),
        iface('eth1', '192.168.2.1', { mask: '255.255.255.0' }),
      ], [route('10.0.0.0', '255.255.255.0', '172.16.0.1')]),
      device('pc2', 'pc', 'PC-02', 740, 160, [iface('eth0', '192.168.2.20', { mask: '255.255.255.0', gw: '192.168.2.1' })]),
    ],
    connections: [
      conn('pc1', 'eth0', 'r1', 'eth0'),
      conn('r1', 'eth1', 'r2', 'eth0'),
      conn('r2', 'eth1', 'pc2', 'eth0'),
    ],
  },
  validation: [
    { type: 'config', target: 'pc1/eth0/gateway', expected: '10.0.0.1', description: 'PC-01 deve apontar o gateway para 10.0.0.1' },
    { type: 'config', target: 'r1/eth1/ip', expected: '172.16.0.1', description: 'A interface eth1 de R-1 deve ser 172.16.0.1' },
    { type: 'route', target: 'r1|192.168.2.0', expected: '172.16.0.2', description: 'R-1 deve ter rota para 192.168.2.0/24 via R-2' },
    { type: 'route', target: 'r2|10.0.0.0', expected: '172.16.0.1', description: 'R-2 deve ter rota de volta para 10.0.0.0/24 via R-1' },
    { type: 'connectivity', target: 'pc1 -> pc2', expected: 'success', description: 'PC-01 deve pingar PC-02' },
  ],
  variants: [
    variant('missing-route-r1', 'missing-route', 'PC-01 tem o gateway certo, mas R-1 não sabe chegar na rede 192.168.2.0/24.', 'Adicione em R-1 a rota estática 192.168.2.0/24 via 172.16.0.2.', { target: { deviceId: 'r1' }, routeDest: '192.168.2.0' }),
    variant('wrong-route-r2', 'wrong-route', 'PC-01 consegue ir até PC-02 mas a resposta não volta: rota errada em R-2.', 'Corrija a rota de R-2 para 10.0.0.0/24 via 172.16.0.1.', { target: { deviceId: 'r2' }, routeDest: '10.0.0.0', wrongRouteGateway: '172.16.0.99' }),
    variant('wrong-ip-r1-eth1', 'wrong-ip', 'Os roteadores não enxergam o link entre eles.', 'A interface eth1 de R-1 deve voltar a ser 172.16.0.1 com máscara 255.255.255.252.', { target: { deviceId: 'r1', interfaceId: 'eth1' }, wrongIp: '172.16.0.99' }),
    variant('interface-down-r2-eth1', 'interface-down', 'PC-02 está isolado: a interface do segundo roteador caiu.', 'Reative a interface eth1 de R-2.', { target: { deviceId: 'r2', interfaceId: 'eth1' } }),
  ],
};

const DRAFTS = [OFFICE, SECTORS, INTERNET, ROUTING];

export const BREAK_SCENARIOS: BreakScenario[] = DRAFTS.map(d => ({
  id: d.id,
  title: d.title,
  description: d.description,
  difficulty: d.difficulty,
  concepts: d.concepts,
  estimatedTime: d.estimatedTime,
  xpReward: d.xpReward,
  generalHints: d.generalHints,
  validation: d.validation,
  variants: d.variants,
  health: normalizeTopology(d.rawHealth),
}));