import type { Topology } from '../types';

function iface(
  id: string,
  ip?: string,
  opts: { mask?: string; gw?: string; dns?: string } = {},
) {
  return {
    id,
    name: id,
    type: 'ethernet' as const,
    mac: `AA:BB:CC:DD:${id.charCodeAt(0).toString(16).padStart(2, '0')}:00`,
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
) {
  return {
    id,
    type,
    name,
    position: { x, y },
    interfaces,
    config: { hostname: name, routes },
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

function topology(id: string, name: string, devices: any[], connections: any[]): Topology {
  return { id, name, devices: devices as Topology['devices'], connections, blocks: [] };
}

const homeNetwork = (): Topology =>
  topology('ex-home', 'Rede Doméstica', [
    device('core1', 'core', 'CORE-01', 440, 120, [
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
      iface('eth0', '192.168.1.10', { mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8' }),
    ]),
    device('pc2', 'pc', 'PC-Quarto', 60, 180, [
      iface('eth0', '192.168.1.11', { mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8' }),
    ]),
    device('server1', 'server', 'NAS', 60, 300, [
      iface('eth0', '192.168.2.10', { mask: '255.255.255.0', gw: '192.168.2.1', dns: '8.8.8.8' }),
    ]),
    device('ap1', 'access_point', 'WiFi-Casa', 220, 300, [
      iface('eth0', '192.168.3.10', { mask: '255.255.255.0', gw: '192.168.3.1', dns: '8.8.8.8' }),
    ]),
    device('printer1', 'printer', 'Impressora', 340, 300, [
      iface('eth0', '192.168.3.11', { mask: '255.255.255.0', gw: '192.168.3.1', dns: '8.8.8.8' }),
    ]),
    device('cloud1', 'cloud', 'Internet', 680, 120, [
      iface('eth0', '203.0.113.2', { mask: '255.255.255.252', gw: '203.0.113.1' }),
    ]),
  ], [
    conn('core1', 'eth0', 'switch1', 'f0/1'),
    conn('switch1', 'f0/2', 'pc1', 'eth0'),
    conn('switch1', 'f0/3', 'pc2', 'eth0'),
    conn('core1', 'eth1', 'server1', 'eth0'),
    conn('core1', 'eth2', 'ap1', 'eth0'),
    conn('switch1', 'f0/4', 'printer1', 'eth0'),
    conn('core1', 'eth3', 'cloud1', 'eth0'),
  ]);

const enterpriseNetwork = (): Topology =>
  topology('ex-emp', 'Rede Empresarial', [
    device('cloud1', 'cloud', 'Internet', 680, 120, [
      iface('eth0', '200.100.50.2', { mask: '255.255.255.252', gw: '200.100.50.1' }),
    ]),
    device('fw1', 'firewall', 'FW-Edge', 500, 120, [
      iface('eth0', '200.100.50.1', { mask: '255.255.255.252' }),
      iface('eth1', '10.0.0.1', { mask: '255.255.255.0' }),
    ]),
    device('core1', 'core', 'CORE', 300, 120, [
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
  ], [
    conn('cloud1', 'eth0', 'fw1', 'eth0'),
    conn('fw1', 'eth1', 'core1', 'eth0'),
    conn('core1', 'eth1', 'sw1', 'f0/1'),
    conn('core1', 'eth2', 'sw2', 'f0/1'),
    conn('sw1', 'f0/2', 'pc1', 'eth0'),
    conn('sw1', 'f0/3', 'pc2', 'eth0'),
    conn('sw2', 'f0/2', 'pc3', 'eth0'),
    conn('sw2', 'f0/3', 'pc4', 'eth0'),
    conn('sw1', 'f0/1', 'server1', 'eth0'),
  ]);

const starNetwork = (): Topology =>
  topology('ex-star', 'Rede em Estrela', [
    device('router1', 'router', 'R-01', 420, 120, [
      iface('eth0', '10.0.0.1', { mask: '255.255.255.0' }),
      iface('eth1', '203.0.113.1', { mask: '255.255.255.252' }),
    ]),
    device('cloud1', 'cloud', 'Internet', 680, 120, [
      iface('eth0', '203.0.113.2', { mask: '255.255.255.252', gw: '203.0.113.1' }),
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
  ], [
    conn('router1', 'eth0', 'sw1', 'f0/1'),
    conn('router1', 'eth1', 'cloud1', 'eth0'),
    conn('sw1', 'f0/2', 'pc1', 'eth0'),
    conn('sw1', 'f0/3', 'pc2', 'eth0'),
    conn('sw1', 'f0/4', 'pc3', 'eth0'),
    conn('sw1', 'f0/5', 'pc4', 'eth0'),
    conn('sw1', 'f0/1', 'server1', 'eth0'),
  ]);

export const NETWORK_EXAMPLES: (() => Topology)[] = [
  homeNetwork,
  enterpriseNetwork,
  starNetwork,
];
