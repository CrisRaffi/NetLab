import type { Topology, Device, NetworkInterface } from '../../types';
import { buildDnsPacket } from './PacketFactory';
import { pathWithFlooding, buildIpIndex, computeL2Neighbors, type Transmission } from './network';

export interface DnsLookupOutcome {
  ip?: string;
  lines: string[];
  transmissions: Transmission[];
}

const EXTERNAL_SERVER = '8.8.8.8';

function configuredDnsServer(topology: Topology, device: Device): { server: Device; ip: string } | undefined {
  const dnsIp = device.interfaces.find(i => i.status === 'up' && i.dns)?.dns;
  if (!dnsIp) return undefined;
  const ipIndex = buildIpIndex(topology);
  const entry = ipIndex.get(dnsIp);
  const server = entry ? topology.devices.find(d => d.id === entry.deviceId) : undefined;
  if (server && server.type === 'server') return { server, ip: dnsIp };
  return undefined;
}

function lookupRecords(server: Device, name: string): string | undefined {
  const records = server.config.dnsRecords ?? [];
  const exact = records.find(r => r.name.toLowerCase() === name);
  if (exact) return exact.ip;
  const byIp = records.find(r => {
    const [host, domain] = name.split('.');
    const [rh, rd] = r.name.split('.');
    return (host && domain && host === rh && domain === rd);
  });
  if (byIp) return byIp.ip;
  return undefined;
}

function queryTransmissions(
  topology: Topology,
  sourceId: string,
  sourceIface: NetworkInterface,
  server: Device,
  serverIp: string,
  name: string,
  answers: string[],
): Transmission[] {
  const forward = pathWithFlooding(topology, [sourceId, server.id]);
  const backward = pathWithFlooding(topology, [sourceId, server.id], true);
  const serverMac = server.interfaces.find(i => i.status === 'up' && i.ip === serverIp)?.mac ?? 'AA:AA:AA:AA:AA:AA';
  const srcIp = sourceIface.ip ?? '';
  return [
    {
      packet: buildDnsPacket('Query', sourceIface.mac, serverMac, srcIp, serverIp, name, answers),
      points: forward.points,
      branches: forward.branches,
    },
    {
      packet: buildDnsPacket('Response', serverMac, sourceIface.mac, serverIp, srcIp, name, answers, 49300, 49300),
      points: backward.points,
      branches: backward.branches,
    },
  ];
}

export function resolveDns(topology: Topology, sourceDeviceId: string, rawName: string): DnsLookupOutcome {
  const name = rawName.trim().toLowerCase();
  const device = topology.devices.find(d => d.id === sourceDeviceId);
  if (!device) {
    return { lines: ['Falha: equipamento não encontrado.'], transmissions: [] };
  }
  const sourceIface = device.interfaces.find(i => i.status === 'up' && i.ip);
  if (!sourceIface) {
    return { lines: ['O adaptador de rede não possui endereço IP configurado.'], transmissions: [] };
  }

  const configured = configuredDnsServer(topology, device);
  if (configured) {
    const answer = lookupRecords(configured.server, name);
    const transmissions = queryTransmissions(topology, device.id, sourceIface, configured.server, configured.ip, name, answer ? [answer] : []);
    if (answer === '0.0.0.0') {
      return {
        transmissions,
        lines: [
          `Servidor:  ${configured.server.name}`,
          `Address:  ${configured.ip}`,
          '',
          `Resp. de ${configured.ip}: não autoritativa`,
          `Nome:    ${name}`,
          'Address:  0.0.0.0 (bloqueado)',
        ],
      };
    }
    if (answer) {
      return {
        ip: answer,
        transmissions,
        lines: [
          `Servidor:  ${configured.server.name}`,
          `Address:  ${configured.ip}`,
          '',
          `Resp. de ${configured.ip}: não autoritativa`,
          `Nome:    ${name}`,
          `Address:  ${answer}`,
        ],
      };
    }
    return {
      transmissions,
      lines: [
        `Servidor:  ${configured.server.name}`,
        `Address:  ${configured.ip}`,
        '',
        `*** ${configured.ip} não pode encontrar ${rawName}: Non-existent domain`,
      ],
    };
  }

  // Fallback (hostname estático) — comportamento do nslookup clássico.
  const found = topology.devices.find(
    d =>
      d.config.hostname.toLowerCase() === name ||
      d.name.toLowerCase() === name ||
      d.config.hostname.toLowerCase().startsWith(name) ||
      d.name.toLowerCase().startsWith(name),
  );
  if (!found) {
    const l2 = computeL2Neighbors(topology);
    const reachExternal = (l2.get(device.id) ?? new Set<string>()).size > 0;
    const transmissions = reachExternal ? queryTransmissions(topology, device.id, sourceIface, { ...device, id: device.id } as Device, EXTERNAL_SERVER, name, []) : [];
    return {
      transmissions,
      lines: [
        `Servidor:  ${EXTERNAL_SERVER}`,
        `Address:  ${EXTERNAL_SERVER}`,
        '',
        `*** ${EXTERNAL_SERVER} não pode encontrar ${rawName}: Non-existent domain`,
      ],
    };
  }
  const ip = found.interfaces.find(i => i.ip)?.ip;
  return {
    ip,
    transmissions: [],
    lines: [
      `Servidor:  ${EXTERNAL_SERVER}`,
      `Address:  ${EXTERNAL_SERVER}`,
      '',
      `Nome:    ${found.name}`,
      `Address:  ${ip ?? 'sem endereço IP'}`,
    ],
  };
}