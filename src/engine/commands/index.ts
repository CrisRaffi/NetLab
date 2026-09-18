import type { Topology } from '../../types';
import { ping, traceroute, getRoutingTable, formatIpconfig, buildIpIndex } from '../simulation/network';
import type { Transmission } from '../simulation/network';
import { renewDhcpLease, teardownDhcp, type DhcpLeaseResult } from '../simulation/dhcp';
import { resolveDns } from '../simulation/dns';
import { browseWeb } from '../simulation/web';
import type { ArpEntry } from '../protocols/arp';

export interface CommandContext {
  topology: Topology;
  deviceId: string;
  arpTable: ArpEntry[];
  dhcpLeases?: DhcpLeaseResult[];
}

export interface CommandResult {
  output: string[];
  transmissions: Transmission[];
  arpLearned: { deviceId: string; entry: ArpEntry }[];
  clear?: boolean;
  dhcpLease?: DhcpLeaseResult;
  dhcpRelease?: { deviceId: string; interfaceId: string };
}

export const COMMAND_HELP: { name: string; description: string; usage: string }[] = [
  { name: 'help', description: 'Exibe a lista de comandos disponíveis', usage: 'help' },
  { name: 'ipconfig', description: 'Mostra a configuração de rede do adaptador', usage: 'ipconfig [/all | /release | /renew]' },
  { name: 'ping', description: 'Testa a conectividade com outro host', usage: 'ping <ip>' },
  { name: 'tracert', description: 'Mostra o caminho até um destino, salto a salto', usage: 'tracert <ip>' },
  { name: 'arp', description: 'Mostra a tabela de resolução de endereços', usage: 'arp -a' },
  { name: 'route', description: 'Mostra a tabela de roteamento do host', usage: 'route print' },
  { name: 'nslookup', description: 'Resolve um nome de host para um endereço IP', usage: 'nslookup <hostname>' },
  { name: 'web', description: 'Navega em um servidor web (HTTP) por nome ou IP', usage: 'web <host|caminho> [porta]' },
  { name: 'netstat', description: 'Lista interfaces e conexões de rede', usage: 'netstat' },
  { name: 'cls', description: 'Limpa a tela do terminal', usage: 'cls' },
];

function dhcpReply(ctx: CommandContext, deviceId: string, flag: 'release' | 'renew', targetName?: string): CommandResult {
  const device = ctx.topology.devices.find(d => d.id === deviceId);
  if (!device) return { output: ['Equipamento não encontrado.'], transmissions: [], arpLearned: [] };

  const leases = ctx.dhcpLeases ?? [];
  const flagArg = flag === 'release' ? '/release' : '/renew';
  const targetIface =
    (targetName
      ? device.interfaces.find(i => i.id === targetName || i.name === targetName)
      : undefined) ??
    device.interfaces.find(i => leases.some(l => l.interfaceId === i.id)) ??
    device.interfaces.find(i => i.status === 'up' && (i.ip || flag === 'renew'));
  if (!targetIface) {
    return { output: [`An error occurred while renewing interface: the interface is not DHCP-enabled. (ipconfig ${flagArg})`], transmissions: [], arpLearned: [] };
  }

  if (flag === 'release') {
    const result = teardownDhcp(ctx.topology, deviceId, targetIface.id);
    return {
      output: result.output,
      transmissions: [],
      arpLearned: [],
      dhcpRelease: result.release,
    };
  }

  const result = renewDhcpLease(ctx.topology, deviceId, targetIface.id, leases);
  return {
    output: result.output,
    transmissions: result.transmissions,
    arpLearned: [],
    dhcpLease: result.lease,
  };
}

