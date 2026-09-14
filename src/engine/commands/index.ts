import type { Topology } from '../../types';
import { ping, traceroute, getRoutingTable, formatIpconfig, buildIpIndex } from '../simulation/network';
import type { Transmission } from '../simulation/network';
import type { ArpEntry } from '../protocols/arp';

export interface CommandContext {
  topology: Topology;
  deviceId: string;
  arpTable: ArpEntry[];
}

export interface CommandResult {
  output: string[];
  transmissions: Transmission[];
  arpLearned: { deviceId: string; entry: ArpEntry }[];
  clear?: boolean;
}

export const COMMAND_HELP: { name: string; description: string; usage: string }[] = [
  { name: 'help', description: 'Exibe a lista de comandos disponíveis', usage: 'help' },
  { name: 'ipconfig', description: 'Mostra a configuração de rede do adaptador', usage: 'ipconfig [/all]' },
  { name: 'ping', description: 'Testa a conectividade com outro host', usage: 'ping <ip>' },
  { name: 'tracert', description: 'Mostra o caminho até um destino, salto a salto', usage: 'tracert <ip>' },
  { name: 'arp', description: 'Mostra a tabela de resolução de endereços', usage: 'arp -a' },
  { name: 'route', description: 'Mostra a tabela de roteamento do host', usage: 'route print' },
  { name: 'nslookup', description: 'Resolve um nome de host para um endereço IP', usage: 'nslookup <hostname>' },
  { name: 'netstat', description: 'Lista interfaces e conexões de rede', usage: 'netstat' },
  { name: 'cls', description: 'Limpa a tela do terminal', usage: 'cls' },
];

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
          ...COMMAND_HELP.map(c => `  ${c.usage.padEnd(22)}${c.description}`),
        ],
      };

    case 'cls':
    case 'clear':
      return { ...empty, clear: true };

    case 'ipconfig': {
      const all = args.includes('/all') || args.includes('-all');
      return { ...empty, output: formatIpconfig(device, all) };
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
      const query = args[0].toLowerCase();
      const found = ctx.topology.devices.find(
        d =>
          d.config.hostname.toLowerCase() === query ||
          d.config.hostname.toLowerCase().startsWith(query) ||
          d.name.toLowerCase() === query ||
          d.name.toLowerCase().startsWith(query)
      );
      if (!found) {
        return { ...empty, output: ['Servidor: 8.8.8.8', 'Address:  8.8.8.8', '', `*** 8.8.8.8 não pode encontrar ${args[0]}: Non-existent domain`] };
      }
      const ipIndex = buildIpIndex(ctx.topology);
      const ip = found.interfaces.find(i => i.ip)?.ip;
      const matchedIp = [...ipIndex.values()].find(v => v.deviceId === found.id)?.iface.ip;
      return {
        ...empty,
        output: [
          'Servidor: 8.8.8.8',
          'Address:  8.8.8.8',
          '',
          `Nome:    ${found.name}`,
          `Address: ${matchedIp ?? ip ?? 'sem endereço IP'}`,
        ],
      };
    }

    case 'netstat': {
      const ipIndex = buildIpIndex(ctx.topology);
      const own = [...ipIndex.values()].filter(v => v.deviceId === ctx.deviceId);
      const lines = [
        'Conexões ativas',
        '',
        `${'Nome'.padEnd(12)}${'Endereço local'.padEnd(20)}Status`,
      ];
      if (own.length === 0) lines.push('(nenhuma interface configurada)');
      for (const entry of own) {
        lines.push(`${device.name.slice(0, 11).padEnd(12)}${entry.iface.ip!.padEnd(20)}ESCUTANDO`);
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
