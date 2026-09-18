import type { Topology, SimulatedPacket, NetworkInterface } from '../../types';
import { isValidIp, isSameSubnet } from '../../utils/ip';
import {
  findRoute,
  buildIpIndex,
  lookupRoute,
  pathWithFlooding,
  type Transmission,
} from './network';
import { buildArpRequest, buildArpReply, buildTcpSegment } from './PacketFactory';
import { buildHttpLayer } from '../protocols/http';
import { resolveDns } from './dns';
import { findNatOnPath, translateForNat } from './nat';
import type { ArpEntry } from '../protocols/arp';

export interface WebOutcome {
  success: boolean;
  output: string[];
  transmissions: Transmission[];
  arpLearned: { deviceId: string; entry: ArpEntry }[];
}

function push(path: { x: number; y: number }[], branches: { points: { x: number; y: number }[]; startFraction: number }[] | undefined, packet: SimulatedPacket, transmissions: Transmission[]) {
  transmissions.push({ packet, points: path, branches });
}

export function browseWeb(topology: Topology, sourceDeviceId: string, rawTarget: string, rawPort?: string): WebOutcome {
  const port = rawPort ? Math.max(1, Math.min(65535, Number.parseInt(rawPort, 10) || 80)) : 80;
  const deviceById = new Map(topology.devices.map(d => [d.id, d]));
  const source = deviceById.get(sourceDeviceId);
  if (!source) {
    return { success: false, output: ['Falha: equipamento não encontrado.'], transmissions: [], arpLearned: [] };
  }

  const srcIface = source.interfaces.find(i => i.status === 'up' && i.ip && i.subnetMask);
  if (!srcIface) {
    return { success: false, output: ['O adaptador de rede não possui endereço IP configurado.'], transmissions: [], arpLearned: [] };
  }

  const hostname = rawTarget.trim();
  let targetIp = isValidIp(hostname) ? hostname : undefined;
  let dnsTransmissions: Transmission[] = [];

  if (!targetIp) {
    const lookup = resolveDns(topology, sourceDeviceId, hostname);
    dnsTransmissions = lookup.transmissions;
    targetIp = lookup.ip;
    if (!targetIp) {
      return {
        success: false,
        output: [
          `Acessando http://${hostname}/ ...`,
          `Não foi possível resolver o nome ${hostname}.`,
        ],
        transmissions: dnsTransmissions,
        arpLearned: [],
      };
    }
  }

  const route = findRoute(topology, sourceDeviceId, targetIp);
  const ipIndex = buildIpIndex(topology);
  const targetEntry = ipIndex.get(targetIp);
  const targetIface = targetEntry?.iface;

  if (!route.delivered || !targetEntry || !targetIface) {
    return {
      success: false,
      output: [
        `Acessando http://${hostname}/ na porta ${port}...`,
        'Ocorreu um erro de rede: servidor de destino inacessível.',
        'Consulte as rotas e o estado dos cabos.',
      ],
      transmissions: [...dnsTransmissions],
      arpLearned: [],
    };
  }

  const transmissions: Transmission[] = [...dnsTransmissions];
  const arpLearned: { deviceId: string; entry: ArpEntry }[] = [];

  const routeDecision = lookupRoute(source, targetIp);
  const firstHop = route.path[1];
  const nextHopIp = firstHop === targetEntry.deviceId ? targetIp : (routeDecision?.gateway ?? targetIp);
  const nextHopEntry = ipIndex.get(nextHopIp);
  const nextHopMac = nextHopEntry?.iface.mac ?? 'FF:FF:FF:FF:FF:FF';

  const arpSource: NetworkInterface =
    source.interfaces.find(i => i.status === 'up' && i.ip && isSameSubnet(i.ip, nextHopIp, i.subnetMask ?? '255.255.255.0')) ??
    srcIface;

  const forward = pathWithFlooding(topology, route.path);
  const backward = pathWithFlooding(topology, route.path, true);

  if (nextHopEntry && nextHopIp !== arpSource.ip) {
    const arpFwd = pathWithFlooding(topology, [sourceDeviceId, nextHopEntry.deviceId]);
    const arpBwd = pathWithFlooding(topology, [sourceDeviceId, nextHopEntry.deviceId], true);
    push(arpFwd.points, arpFwd.branches, buildArpRequest(arpSource, arpSource.ip!, nextHopIp), transmissions);
    push(arpBwd.points, arpBwd.branches, buildArpReply(nextHopEntry.iface, nextHopIp, arpSource.mac, arpSource.ip!), transmissions);
    arpLearned.push({ deviceId: sourceDeviceId, entry: { ip: nextHopIp, mac: nextHopEntry.iface.mac, interfaceName: arpSource.name } });
    arpLearned.push({ deviceId: nextHopEntry.deviceId, entry: { ip: arpSource.ip!, mac: arpSource.mac, interfaceName: nextHopEntry.iface.name } });
  }

  const cSeq = Math.floor(Math.random() * 200000000) + 100000000;
  const sSeq = Math.floor(Math.random() * 400000000) + 100000000;
  const srcPort = 49152 + Math.floor(Math.random() * 10000);

  const clientMac = arpSource.mac;
  const serverMac = targetIface.mac;
  const serverIp = targetIp;

  const synOut = buildTcpSegment('SYN', clientMac, nextHopMac, arpSource.ip!, serverIp, srcPort, port, cSeq, 0);
  const synAckOut = buildTcpSegment('SYN-ACK', serverMac, clientMac, serverIp, arpSource.ip!, port, srcPort, sSeq, cSeq + 1);
  const ackOut = buildTcpSegment('ACK', clientMac, nextHopMac, arpSource.ip!, serverIp, srcPort, port, cSeq + 1, sSeq + 1);
  const getOut = buildTcpSegment('PSH-ACK', clientMac, nextHopMac, arpSource.ip!, serverIp, srcPort, port, cSeq + 1, sSeq + 1, [buildHttpLayer('GET', hostname)]);
  const respOut = buildTcpSegment('PSH-ACK', serverMac, clientMac, serverIp, arpSource.ip!, port, srcPort, sSeq + 1, cSeq + 2, [buildHttpLayer('Reply', hostname, { 'Tamanho': '724 bytes' })]);
  const finOut = buildTcpSegment('FIN-ACK', clientMac, nextHopMac, arpSource.ip!, serverIp, srcPort, port, cSeq + 2, sSeq + 2);
  const finAckOut = buildTcpSegment('FIN-ACK', serverMac, clientMac, serverIp, arpSource.ip!, port, srcPort, sSeq + 2, cSeq + 3);

  const nat = findNatOnPath(topology, route.path);

  const clientToServer = [
    { packet: synOut, fwd: true },
    { packet: ackOut, fwd: true },
    { packet: getOut, fwd: true },
    { packet: finOut, fwd: true },
  ];
  const serverToClient = [
    { packet: synAckOut, fwd: false },
    { packet: respOut, fwd: false },
    { packet: finAckOut, fwd: false },
  ];

  const asPath = (fwd: boolean) =>
    fwd
      ? { points: forward.points, branches: forward.branches }
      : { points: backward.points, branches: backward.branches };

  for (const step of [...clientToServer, ...serverToClient]) {
    const packet = step.fwd
      ? nat
        ? translateForNat(step.packet, 'outbound', nat)
        : step.packet
      : nat
        ? translateForNat(step.packet, 'inbound', nat)
        : step.packet;
    const { points, branches } = asPath(step.fwd);
    push(points, branches, packet, transmissions);
  }

  const output = [
    `Acessando http://${hostname}/ na porta ${port}...`,
    ...(dnsTransmissions.length ? [`Nome resolvido: ${hostname} → ${targetIp}`] : []),
    'Handshake TCP (3 vias):',
    '  [SYN] --------->',
    '  <--------- [SYN/ACK]',
    '  [ACK] ---------> conexão estabelecida',
    `Enviando requisição HTTP GET /`,
    'Recebida resposta HTTP/1.1 200 OK (HTML, 724 bytes)',
    nat ? `Tráfego traduzido via NAT/PAT por ${nat.deviceName} (IP público ${nat.publicIp}).` : '',
    'Conectado com sucesso!',
  ].filter(Boolean);

  return { success: true, output, transmissions, arpLearned };
}