export function executeCommand(line: string, ctx: CommandContext): CommandResult {
  const trimmed = line.trim();
  const empty: CommandResult = { output: [], transmissions: [], arpLearned: [] };
  if (!trimmed) return empty;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  const device = ctx.topology.devices.find(d => d.id === ctx.deviceId);
  if (!device) return { ...empty, output: ['Equipamento não encontrado.'] };

  switch (cmd) {
    case 'help':
    case '?':
      return {
        ...empty,
        output: [
          'Comandos disponíveis:',
          ...COMMAND_HELP.map(c => `  ${c.usage.padEnd(24)}${c.description}`),
        ],
      };

    case 'cls':
    case 'clear':
      return { ...empty, clear: true };

    case 'ipconfig': {
      const flags = new Set(args);
      const all = flags.has('/all') || flags.has('-all');
      if (flags.has('/release') || flags.has('-release')) {
        return dhcpReply(ctx, ctx.deviceId, 'release', args.find(a => a !== '/release' && a !== '-release'));
      }
      if (flags.has('/renew') || flags.has('-renew')) {
        return dhcpReply(ctx, ctx.deviceId, 'renew', args.find(a => a !== '/renew' && a !== '-renew'));
      }
      return { ...empty, output: formatIpconfig(device, all, ctx.dhcpLeases ?? []) };
    }

    case 'ping':
    case 'ping6': {
      if (!args[0]) return { ...empty, output: ['Uso: ping <endereço-ip>'] };
      const result = ping(ctx.topology, ctx.deviceId, args[0]);
      return { output: result.output, transmissions: result.transmissions, arpLearned: result.arpLearned };
    }

    case 'tracert':
    case 'traceroute': {
      if (!args[0]) return { ...empty, output: ['Uso: tracert <endereço-ip>'] };
      const result = traceroute(ctx.topology, ctx.deviceId, args[0]);
      return { output: result.output, transmissions: result.transmissions, arpLearned: [] };
    }

    case 'arp': {
      if (ctx.arpTable.length === 0) {
        return { ...empty, output: ['Nenhuma entrada ARP encontrada.'] };
      }
      return {
        ...empty,
        output: [
          'Interface: ' + (ctx.arpTable[0]?.interfaceName ?? '-'),
          `${'Endereço IP'.padEnd(20)}${'Endereço Físico'.padEnd(22)}Tipo`,
          ...ctx.arpTable.map(e => `${e.ip.padEnd(20)}${e.mac.padEnd(22)}dinâmico`),
        ],
      };
    }

    case 'route': {
      if (args[0] && args[0].toLowerCase() !== 'print') {
        return { ...empty, output: [`Opção desconhecida: ${args[0]}. Use: route print`] };
      }
      return { ...empty, output: getRoutingTable(ctx.topology, ctx.deviceId) };
    }

    case 'nslookup': {
      if (!args[0]) return { ...empty, output: ['Uso: nslookup <hostname>'] };
      const lookup = resolveDns(ctx.topology, ctx.deviceId, args[0]);
      return { output: lookup.lines, transmissions: lookup.transmissions, arpLearned: [] };
    }

    case 'web':
    case 'http': {
      if (!args[0]) return { ...empty, output: ['Uso: web <host> [porta]', '', 'Exemplos:', '  web matriculas.escola.local', '  web 172.16.0.100 8080'] };
      const target = args[0].replace(/^https?:\/\//, '').split('/')[0] ?? args[0];
      const result = browseWeb(ctx.topology, ctx.deviceId, target, args[1]);
      return { output: result.output, transmissions: result.transmissions, arpLearned: result.arpLearned };
    }

    case 'netstat': {
      const ipIndex = buildIpIndex(ctx.topology);
      const own = [...ipIndex.values()].filter(v => v.deviceId === ctx.deviceId);
      const leases = ctx.dhcpLeases ?? [];
      const lines = [
        'Conexões ativas',
        '',
        `${'Nome'.padEnd(12)}${'Endereço local'.padEnd(20)}Status`,
      ];
      if (own.length === 0) lines.push('(nenhuma interface configurada)');
      for (const entry of own) {
        const lease = leases.find(l => l.deviceId === ctx.deviceId && l.interfaceId === entry.interfaceId);
        lines.push(`${device.name.slice(0, 11).padEnd(12)}${(entry.iface.ip ?? '-').padEnd(20)}${lease ? `DHCP (${lease.serverIp})` : 'ESCUTANDO'}`);
      }
      return { ...empty, output: lines };
    }

    default:
      return {
        ...empty,
        output: [`'${parts[0]}' não é reconhecido como um comando interno ou externo.`, "Digite 'help' para ver os comandos disponíveis."],
      };
  }
}

export function getAutocomplete(prefix: string): string[] {
  const p = prefix.toLowerCase();
  return COMMAND_HELP.map(c => c.name).filter(n => n.startsWith(p));
}