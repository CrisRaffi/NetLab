import type { Topology } from '../types';

function iface(
  id: string,
  ip?: string,
  opts: { mask?: string; gw?: string; dns?: string } = {},
) {
  const hash = id
    .split('')
    .reduce((s, ch) => (s * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return {
    id,
    name: id,
    type: 'ethernet' as const,
    mac: `AA:BB:CC:${((hash >> 16) & 0xff).toString(16).padStart(2, '0').toUpperCase()}:${((hash >> 8) & 0xff).toString(16).padStart(2, '0').toUpperCase()}:${(hash & 0xff).toString(16).padStart(2, '0').toUpperCase()}`,
    ip: ip ?? undefined,
    subnetMask: opts.mask,
    gateway: opts.gw,
    dns: opts.dns,
    status: 'up' as const,
    speed: 100,
  };
}

function device(
  id: string,
  type: string,
  name: string,
  x: number,
  y: number,
  interfaces: any[],
  routes: any[] = [],
  extra: Record<string, any> = {},
) {
  return {
    id,
    type,
    name,
    position: { x, y },
    interfaces,
    config: { hostname: name, routes, ...extra },
  };
}

function conn(a: string, ia: string, b: string, ib: string) {
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

function topology(
  id: string,
  name: string,
  devices: any[],
  connections: any[],
): Topology {
  return {
    id,
    name,
    devices: devices as Topology['devices'],
    connections,
    blocks: [],
  };
}

const homeNetwork = (): Topology =>
  topology(
    'ex-home',
    'Rede Doméstica',
    [
      device('core1', 'core', 'RA-01', 440, 120, [
        iface('eth0', '192.168.1.1', { mask: '255.255.255.0' }),
        iface('eth1', '192.168.2.1', { mask: '255.255.255.0' }),
        iface('eth2', '192.168.3.1', { mask: '255.255.255.0' }),
        iface('eth3', '203.0.113.1', { mask: '255.255.255.252' }),
      ]),
      device('switch1', 'switch', 'SW-LAN', 220, 120, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
      ]),
      device('pc1', 'pc', 'PC-Sala', 60, 60, [
        iface('eth0', '192.168.1.10', {
          mask: '255.255.255.0',
          gw: '192.168.1.1',
          dns: '8.8.8.8',
        }),
      ]),
      device('pc2', 'pc', 'PC-Quarto', 60, 180, [
        iface('eth0', '192.168.1.11', {
          mask: '255.255.255.0',
          gw: '192.168.1.1',
          dns: '8.8.8.8',
        }),
      ]),
      device('server1', 'server', 'NAS', 60, 300, [
        iface('eth0', '192.168.2.10', {
          mask: '255.255.255.0',
          gw: '192.168.2.1',
          dns: '8.8.8.8',
        }),
      ]),
      device('ap1', 'access_point', 'WiFi-Casa', 220, 300, [
        iface('eth0', '192.168.3.10', {
          mask: '255.255.255.0',
          gw: '192.168.3.1',
          dns: '8.8.8.8',
        }),
      ]),
      device('printer1', 'printer', 'Impressora', 340, 300, [
        iface('eth0', '192.168.3.11', {
          mask: '255.255.255.0',
          gw: '192.168.3.1',
          dns: '8.8.8.8',
        }),
      ]),
      device('cloud1', 'cloud', 'Internet (Nuvem)', 680, 120, [
        iface('eth0', '203.0.113.2', {
          mask: '255.255.255.252',
          gw: '203.0.113.1',
        }),
      ]),
    ],
    [
      conn('core1', 'eth0', 'switch1', 'f0/1'),
      conn('switch1', 'f0/2', 'pc1', 'eth0'),
      conn('switch1', 'f0/3', 'pc2', 'eth0'),
      conn('core1', 'eth1', 'server1', 'eth0'),
      conn('core1', 'eth2', 'ap1', 'eth0'),
      conn('switch1', 'f0/4', 'printer1', 'eth0'),
      conn('core1', 'eth3', 'cloud1', 'eth0'),
    ],
  );

const enterpriseNetwork = (): Topology =>
  topology(
    'ex-emp',
    'Rede Empresarial',
    [
      device('cloud1', 'cloud', 'Internet (Nuvem)', 680, 120, [
        iface('eth0', '200.100.50.2', {
          mask: '255.255.255.252',
          gw: '200.100.50.1',
        }),
      ]),
      device('fw1', 'firewall', 'FW-Edge', 500, 120, [
        iface('eth0', '200.100.50.1', { mask: '255.255.255.252' }),
        iface('eth1', '10.0.0.1', { mask: '255.255.255.0' }),
      ]),
      device('core1', 'core', 'RA-01', 300, 120, [
        iface('eth0', '10.0.0.2', { mask: '255.255.255.0', gw: '10.0.0.1' }),
        iface('eth1', '10.1.0.1', { mask: '255.255.255.0' }),
        iface('eth2', '10.2.0.1', { mask: '255.255.255.0' }),
      ]),
      device('sw1', 'switch', 'SW-DepA', 140, 60, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
      ]),
      device('sw2', 'switch', 'SW-DepB', 140, 200, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
      ]),
      device('pc1', 'pc', 'PC-DepA-1', 20, 20, [
        iface('eth0', '10.1.0.10', { mask: '255.255.255.0', gw: '10.1.0.1' }),
      ]),
      device('pc2', 'pc', 'PC-DepA-2', 20, 100, [
        iface('eth0', '10.1.0.11', { mask: '255.255.255.0', gw: '10.1.0.1' }),
      ]),
      device('pc3', 'pc', 'PC-DepB-1', 20, 180, [
        iface('eth0', '10.2.0.10', { mask: '255.255.255.0', gw: '10.2.0.1' }),
      ]),
      device('pc4', 'pc', 'PC-DepB-2', 20, 260, [
        iface('eth0', '10.2.0.11', { mask: '255.255.255.0', gw: '10.2.0.1' }),
      ]),
      device('server1', 'server', 'Servidor', 20, 340, [
        iface('eth0', '10.1.0.100', { mask: '255.255.255.0', gw: '10.1.0.1' }),
      ]),
    ],
    [
      conn('cloud1', 'eth0', 'fw1', 'eth0'),
      conn('fw1', 'eth1', 'core1', 'eth0'),
      conn('core1', 'eth1', 'sw1', 'f0/1'),
      conn('core1', 'eth2', 'sw2', 'f0/1'),
      conn('sw1', 'f0/2', 'pc1', 'eth0'),
      conn('sw1', 'f0/3', 'pc2', 'eth0'),
      conn('sw2', 'f0/2', 'pc3', 'eth0'),
      conn('sw2', 'f0/3', 'pc4', 'eth0'),
      conn('sw1', 'f0/1', 'server1', 'eth0'),
    ],
  );

