import { Trash2, Power, Cable, Info, TerminalSquare, Plus, X, Route } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { DEVICE_LABELS } from '../../stores/useSimulatorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { DEVICE_ICONS, DEVICE_COLORS } from './deviceIcons';
import { isValidIp, isValidMask } from '../../utils/ip';
import type { NetworkInterface, Device, Route as NetworkRoute } from '../../types';
import { clsx } from 'clsx';
import { useState } from 'react';

function Field({
  label,
  value,
  placeholder,
  onChange,
  invalid,
  mono = true,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wide text-slate-500">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className={clsx(
          'mt-1 w-full bg-[--color-bg-input] border rounded-md px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1',
          mono && 'font-mono',
          invalid
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/20'
            : 'border-[--color-border-primary] focus:border-blue-500 focus:ring-blue-500/20'
        )}
      />
    </label>
  );
}

function InterfaceConfig({ device, iface }: { device: Device; iface: NetworkInterface }) {
  const updateInterface = useSimulatorStore(s => s.updateInterface);
  const toggleInterfaceStatus = useSimulatorStore(s => s.toggleInterfaceStatus);

  const ipInvalid = !!iface.ip && !isValidIp(iface.ip);
  const maskInvalid = !!iface.subnetMask && !isValidMask(iface.subnetMask);
  const gwInvalid = !!iface.gateway && !isValidIp(iface.gateway);
  const dnsInvalid = !!iface.dns && !isValidIp(iface.dns);

  return (
    <div className="rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary] p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Cable size={12} className="text-slate-500" />
          <span className="text-xs font-medium text-slate-300">{iface.name}</span>
        </div>
        <button
          onClick={() => toggleInterfaceStatus(device.id, iface.id)}
          className={clsx(
            'flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border cursor-pointer',
            iface.status === 'up'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-600 bg-slate-800 text-slate-500'
          )}
        >
          <Power size={10} />
          {iface.status === 'up' ? 'UP' : 'DOWN'}
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>MAC</span>
          <span className="font-mono text-slate-400">{iface.mac}</span>
        </div>
        <Field
          label="Endereço IP"
          value={iface.ip ?? ''}
          placeholder="192.168.1.10"
          onChange={v => updateInterface(device.id, iface.id, { ip: v || undefined })}
          invalid={ipInvalid}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field
            label="Máscara"
            value={iface.subnetMask ?? ''}
            placeholder="255.255.255.0"
            onChange={v => updateInterface(device.id, iface.id, { subnetMask: v || undefined })}
            invalid={maskInvalid}
          />
          <Field
            label="Gateway"
            value={iface.gateway ?? ''}
            placeholder="192.168.1.1"
            onChange={v => updateInterface(device.id, iface.id, { gateway: v || undefined })}
            invalid={gwInvalid}
          />
        </div>
        <Field
          label="DNS"
          value={iface.dns ?? ''}
          placeholder="8.8.8.8"
          onChange={v => updateInterface(device.id, iface.id, { dns: v || undefined })}
          invalid={dnsInvalid}
        />
      </div>
    </div>
  );
}

