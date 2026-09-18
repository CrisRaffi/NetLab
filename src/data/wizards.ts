import type { Topology, NetworkInterface } from '../types';
import type { WizardScenario } from '../engine/wizard';
import { getNetworkAddress, maskToCidr } from '../utils/ip';

function iface(
  id: string,
  ip?: string,
  opts: { mask?: string; gw?: string } = {},
): NetworkInterface {
  return {
    id,
    name: id,
    type: 'ethernet',
    mac: `CC:11:${id.replace(/\D/g, '').padStart(4, '0').slice(-4).replace(/(..)(..)/, '$1:$2')}:00:00`,
    ip: ip ?? undefined,
    subnetMask: opts.mask,
    gateway: opts.gw,
    status: 'up',
    speed: 100,
  };
}

function dev(
  id: string,
  type: string,
  name: string,
  x: number,
  y: number,
  interfaces: NetworkInterface[],
): Topology['devices'][number] {
  return {
    id,
    type: type as Topology['devices'][number]['type'],
    name,
    position: { x, y },
    interfaces,
    config: { hostname: name, routes: [] },
  };
}

const pcs = (topology: Topology) => topology.devices.filter(d => d.type === 'pc');
const switches = (topology: Topology) => topology.devices.filter(d => d.type === 'switch');
const routers = (topology: Topology) => topology.devices.filter(d => d.type === 'router');
const clouds = (topology: Topology) => topology.devices.filter(d => d.type === 'cloud');

const connectedBetween = (topology: Topology, a: string, b: string) =>
  topology.connections.some(
    c =>
      (c.deviceId1 === a && c.deviceId2 === b) ||
      (c.deviceId1 === b && c.deviceId2 === a),
  );

const hasIpIn = (topology: Topology, deviceId: string, network: string, cidr: number, gateway?: string) => {
  const d = topology.devices.find(x => x.id === deviceId);
  const i = d?.interfaces.find(x => x.status === 'up' && x.ip && x.subnetMask);
  if (!i?.ip || !i.subnetMask) return { ok: false, why: 'sem IP/máscara configurados' };
  if (getNetworkAddress(i.ip, i.subnetMask) !== getNetworkAddress(network, `255.255.255.0`)) return { ok: false, why: `IP não pertence à rede ${network}` };
  if (maskToCidr(i.subnetMask) !== cidr) return { ok: false, why: 'máscara diferente de /24' };
  if (gateway && i.gateway !== gateway) return { ok: false, why: `gateway deve ser ${gateway}` };
  return { ok: true };
};

function base1(): Topology {
  return {
    id: `wiz-basic-${Date.now()}`,
    name: 'Wizard — Primeira Rede',
    devices: [],
    connections: [],
    blocks: [],
  };
}

function base2(): Topology {
  return {
    id: `wiz-internet-${Date.now()}`,
    name: 'Wizard — Rede com Internet',
    devices: [
      dev('wz-router', 'router', 'R-01', 500, 140, [
        iface('wz-r-lan', '10.0.0.1', { mask: '255.255.255.0' }),
        iface('wz-r-wan', '203.0.113.1', { mask: '255.255.255.252', gw: '203.0.113.2' }),
      ]),
      dev('wz-cloud', 'cloud', 'Internet (Nuvem)', 700, 140, [
        iface('wz-c', '203.0.113.2', { mask: '255.255.255.252', gw: '203.0.113.1' }),
      ]),
      dev('wz-switch', 'switch', 'SW-01', 280, 140, [
        iface('wz-s-1'), iface('wz-s-2'), iface('wz-s-3'),
      ]),
      dev('wz-pc1', 'pc', 'PC-01', 60, 60, [iface('wz-pc1')]),
      dev('wz-pc2', 'pc', 'PC-02', 60, 220, [iface('wz-pc2')]),
    ],
    connections: [],
    blocks: [],
  };
}