const starNetwork = (): Topology =>
  topology(
    'ex-star',
    'Rede em Estrela',
    [
      device('router1', 'router', 'R-01', 420, 120, [
        iface('eth0', '10.0.0.1', { mask: '255.255.255.0' }),
        iface('eth1', '203.0.113.1', { mask: '255.255.255.252' }),
      ]),
      device('cloud1', 'cloud', 'Internet (Nuvem)', 680, 120, [
        iface('eth0', '203.0.113.2', {
          mask: '255.255.255.252',
          gw: '203.0.113.1',
        }),
      ]),
      device('sw1', 'switch', 'SW-Central', 180, 120, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
        iface('f0/5'),
      ]),
      device('pc1', 'pc', 'PC-01', 40, 20, [
        iface('eth0', '10.0.0.10', { mask: '255.255.255.0', gw: '10.0.0.1' }),
      ]),
      device('pc2', 'pc', 'PC-02', 40, 100, [
        iface('eth0', '10.0.0.11', { mask: '255.255.255.0', gw: '10.0.0.1' }),
      ]),
      device('pc3', 'pc', 'PC-03', 40, 180, [
        iface('eth0', '10.0.0.12', { mask: '255.255.255.0', gw: '10.0.0.1' }),
      ]),
      device('pc4', 'pc', 'PC-04', 40, 260, [
        iface('eth0', '10.0.0.13', { mask: '255.255.255.0', gw: '10.0.0.1' }),
      ]),
      device('server1', 'server', 'Servidor', 40, 340, [
        iface('eth0', '10.0.0.100', { mask: '255.255.255.0', gw: '10.0.0.1' }),
      ]),
    ],
    [
      conn('router1', 'eth0', 'sw1', 'f0/1'),
      conn('router1', 'eth1', 'cloud1', 'eth0'),
      conn('sw1', 'f0/2', 'pc1', 'eth0'),
      conn('sw1', 'f0/3', 'pc2', 'eth0'),
      conn('sw1', 'f0/4', 'pc3', 'eth0'),
      conn('sw1', 'f0/5', 'pc4', 'eth0'),
      conn('sw1', 'f0/1', 'server1', 'eth0'),
    ],
  );

