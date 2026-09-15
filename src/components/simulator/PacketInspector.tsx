import { Trash2, Layers, ArrowRight } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { clsx } from 'clsx';

const TYPE_STYLES: Record<string, string> = {
  icmp: 'text-[--color-accent-green] border-[--color-accent-green]/30 bg-[--color-accent-green]/10',
  arp: 'text-[--color-accent-yellow] border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/10',
  tcp: 'text-[--color-accent-blue] border-[--color-accent-blue]/30 bg-[--color-accent-blue]/10',
  udp: 'text-[--color-accent-cyan] border-[--color-accent-cyan]/30 bg-[--color-accent-cyan]/10',
  dns: 'text-[--color-accent-purple] border-[--color-accent-purple]/30 bg-[--color-accent-purple]/10',
  dhcp: 'text-[--color-accent-red] border-[--color-accent-red]/30 bg-[--color-accent-red]/10',
};

export function PacketInspector() {
  const packets = useSimulatorStore(s => s.packets);
  const selectedPacketId = useSimulatorStore(s => s.selectedPacketId);
  const selectPacket = useSimulatorStore(s => s.selectPacket);
  const clearPackets = useSimulatorStore(s => s.clearPackets);

  const selected = packets.find(p => p.id === selectedPacketId) ?? packets[0];

  if (packets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <Layers size={22} className="text-[--color-text-muted]/60 mb-2" />
        <p className="text-xs text-[--color-text-muted]">Nenhum pacote capturado ainda.</p>
        <p className="text-[11px] text-[--color-text-muted]/70 mt-1">
          Abra o console de um equipamento e execute <span className="font-mono text-[--color-text-secondary]">ping</span> para ver o tráfego.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-64 shrink-0 border-r border-[--color-border-primary] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[--color-border-primary]">
          <span className="text-[10px] uppercase tracking-wide text-[--color-text-muted]">
            Pacotes ({packets.length})
          </span>
          <button
            onClick={clearPackets}
            className="p-1 rounded text-[--color-text-muted] hover:text-[--color-accent-red] hover:bg-[--color-accent-red]/10 cursor-pointer"
            title="Limpar captura"
          >
            <Trash2 size={12} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {packets.map(pkt => (
            <button
              key={pkt.id}
              onClick={() => selectPacket(pkt.id)}
              className={clsx(
                'w-full text-left px-3 py-2 border-b border-[--color-border-primary]/60 cursor-pointer transition-colors',
                selected?.id === pkt.id ? 'bg-[--color-bg-hover]' : 'hover:bg-[--color-bg-tertiary]'
              )}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={clsx(
                    'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                    TYPE_STYLES[pkt.type] ?? 'text-[--color-text-muted] border-[--color-border-secondary] bg-[--color-bg-tertiary]'
                  )}
                >
                  {pkt.type.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-[--color-text-muted] mt-1">
                <span className="truncate">{pkt.source.ip}</span>
                <ArrowRight size={9} className="shrink-0 text-[--color-text-muted]/60" />
                <span className="truncate">{pkt.destination.ip}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="flex-1 min-w-0 overflow-y-auto p-3">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={clsx(
                'text-[10px] font-bold px-2 py-0.5 rounded border',
                TYPE_STYLES[selected.type] ?? 'text-[--color-text-muted] border-[--color-border-secondary] bg-[--color-bg-tertiary]'
              )}
            >
              {selected.type.toUpperCase()}
            </span>
            <span className="text-xs text-[--color-text-secondary]">
              {selected.source.ip} → {selected.destination.ip}
            </span>
          </div>

          <p className="text-[10px] uppercase tracking-wide text-[--color-text-muted] mb-2">
            Encapsulamento (modelo de camadas)
          </p>
          <div className="space-y-2">
            {selected.layers.map((layer, idx) => (
              <div
                key={layer.name}
                className="rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary] p-2.5"
                style={{ marginLeft: idx * 10 }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-[--color-text-primary]">{layer.name}</span>
                  <span className="text-[9px] text-[--color-text-muted]">{layer.protocol}</span>
                </div>
                <dl className="space-y-0.5">
                  {Object.entries(layer.fields).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3 text-[10px]">
                      <dt className="text-[--color-text-muted]">{key}</dt>
                      <dd className="font-mono text-[--color-text-secondary] text-right truncate">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
