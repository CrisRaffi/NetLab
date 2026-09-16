import { Calculator } from 'lucide-react';
import type { NetworkInterface } from '../../types';
import {
  isValidIp,
  isValidMask,
  maskToCidr,
  getNetworkAddress,
  getBroadcastAddress,
  getUsableHosts,
  cidrToMask,
  ipToNumber,
  numberToIp,
} from '../../utils/ip';

function IpCalculator({ iface }: { iface: NetworkInterface }) {
  const ip = iface.ip ?? '';
  const mask = iface.subnetMask ?? '';
  const valid = isValidIp(ip) && isValidMask(mask);
  const cidr = valid ? maskToCidr(mask) : 0;
  const usable = valid ? getUsableHosts(cidr) : 0;
  const network = valid ? getNetworkAddress(ip, mask) : '';
  const broadcast = valid ? getBroadcastAddress(ip, mask) : '';
  const firstHost = valid && usable > 0 ? numberToIp(ipToNumber(network) + 1) : '';
  const lastHost = valid && usable > 0 ? numberToIp(ipToNumber(broadcast) - 1) : '';

  const rows: [string, string][] = valid
    ? [
        ['CIDR', `/${cidr}`],
        ['Rede', network],
        ['Broadcast', broadcast],
        ['1º host', firstHost],
        ['Último host', lastHost],
        ['Hosts úteis', String(usable)],
      ]
    : [];

  return (
    <div className="rounded-lg border border-[--color-border-primary]/40 bg-[#0D1424]/60 p-2.5">
      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[--color-text-muted] font-semibold mb-1.5">
        <Calculator size={10} />
        Calculadora de rede
      </div>
      {valid ? (
        <dl className="space-y-1 min-w-0">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-2 text-[10px] min-w-0">
              <dt className="text-[--color-text-muted] shrink-0">{k}</dt>
              <dd className="font-mono text-[--color-accent-green] truncate">{v}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-[10px] text-[--color-text-muted]">
          Preencha IP e máscara válidos para calcular rede, broadcast e hosts.
        </p>
      )}
      {valid && cidrToMask(cidr) !== mask && (
        <p className="mt-1.5 text-[9px] text-[--color-accent-yellow]">
          Máscara fora de padrão: equivalente {cidrToMask(cidr)} (/{cidr}).
        </p>
      )}
    </div>
  );
}

export { IpCalculator };