const supermarketNetwork = (): Topology =>
  topology(
    'ex-market',
    'Rede de Supermercado',
    [
      device('cloud1', 'cloud', 'Internet (Nuvem)', 720, 140, [
        iface('eth0', '203.0.113.2', {
          mask: '255.255.255.252',
          gw: '203.0.113.1',
        }),
      ]),
      device('rot1', 'router', 'R-CPD', 540, 140, [
        iface('eth0', '203.0.113.1', { mask: '255.255.255.252' }),
        iface('eth1', '10.0.50.1', { mask: '255.255.255.0' }),
      ]),
      device('sw1', 'switch', 'SW-CPD', 300, 140, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
        iface('f0/5'),
        iface('f0/6'),
        iface('f0/7'),
        iface('f0/8'),
      ]),
      device('pdv1', 'pc', 'PDV-Caixa-01', 60, 20, [
        iface('eth0', '10.0.50.11', { mask: '255.255.255.0', gw: '10.0.50.1' }),
      ]),
      device('pdv2', 'pc', 'PDV-Caixa-02', 60, 100, [
        iface('eth0', '10.0.50.12', { mask: '255.255.255.0', gw: '10.0.50.1' }),
      ]),
      device('scale1', 'pc', 'Balança', 60, 180, [
        iface('eth0', '10.0.50.13', { mask: '255.255.255.0', gw: '10.0.50.1' }),
      ]),
      device('srv1', 'server', 'Servidor de PDV', 60, 260, [
        iface('eth0', '10.0.50.100', { mask: '255.255.255.0', gw: '10.0.50.1' }),
      ]),
      device('cam1', 'ip_camera', 'Câmera-Entrada', 200, 20, [
        iface('eth0', '10.0.50.21', { mask: '255.255.255.0', gw: '10.0.50.1' }),
      ]),
      device('cam2', 'ip_camera', 'Câmera-Depósito', 200, 100, [
        iface('eth0', '10.0.50.22', { mask: '255.255.255.0', gw: '10.0.50.1' }),
      ]),
      device('prin1', 'printer', 'Impressora-PDV', 60, 340, [
        iface('eth0', '10.0.50.30', { mask: '255.255.255.0', gw: '10.0.50.1' }),
      ]),
    ],
    [
      conn('rot1', 'eth0', 'cloud1', 'eth0'),
      conn('rot1', 'eth1', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'pdv1', 'eth0'),
      conn('sw1', 'f0/3', 'pdv2', 'eth0'),
      conn('sw1', 'f0/4', 'scale1', 'eth0'),
      conn('sw1', 'f0/5', 'srv1', 'eth0'),
      conn('sw1', 'f0/6', 'cam1', 'eth0'),
      conn('sw1', 'f0/7', 'cam2', 'eth0'),
      conn('sw1', 'f0/8', 'prin1', 'eth0'),
    ],
  );

