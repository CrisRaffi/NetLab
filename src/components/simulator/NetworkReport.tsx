import { useState } from 'react';
import {
  Download,
  Copy,
  X,
  FileJson2,
  Boxes,
  Cable,
  Globe,
} from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { buildNetworkReport, downloadNetworkReport } from '../../engine/report';
import { clsx } from 'clsx';

const STATUS_LABEL: Record<string, string> = {
  connected: 'Ativo',
  negotiating: 'Negociando',
  disconnected: 'Inativo',
};

export function NetworkReport({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const topology = useSimulatorStore((s) => s.topology);
  const leases = useSimulatorStore((s) => s.dhcpLeases) ?? [];
  const [copied, setCopied] = useState(false);

  const report = buildNetworkReport(
    topology,
    leases.map((l) => ({
      deviceId: l.deviceId,
      deviceName:
        topology.devices.find((d) => d.id === l.deviceId)?.name ?? l.deviceId,
      interfaceId: l.interfaceId,
      ip: l.ip,
      serverId: l.serverId,
      serverName: l.networkName,
      leaseTime: l.leaseTime,
    })),
  );

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const chips = [
    {
      icon: <Boxes size={11} />,
      label: 'Equipamentos',
      value: report.summary.devices,
    },
    {
      icon: <Cable size={11} />,
      label: 'Ligações',
      value: report.summary.connections,
    },
    {
      icon: <Globe size={11} />,
      label: 'IPs configurados',
      value: report.summary.interfacesWithIp,
    },
    {
      icon: <Boxes size={11} />,
      label: 'Sub-redes',
      value: report.summary.subnets,
    },
    {
      icon: <Boxes size={11} />,
      label: 'Leases DHCP',
      value: report.summary.leases,
    },
  ];

  return (
    <div className="rmodal-overlay">
      <div className="rmodal-panel animate-fade-in-up">
        {/* Header */}
        <div className="rmodal-header">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[--color-accent-cyan]/10 border border-[--color-accent-cyan]/30 shrink-0">
              <FileJson2 size={15} className="text-[--color-accent-cyan]" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-[--color-text-primary]">
                Relatório da rede
              </h2>
              <p className="text-[10px] text-[--color-text-muted] truncate">
                {report.topology.name} — tudo o que está no quadro e nas
                ligações
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => downloadNetworkReport(report)}
              title="Baixar relatório (.json)"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[--color-border-primary]/60 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-accent-cyan]/40 transition-colors cursor-pointer"
            >
              <Download size={11} /> .json
            </button>
            <button
              onClick={copy}
              title="Copiar relatório"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[--color-border-primary]/60 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-accent-cyan]/40 transition-colors cursor-pointer"
            >
              <Copy size={11} /> {copied ? 'Copiado!' : 'Copiar'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer"
              title="Fechar"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="rmodal-body space-y-4">
          {/* Summary chips */}
          <div className="grid grid-cols-5 gap-2">
            {chips.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-[--color-border-primary]/40 bg-[#111A2C]/40 px-2.5 py-2 text-center"
              >
                <div className="flex items-center justify-center gap-1 text-[--color-accent-cyan]">
                  {c.icon}
                </div>
                <p className="text-lg font-bold font-mono text-[--color-text-primary] mt-0.5">
                  {c.value}
                </p>
                <p className="text-[9px] text-[--color-text-muted] uppercase tracking-wide">
                  {c.label}
                </p>
              </div>
            ))}
          </div>

          {/* Subnets (verificação rápida) */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[--color-text-muted] mb-2">
              Sub-redes por VLAN/rede
            </p>
            <div className="space-y-2">
              {report.subnets.length === 0 && (
                <p className="text-[10px] text-[--color-text-muted]/70">
                  Nenhuma interface com IP/máscara configurados.
                </p>
              )}
              {report.subnets.map((s) => (
                <div
                  key={`${s.network}/${s.cidr}`}
                  className="rounded-lg border border-[--color-border-primary]/40 bg-[#111A2C]/40 px-3 py-2"
                >
                  <p className="text-[11px] font-mono text-[--color-accent-green]">
                    {s.network}/{s.cidr}{' '}
                    <span className="text-[--color-text-muted]">
                      ({s.mask})
                    </span>
                  </p>
                  <p className="text-[9px] text-[--color-text-muted] mt-1 leading-relaxed">
                    {s.members.map((m) => (
                      <span
                        key={`${m.deviceId}-${m.interfaceName}`}
                        className="mr-2"
                      >
                        {m.deviceName} · {m.interfaceName}:{' '}
                        <span className="text-[--color-text-secondary] font-mono">
                          {m.ip}
                        </span>
                        {m.isGateway && (
                          <span className="ml-1 text-[--color-accent-yellow]">
                            (gateway)
                          </span>
                        )}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* JSON preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[--color-text-muted]">
                JSON do relatório
              </p>
              <button
                onClick={copy}
                className="flex items-center gap-1 px-2 py-1 rounded-md border border-[--color-border-primary]/50 text-[9px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-accent-cyan]/40 transition-colors cursor-pointer"
                title="Copiar JSON"
              >
                <Copy size={9} /> {copied ? 'Copiado!' : 'Copiar JSON'}
              </button>
            </div>
            <div className="rounded-lg bg-[#0A0F1E]/90 border border-[--color-border-primary]/40 p-3 max-h-64 overflow-auto">
              <pre className="text-[10px] leading-relaxed font-mono text-[--color-text-secondary]">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          </div>

          {/* Connection list */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[--color-text-muted] mb-2">
              Ligações ({report.connections.length})
            </p>
            <div className="space-y-1">
              {report.connections.map((c) => {
                const blocked = c.effectiveVlan === 'blocked';
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg border border-[--color-border-primary]/40 bg-[#111A2C]/40 px-2.5 py-1.5 text-[10px]"
                  >
                    <span
                      className={clsx(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        c.status === 'connected' && !blocked
                          ? 'bg-[--color-status-connected]'
                          : 'bg-[--color-accent-red]',
                      )}
                    />
                    <span className="text-[--color-text-primary] font-medium truncate">
                      {c.device1.name}
                    </span>
                    <span className="text-[--color-text-muted] font-mono">
                      :{c.iface1.name}
                    </span>
                    <span className="text-[--color-text-muted]">
                      ─{c.type === 'wireless' ? 'wifi' : 'cabo'}─
                    </span>
                    <span className="text-[--color-text-primary] font-medium truncate">
                      {c.device2.name}
                    </span>
                    <span className="text-[--color-text-muted] font-mono">
                      :{c.iface2.name}
                    </span>
                    <span className="ml-auto shrink-0 text-[9px]">
                      {c.iface1.vlan != null && (
                        <span className="text-[--color-accent-orange] mr-1.5">
                          VLAN {c.iface1.vlan}
                        </span>
                      )}
                      {c.iface2.vlan != null && (
                        <span className="text-[--color-accent-orange] mr-1.5">
                          VLAN {c.iface2.vlan}
                        </span>
                      )}
                      {blocked ? (
                        <span className="text-[--color-accent-red]">
                          bloqueada
                        </span>
                      ) : (
                        <span className="text-[--color-text-muted]">
                          {c.effectiveVlan !== 1 &&
                          typeof c.effectiveVlan === 'number'
                            ? `VLAN ${c.effectiveVlan}`
                            : 'sem VLAN'}
                          · {STATUS_LABEL[c.status] ?? c.status}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="rmodal-footer">
          <p className="text-[9px] text-[--color-text-muted]/70">
            Exporte para conferir IPs, gateways, VLANs e ligações contra o
            exercício.
          </p>
          <button
            onClick={onClose}
            className="rounded-lg border border-[--color-border-primary]/50 px-3 py-1.5 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] cursor-pointer shrink-0"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
