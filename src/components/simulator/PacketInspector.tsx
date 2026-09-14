import { Trash2, Layers, ArrowRight } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { clsx } from 'clsx';

const TYPE_STYLES: Record<string, string> = {
  icmp: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  arp: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  tcp: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  udp: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
  dns: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  dhcp: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
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
        <Layers size={22} className="text-slate-700 mb-2" />
        <p className="text-xs text-slate-500">Nenhum pacote capturado ainda.</p>
        <p className="text-[11px] text-slate-600 mt-1">
          Abra o console de um equipamento e execute <span className="font-mono text-slate-400">ping</span> para ver o tráfego.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-64 shrink-0 border-r border-[--color-border-primary] flex flex-col">
        <div className="flex items-center justify-between px-3 py-2 border-b border-[--color-border-primary]">
          <span className="text-[10px] uppercase tracking-wide text-slate-500">
            Pacotes ({packets.length})
          </span>
          <button
            onClick={clearPackets}
            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
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
                    TYPE_STYLES[pkt.type] ?? 'text-slate-400 border-slate-600 bg-slate-800'
                  )}
                >
                  {pkt.type.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 mt-1">
                <span className="truncate">{pkt.source.ip}</span>
                <ArrowRight size={9} className="shrink-0 text-slate-600" />
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
                TYPE_STYLES[selected.type] ?? 'text-slate-400 border-slate-600 bg-slate-800'
              )}
            >
              {selected.type.toUpperCase()}
            </span>
            <span className="text-xs text-slate-300">
              {selected.source.ip} → {selected.destination.ip}
            </span>
          </div>

          <p className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">
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
                  <span className="text-xs font-semibold text-slate-200">{layer.name}</span>
                  <span className="text-[9px] text-slate-500">{layer.protocol}</span>
                </div>
                <dl className="space-y-0.5">
                  {Object.entries(layer.fields).map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-3 text-[10px]">
                      <dt className="text-slate-500">{key}</dt>
                      <dd className="font-mono text-slate-300 text-right truncate">{value}</dd>
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