const schoolNetwork = (): Topology =>
  topology(
    'ex-school',
    'Rede Escolar',
    [
      device('cloud1', 'cloud', 'Internet (Nuvem)', 720, 120, [
        iface('eth0', '203.0.113.2', {
          mask: '255.255.255.252',
          gw: '203.0.113.1',
        }),
      ]),
      device('rot1', 'router', 'R-Escola', 540, 120, [
        iface('eth0', '203.0.113.1', { mask: '255.255.255.252' }),
        iface('eth1', '172.16.0.1', { mask: '255.255.255.0' }),
      ]),
      device('swadm', 'switch', 'SW-Administração', 300, 40, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
        iface('f0/5'),
        iface('f0/6'),
      ]),
      device('swlab', 'switch', 'SW-Lab', 300, 300, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
        iface('f0/5'),
      ]),
      device('pc1', 'pc', 'PC-Diretoria', 40, 0, [
        iface('eth0', '172.16.0.10', { mask: '255.255.255.0', gw: '172.16.0.1' }),
      ]),
      device('pc2', 'pc', 'PC-Secretaria', 40, 80, [
        iface('eth0', '172.16.0.11', { mask: '255.255.255.0', gw: '172.16.0.1' }),
      ]),
      device('ap1', 'access_point', 'WiFi-Escola', 40, 160, [
        iface('eth0', '172.16.0.12', { mask: '255.255.255.0', gw: '172.16.0.1' }),
      ]),
      device('prin1', 'printer', 'Impressora', 40, 240, [
        iface('eth0', '172.16.0.13', { mask: '255.255.255.0', gw: '172.16.0.1' }),
      ]),
      device('srv1', 'server', 'Servidor de Matrículas', 40, 340, [
        iface('eth0', '172.16.0.100', { mask: '255.255.255.0', gw: '172.16.0.1' }),
      ]),
      device('labb1', 'pc', 'PC-Aluno-01', 60, 420, [
        iface('eth0', undefined, { mask: '255.255.255.0', gw: '172.16.0.1', dns: '172.16.0.100' }),
      ]),
      device('labb2', 'pc', 'PC-Aluno-02', 180, 420, [
        iface('eth0', undefined, { mask: '255.255.255.0', gw: '172.16.0.1', dns: '172.16.0.100' }),
      ]),
      device('labb3', 'pc', 'PC-Aluno-03', 300, 420, [
        iface('eth0', undefined, { mask: '255.255.255.0', gw: '172.16.0.1', dns: '172.16.0.100' }),
      ]),
      device('srv2', 'server', 'Servidor DHCP', 300, 520, [
        iface('eth0', '172.16.0.100', { mask: '255.255.255.0', gw: '172.16.0.1' }),
      ], [], {
        dhcp: {
          enabled: true,
          rangeStart: '172.16.0.150',
          rangeEnd: '172.16.0.199',
          subnetMask: '255.255.255.0',
          gateway: '172.16.0.1',
          dns: '172.16.0.100',
          leaseTime: 3600,
        },
        dnsRecords: [
          { name: 'matriculas.escola.local', ip: '172.16.0.100' },
          { name: 'srv2.escola.local', ip: '172.16.0.100' },
        ],
      }),
    ],
    [
      conn('rot1', 'eth0', 'cloud1', 'eth0'),
      conn('rot1', 'eth1', 'swadm', 'f0/1'),
      conn('swadm', 'f0/2', 'pc1', 'eth0'),
      conn('swadm', 'f0/3', 'pc2', 'eth0'),
      conn('swadm', 'f0/4', 'ap1', 'eth0'),
      conn('swadm', 'f0/5', 'swlab', 'f0/5'),
      conn('swadm', 'f0/6', 'prin1', 'eth0'),
      conn('swlab', 'f0/1', 'labb1', 'eth0'),
      conn('swlab', 'f0/2', 'labb2', 'eth0'),
      conn('swlab', 'f0/3', 'labb3', 'eth0'),
      conn('swlab', 'f0/4', 'srv1', 'eth0'),
      conn('swlab', 'f0/5', 'srv2', 'eth0'),
    ],
  );