export const WIZARD_SCENARIOS: WizardScenario[] = [
  {
    id: 'basic-net',
    title: 'Primeira rede de computadores',
    description:
      'Monte uma rede simples com dois PCs conectados por um switch e valide com ping.',
    base: base1,
    steps: [
      {
        id: 'add-pcs',
        title: 'Crie 2 PCs',
        description: 'Arraste dois computadores (PC) para o quadro.',
        hint: 'Use o menu de equipamentos no topo para adicionar um PC.',
        check: (t) => ({
          passed: pcs(t).length >= 2,
          detail: `PCs no quadro: ${pcs(t).length}/2`,
        }),
      },
      {
        id: 'cable',
        title: 'Conecte os PCs',
        description: 'Ligue cada PC ao outro com um cabo (ou a um switch).',
        hint: 'Selecione "Conectar" e clique nos dois PCs.',
        check: (t) => {
          const list = pcs(t);
          const cabled = list.some((a, i) =>
            list.some((b, j) => j > i && connectedBetween(t, a.id, b.id)),
          );
          return { passed: cabled, detail: cabled ? undefined : 'Nenhum cabo entre PCs' };
        },
      },
      {
        id: 'ips',
        title: 'Configure os endereços IP',
        description: 'Cada PC precisa de IP e máscara na rede 192.168.1.0/24.',
        hint: 'Abra as propriedades do PC → Interface → Endereço IP, ou use "Auto configurar".',
        check: (t) => {
          const list = pcs(t).slice(0, 2);
          if (list.length < 2) return { passed: false, detail: 'Ainda faltam PCs.' };
          const results = list.map(d => hasIpIn(t, d.id, '192.168.1.0', 24));
          return { passed: results.every(r => r.ok), detail: results.find(r => !r.ok)?.why };
        },
      },
      {
        id: 'ping',
        title: 'Teste com ping',
        description: 'Abra o console de um PC e dê um ping no outro.',
        hint: 'Terminal de PC-01: ping PC-02 (ou ping 192.168.1.x com o IP do outro).',
        check: (t) => {
          const list = pcs(t).slice(0, 2);
          if (list.length < 2) return { passed: false, detail: 'Ainda faltam PCs.' };
          const networks = list
            .map(d => d.interfaces.find(i => i.ip && i.subnetMask))
            .filter(Boolean);
          const sameSubnet =
            networks.length === 2 &&
            networks[0]!.subnetMask &&
            networks[1]!.subnetMask &&
            getNetworkAddress(networks[0]!.ip!, networks[0]!.subnetMask) ===
              getNetworkAddress(networks[1]!.ip!, networks[1]!.subnetMask);
          return { passed: !!sameSubnet, detail: sameSubnet ? undefined : 'Os PCs precisam estar na mesma rede' };
        },
      },
    ],
  },
  {
    id: 'internet-net',
    title: 'Rede com roteador e Internet',
    description:
      'Conecte uma rede local à Internet via roteador, configure os IPs e teste a navegação.',
    base: base2,
    steps: [
      {
        id: 'lan-cable',
        title: 'Conecte os PCs ao switch',
        description: 'Ligue PC-01 e PC-02 ao switch SW-01.',
        hint: 'Use o modo cabear: clique em conectar e nos equipamentos.',
        check: (t) => {
          const sw = switches(t)[0];
          const list = pcs(t);
          if (!sw) return { passed: false, detail: 'Falta o switch.' };
          const ok = list.every(p => connectedBetween(t, p.id, sw.id));
          return { passed: ok, detail: ok ? undefined : 'Todos os PCs devem estar no switch' };
        },
      },
      {
        id: 'uplink',
        title: 'Ponha o roteador no ar',
        description: 'Conecte o R-01 ao switch (LAN) e à Internet (Nuvem).',
        hint: 'R-01 possui duas portas: eth0 (LAN) e eth1 (WAN).',
        check: (t) => {
          const r = routers(t)[0];
          const sw = switches(t)[0];
          const cl = clouds(t)[0];
          if (!r || !sw || !cl) return { passed: false, detail: 'Equipamentos faltando.' };
          const lan = connectedBetween(t, r.id, sw.id);
          const wan = connectedBetween(t, r.id, cl.id);
          return {
            passed: lan && wan,
            detail: [lan ? undefined : 'Falta roteador→switch', wan ? undefined : 'Falta roteador→Internet']
              .filter(Boolean)
              .join(', ') || undefined,
          };
        },
      },
      {
        id: 'pc-ips',
        title: 'Configure os PCs',
        description: 'IPs na rede 10.0.0.0/24, máscara /24 e gateway 10.0.0.1.',
        hint: 'Propriedades do PC → Interface. Ex.: PC-01=10.0.0.10, PC-02=10.0.0.11.',
        check: (t) => {
          const list = pcs(t).slice(0, 2);
          const results = list.map(d => hasIpIn(t, d.id, '10.0.0.0', 24, '10.0.0.1'));
          return { passed: results.every(r => r.ok), detail: results.find(r => !r.ok)?.why };
        },
      },
      {
        id: 'gateway-check',
        title: 'Confira a rota do roteador',
        description: 'A porta WAN do roteador deve apontar para a Internet via 203.0.113.2.',
        hint: 'Propriedades do R-01: a interface com IP 203.0.113.1 tem gateway 203.0.113.2.',
        check: (t) => {
          const r = routers(t)[0];
          const wan = r?.interfaces.find(i => i.ip === '203.0.113.1');
          return {
            passed: !!wan?.gateway && wan.gateway === '203.0.113.2',
            detail: wan?.gateway ? undefined : 'Gateway da WAN deve ser 203.0.113.2',
          };
        },
      },
      {
        id: 'ping-ext',
        title: 'Teste a Internet',
        description: 'De um PC, dê ping na Internet (203.0.113.2).',
        hint: 'Console do PC-01: ping 203.0.113.2',
        check: (t) => {
          const list = pcs(t).slice(0, 2);
          const ok = list.every(
            d =>
              d.interfaces.some(i => i.ip && getNetworkAddress(i.ip, '255.255.255.0') === '10.0.0.0') 
          );
          return {
            passed: ok,
            detail: ok ? 'Config pronta — teste também o comando web ou veja a tradução NAT no inspetor de pacotes.' : 'Configure os IPs dos PCs para concluir.',
          };
        },
      },
    ],
  },
];