function SwitchPorts({ device }: { device: Device }) {
  const topology = useSimulatorStore(s => s.topology);
  const toggleInterfaceStatus = useSimulatorStore(s => s.toggleInterfaceStatus);

  return (
    <div className="rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary] p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">
        Portas ({device.interfaces.length})
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {device.interfaces.map(iface => {
          const conn = topology.connections.find(
            c =>
              (c.deviceId1 === device.id && c.interfaceId1 === iface.id) ||
              (c.deviceId2 === device.id && c.interfaceId2 === iface.id)
          );
          const peerId = conn
            ? conn.deviceId1 === device.id
              ? conn.deviceId2
              : conn.deviceId1
            : null;
          const peer = peerId ? topology.devices.find(d => d.id === peerId) : null;
          const linked = !!conn && iface.status === 'up';
          return (
            <button
              key={iface.id}
              onClick={() => toggleInterfaceStatus(device.id, iface.id)}
              className={clsx(
                'flex items-center gap-1.5 px-2 py-1.5 rounded border text-left cursor-pointer transition-colors',
                linked
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                  : iface.status === 'down'
                  ? 'border-slate-700 bg-slate-800/50 opacity-60'
                  : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800'
              )}
            >
              <span
                className={clsx(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  linked ? 'bg-emerald-500' : iface.status === 'down' ? 'bg-red-500' : 'bg-slate-600'
                )}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-slate-400 truncate">
                  {iface.name.replace('FastEthernet', 'Fa')}
                </p>
                {peer && <p className="text-[9px] text-slate-500 truncate">{peer.name}</p>}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-slate-600 mt-2">Clique numa porta para ativá-la/desativá-la.</p>
    </div>
  );
}

function ArpTable({ deviceId }: { deviceId: string }) {
  const arpTable = useSimulatorStore(s => s.arpTables[deviceId] ?? []);

  return (
    <div className="rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary] p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500 mb-2">Tabela ARP</div>
      {arpTable.length === 0 ? (
        <p className="text-[10px] text-slate-600">
          Vazia. Faça um <span className="font-mono">ping</span> para popular.
        </p>
      ) : (
        <div className="space-y-1">
          {arpTable.map(entry => (
            <div key={entry.ip} className="flex items-center justify-between gap-2 text-[10px] font-mono">
              <span className="text-slate-300">{entry.ip}</span>
              <span className="text-slate-500 truncate">{entry.mac}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RouteEditor({ device }: { device: Device }) {
  const updateRoutes = useSimulatorStore(s => s.updateRoutes);
  const [destination, setDestination] = useState('');
  const [mask, setMask] = useState('');
  const [gateway, setGateway] = useState('');

  const routes = device.config.routes;

  const addRoute = () => {
    if (!isValidIp(destination) || !isValidIp(gateway) || !isValidMask(mask || '255.255.255.0')) return;
    const newRoute: NetworkRoute = {
      destination,
      gateway,
      mask: mask || '255.255.255.0',
      metric: 1,
      interfaceName: '',
    };
    const exists = routes.some(
      r => r.destination === newRoute.destination && r.mask === newRoute.mask && r.gateway === newRoute.gateway
    );
    if (exists) return;
    updateRoutes(device.id, [...routes, newRoute]);
    setDestination('');
    setMask('');
    setGateway('');
  };

  const removeRoute = (index: number) => {
    updateRoutes(device.id, routes.filter((_, i) => i !== index));
  };

  return (
    <div className="rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-slate-500 mb-2">
        <Route size={11} /> Rotas estáticas
      </div>

      {routes.length > 0 && (
        <div className="space-y-1 mb-2">
          {routes.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded bg-[--color-bg-input] border border-[--color-border-primary] px-2 py-1">
              <div className="min-w-0 font-mono text-[10px] text-slate-300 leading-tight">
                <p className="truncate">
                  {r.destination}/{r.mask.replace('0.0.0.', '')}
                </p>
                <p className="text-slate-500 truncate">via {r.gateway}</p>
              </div>
              <button
                onClick={() => removeRoute(i)}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0"
                title="Remover rota"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        <input
          value={destination}
          onChange={e => setDestination(e.target.value)}
          placeholder="Destino"
          className="bg-[--color-bg-input] border border-[--color-border-primary] rounded px-2 py-1 text-[10px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
        />
        <input
          value={mask}
          onChange={e => setMask(e.target.value)}
          placeholder="Máscara"
          className="bg-[--color-bg-input] border border-[--color-border-primary] rounded px-2 py-1 text-[10px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
        />
        <input
          value={gateway}
          onChange={e => setGateway(e.target.value)}
          placeholder="Gateway (próximo salto)"
          className="bg-[--color-bg-input] border border-[--color-border-primary] rounded px-2 py-1 text-[10px] font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 col-span-2"
        />
      </div>
      <button
        onClick={addRoute}
        className="mt-1.5 w-full flex items-center justify-center gap-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium px-2 py-1.5 cursor-pointer"
      >
        <Plus size={11} /> Adicionar rota
      </button>
      <p className="text-[9px] text-slate-600 mt-1.5">
        Ex.: destino 192.168.5.0, máscara 255.255.255.0, gateway 172.16.0.2
      </p>
    </div>
  );
}

export function PropertyPanel() {
  const topology = useSimulatorStore(s => s.topology);
  const selectedDeviceId = useSimulatorStore(s => s.selectedDeviceId);
  const selectedConnectionId = useSimulatorStore(s => s.selectedConnectionId);
  const renameDevice = useSimulatorStore(s => s.renameDevice);
  const removeDevice = useSimulatorStore(s => s.removeDevice);
  const removeConnection = useSimulatorStore(s => s.removeConnection);
  const openTerminal = useTerminalStore(s => s.openTerminal);

  const device = topology.devices.find(d => d.id === selectedDeviceId);
  const connection = topology.connections.find(c => c.id === selectedConnectionId);

  if (connection) {
    const dev1 = topology.devices.find(d => d.id === connection.deviceId1);
    const dev2 = topology.devices.find(d => d.id === connection.deviceId2);
    return (
      <div className="w-72 shrink-0 border-l border-[--color-border-primary] bg-[--color-bg-secondary] p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Conexão</h3>
        <div className="rounded-md border border-[--color-border-primary] bg-[--color-bg-tertiary] p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300">{dev1?.name}</span>
            <span className="text-slate-600">↔</span>
            <span className="text-slate-300">{dev2?.name}</span>
          </div>
          <div className="text-[10px] text-slate-500 space-y-0.5">
            <p>{dev1?.name}: {connection.interfaceId1}</p>
            <p>{dev2?.name}: {connection.interfaceId2}</p>
            <p>Tipo: {connection.type}</p>
            <p>Largura: {connection.bandwidth} Mbps · Latência: {connection.latency} ms</p>
          </div>
        </div>
        <button
          onClick={() => removeConnection(connection.id)}
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 text-xs font-medium px-3 py-2 cursor-pointer"
        >
          <Trash2 size={13} /> Remover conexão
        </button>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="w-72 shrink-0 border-l border-[--color-border-primary] bg-[--color-bg-secondary] p-4 overflow-y-auto">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Propriedades</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Info size={24} className="text-slate-700 mb-2" />
          <p className="text-xs text-slate-500">Selecione um equipamento na topologia para configurá-lo.</p>
        </div>
      </div>
    );
  }

  const Icon = DEVICE_ICONS[device.type];
  const colors = DEVICE_COLORS[device.type];

  return (
    <div className="w-72 shrink-0 border-l border-[--color-border-primary] bg-[--color-bg-secondary] p-4 overflow-y-auto">
      <div className="flex items-center gap-2.5 mb-4">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-md"
          style={{ background: colors.fill, border: `1px solid ${colors.stroke}40` }}
        >
          <Icon size={18} color={colors.text} />
        </span>
        <div className="min-w-0 flex-1">
          <input
            value={device.name}
            onChange={e => renameDevice(device.id, e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-100 focus:outline-none border-b border-transparent focus:border-blue-500"
          />
          <p className="text-[10px] text-slate-500">{DEVICE_LABELS[device.type]}</p>
        </div>
      </div>

      {device.type === 'switch' ? (
        <SwitchPorts device={device} />
      ) : (
        <div className="space-y-3">
          {device.interfaces.map(iface => (
            <InterfaceConfig key={iface.id} device={device} iface={iface} />
          ))}
        </div>
      )}

      {(device.type === 'router' || device.type === 'firewall') && (
        <div className="mt-3">
          <RouteEditor device={device} />
        </div>
      )}

      <button
        onClick={() => openTerminal(device.id)}
        className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-md bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20 text-xs font-medium px-3 py-2 cursor-pointer"
      >
        <TerminalSquare size={13} /> Abrir console
      </button>

      {device.type !== 'switch' && (
        <div className="mt-3">
          <ArpTable deviceId={device.id} />
        </div>
      )}

      <button
        onClick={() => removeDevice(device.id)}
        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-md bg-red-600/10 border border-red-500/30 text-red-400 hover:bg-red-600/20 text-xs font-medium px-3 py-2 cursor-pointer"
      >
        <Trash2 size={13} /> Remover equipamento
      </button>
    </div>
  );
}