const officeBuildingNetwork = (): Topology =>
  topology(
    'ex-building',
    'Prédio de Escritórios',
    [
      device('cloud1', 'cloud', 'Internet (Nuvem)', 720, 120, [
        iface('eth0', '203.0.113.2', {
          mask: '255.255.255.252',
          gw: '203.0.113.1',
        }),
      ]),
      device('rot1', 'router', 'R-Edifício', 540, 120, [
        iface('eth0', '203.0.113.1', { mask: '255.255.255.252' }),
        iface('eth1', '10.10.0.1', { mask: '255.255.255.0' }),
        iface('eth2', '10.20.0.1', { mask: '255.255.255.0' }),
      ]),
      device('sw1', 'switch', 'SW-1º Andar', 300, 40, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
      ]),
      device('sw2', 'switch', 'SW-2º Andar', 300, 300, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
      ]),
      device('pc1', 'pc', 'PC-Andar1-01', 40, 20, [
        iface('eth0', '10.10.0.11', { mask: '255.255.255.0', gw: '10.10.0.1' }),
      ]),
      device('pc2', 'pc', 'PC-Andar1-02', 40, 100, [
        iface('eth0', '10.10.0.12', { mask: '255.255.255.0', gw: '10.10.0.1' }),
      ]),
      device('prin1', 'printer', 'Impressora-1º', 40, 180, [
        iface('eth0', '10.10.0.30', { mask: '255.255.255.0', gw: '10.10.0.1' }),
      ]),
      device('pc3', 'pc', 'PC-Andar2-01', 40, 280, [
        iface('eth0', '10.20.0.11', { mask: '255.255.255.0', gw: '10.20.0.1' }),
      ]),
      device('pc4', 'pc', 'PC-Andar2-02', 40, 360, [
        iface('eth0', '10.20.0.12', { mask: '255.255.255.0', gw: '10.20.0.1' }),
      ]),
      device('srv1', 'server', 'Servidor de Arquivos', 300, 420, [
        iface('eth0', '10.20.0.100', { mask: '255.255.255.0', gw: '10.20.0.1' }),
      ]),
    ],
    [
      conn('rot1', 'eth0', 'cloud1', 'eth0'),
      conn('rot1', 'eth1', 'sw1', 'f0/1'),
      conn('rot1', 'eth2', 'sw2', 'f0/1'),
      conn('sw1', 'f0/2', 'pc1', 'eth0'),
      conn('sw1', 'f0/3', 'pc2', 'eth0'),
      conn('sw1', 'f0/4', 'prin1', 'eth0'),
      conn('sw2', 'f0/2', 'pc3', 'eth0'),
      conn('sw2', 'f0/3', 'pc4', 'eth0'),
      conn('sw2', 'f0/4', 'srv1', 'eth0'),
    ],
  );

const clinicNetwork = (): Topology =>
  topology(
    'ex-clinic',
    'Clínica Médica',
    [
      device('cloud1', 'cloud', 'Internet (Nuvem)', 720, 120, [
        iface('eth0', '203.0.113.2', {
          mask: '255.255.255.252',
          gw: '203.0.113.1',
        }),
      ]),
      device('rot1', 'router', 'R-Clínica', 540, 120, [
        iface('eth0', '203.0.113.1', { mask: '255.255.255.252' }),
        iface('eth1', '192.168.10.1', { mask: '255.255.255.0' }),
      ]),
      device('sw1', 'switch', 'SW-Recepção', 300, 40, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
        iface('f0/5'),
      ]),
      device('sw2', 'switch', 'SW-Atendimento', 300, 280, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
      ]),
      device('pc1', 'pc', 'PC-Recepção', 40, 0, [
        iface('eth0', '192.168.10.10', { mask: '255.255.255.0', gw: '192.168.10.1' }),
      ]),
      device('prin1', 'printer', 'Impressora', 40, 80, [
        iface('eth0', '192.168.10.30', { mask: '255.255.255.0', gw: '192.168.10.1' }),
      ]),
      device('cam1', 'ip_camera', 'Câmera-Segurança', 40, 160, [
        iface('eth0', '192.168.10.31', { mask: '255.255.255.0', gw: '192.168.10.1' }),
      ]),
      device('pc2', 'pc', 'PC-Consultório-01', 40, 260, [
        iface('eth0', '192.168.10.21', { mask: '255.255.255.0', gw: '192.168.10.1' }),
      ]),
      device('pc3', 'pc', 'PC-Consultório-02', 40, 340, [
        iface('eth0', '192.168.10.22', { mask: '255.255.255.0', gw: '192.168.10.1' }),
      ]),
      device('srv1', 'server', 'Servidor de Prontuários', 300, 420, [
        iface('eth0', '192.168.10.100', { mask: '255.255.255.0', gw: '192.168.10.1' }),
      ]),
    ],
    [
      conn('rot1', 'eth0', 'cloud1', 'eth0'),
      conn('rot1', 'eth1', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'pc1', 'eth0'),
      conn('sw1', 'f0/3', 'prin1', 'eth0'),
      conn('sw1', 'f0/4', 'cam1', 'eth0'),
      conn('sw1', 'f0/5', 'sw2', 'f0/4'),
      conn('sw2', 'f0/1', 'pc2', 'eth0'),
      conn('sw2', 'f0/2', 'pc3', 'eth0'),
      conn('sw2', 'f0/3', 'srv1', 'eth0'),
    ],
  );

const innNetwork = (): Topology =>
  topology(
    'ex-inn',
    'Pousada Pequena',
    [
      device('cloud1', 'cloud', 'Internet (Nuvem)', 720, 120, [
        iface('eth0', '203.0.113.2', {
          mask: '255.255.255.252',
          gw: '203.0.113.1',
        }),
      ]),
      device('rot1', 'router', 'R-Pousada', 540, 120, [
        iface('eth0', '203.0.113.1', { mask: '255.255.255.252' }),
        iface('eth1', '192.168.1.1', { mask: '255.255.255.0' }),
        iface('eth2', '192.168.2.1', { mask: '255.255.255.0' }),
      ]),
      device('sw1', 'switch', 'SW-Recepção', 300, 40, [
        iface('f0/1'),
        iface('f0/2'),
        iface('f0/3'),
        iface('f0/4'),
      ]),
      device('pc1', 'pc', 'PC-Recepção', 40, 0, [
        iface('eth0', '192.168.1.10', { mask: '255.255.255.0', gw: '192.168.1.1' }),
      ]),
      device('prin1', 'printer', 'Impressora', 40, 80, [
        iface('eth0', '192.168.1.11', { mask: '255.255.255.0', gw: '192.168.1.1' }),
      ]),
      device('phone1', 'ip_phone', 'Telefone-Recepção', 40, 160, [
        iface('eth0', '192.168.1.12', { mask: '255.255.255.0', gw: '192.168.1.1' }),
      ]),
      device('ap1', 'access_point', 'WiFi-Hóspedes', 300, 260, [
        iface('eth0', '192.168.2.10', { mask: '255.255.255.0', gw: '192.168.2.1' }),
      ]),
    ],
    [
      conn('rot1', 'eth0', 'cloud1', 'eth0'),
      conn('rot1', 'eth1', 'sw1', 'f0/1'),
      conn('sw1', 'f0/2', 'pc1', 'eth0'),
      conn('sw1', 'f0/3', 'prin1', 'eth0'),
      conn('sw1', 'f0/4', 'phone1', 'eth0'),
      conn('rot1', 'eth2', 'ap1', 'eth0'),
    ],
  );

export const NETWORK_EXAMPLES: (() => Topology)[] = [
  homeNetwork,
  enterpriseNetwork,
  starNetwork,
  supermarketNetwork,
  schoolNetwork,
  officeBuildingNetwork,
  clinicNetwork,
  innNetwork,
];
