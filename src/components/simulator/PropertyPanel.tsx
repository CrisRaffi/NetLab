import {
  Trash2,
  Power,
  Cable,
  Wifi,
  Info,
  TerminalSquare,
  Plus,
  X,
  Route,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  Network,
  Cpu,
  Link2,
  BookOpen,
  ChevronDown,
  Copy,
  CopyPlus,
  Wand2,
} from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { DEVICE_LABELS } from '../../stores/useSimulatorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { DEVICE_ICONS, DEVICE_COLORS } from './deviceIcons';
import { DEVICE_GUIDES } from '../../data/deviceGuides';
import { protocolTip } from '../../data/protocolTips';
import { isValidIp, isValidMask, getNetworkAddress, getBroadcastAddress, ipToNumber, numberToIp } from '../../utils/ip';
import type {
  NetworkInterface,
  Device,
  Route as NetworkRoute,
  DeviceType,
} from '../../types';
import type { ArpEntry } from '../../engine/protocols/arp';
import { clsx } from 'clsx';
import { useRef, useState } from 'react';
import { IpCalculator } from './IpCalculator';

type PanelTab = 'config' | 'interfaces' | 'ports' | 'rotas';

/*
 * Constante fora do componente para que o selector nunca crie
 * um novo [] a cada render (evita loop infinito no useSyncExternalStore).
 */
const EMPTY_ARP: ArpEntry[] = [];

function getTabs(type: DeviceType): PanelTab[] {
  switch (type) {
    case 'switch':
    case 'hub':
      return ['config', 'ports'];
    case 'router':
    case 'firewall':
      return ['config', 'interfaces', 'rotas'];
    default:
      return ['config', 'interfaces'];
  }
}

function acronymTip(text: string): string | undefined {
  return protocolTip(text);
}

function IpInput({
  label,
  value,
  placeholder,
  onCommit,
  validate,
  resetKey,
}: {
  label: string;
  value: string;
  placeholder: string;
  onCommit: (v: string) => void;
  validate: (v: string) => string | undefined;
  resetKey: string;
}) {
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState<string | undefined>(undefined);
  const [prevKey, setPrevKey] = useState(resetKey);
  const prevValue = useRef(value);
  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    setDraft(value);
    setError(undefined);
  } else if (value !== prevValue.current) {
    prevValue.current = value;
    setDraft(value);
  }

  const onBlur = () => {
    const v = draft.trim();
    if (!v) {
      onCommit('');
      setError(undefined);
      setDraft('');
      return;
    }
    const msg = validate(v);
    if (msg) {
      setError(msg);
      setDraft(value);
      return;
    }
    setError(undefined);
    onCommit(v);
  };

  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider text-[--color-text-muted]" title={acronymTip(label)}>
        {label}
      </span>
      <input
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value);
          setError(undefined);
        }}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        spellCheck={false}
        className={clsx(
          'mt-1 w-full bg-[#0D1424] border rounded-lg px-2.5 py-1.5 text-xs font-mono text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:ring-1 transition-colors',
          error
            ? 'border-[--color-accent-red]/70 focus:border-[--color-accent-red] focus:ring-[--color-accent-red]/20'
            : 'border-[--color-border-primary]/70 focus:border-[--color-accent-blue] focus:ring-[--color-accent-blue]/20',
        )}
      />
      {error && (
        <span className="mt-1 block text-[10px] text-[--color-accent-red]">
          {error}
        </span>
      )}
    </label>
  );
}

function Section({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[--color-border-primary]/50 bg-[#111A2C]/40 p-3">
      <div className="flex items-center justify-between mb-2" title={acronymTip(title)}>
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-[--color-text-muted] font-semibold">
          {icon}
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function interfaceStatus(device: Device): { label: string; color: string } {
  const primary = device.interfaces.find((i) => i.ip);
  const up = device.interfaces.some((i) => i.status === 'up');
  if (!up)
    return {
      label: 'Inativo',
      color:
        'text-[--color-text-muted] border-[--color-text-muted]/30 bg-[--color-text-muted]/10',
    };
  if (!primary)
    return {
      label: 'Atenção',
      color:
        'text-[--color-accent-yellow] border-[--color-accent-yellow]/30 bg-[--color-accent-yellow]/10',
    };
  return {
    label: 'Online',
    color:
      'text-[--color-status-connected] border-[--color-status-connected]/30 bg-[--color-status-connected]/10',
  };
}

function InterfaceConfig({
  device,
  iface,
}: {
  device: Device;
  iface: NetworkInterface;
}) {
  const topology = useSimulatorStore((s) => s.topology);
  const updateInterface = useSimulatorStore((s) => s.updateInterface);
  const toggleInterfaceStatus = useSimulatorStore(
    (s) => s.toggleInterfaceStatus,
  );

  const ipInUse = (v: string) =>
    topology.devices.some(
      (d) =>
        d.id !== device.id &&
        d.interfaces.some((i) => i.ip === v && i.status === 'up'),
    );

  const autoConfigure = () => {
    const findRef = () => {
      const visited = new Set<string>();
      const queue: { deviceId: string; ifaceId: string }[] = [
        { deviceId: device.id, ifaceId: iface.id },
      ];
      while (queue.length > 0) {
        const cur = queue.shift()!;
        const key = `${cur.deviceId}:${cur.ifaceId}`;
        if (visited.has(key)) continue;
        visited.add(key);
        const curIface = topology.devices
          .find((d) => d.id === cur.deviceId)
          ?.interfaces.find((i) => i.id === cur.ifaceId);
        if (
          curIface?.status === 'up' &&
          curIface.ip &&
          isValidIp(curIface.ip) &&
          curIface.subnetMask &&
          isValidMask(curIface.subnetMask)
        ) {
          return cur;
        }
        topology.connections.forEach((c) => {
          if (c.deviceId1 === cur.deviceId && c.interfaceId1 === cur.ifaceId)
            queue.push({ deviceId: c.deviceId2, ifaceId: c.interfaceId2 });
          else if (c.deviceId2 === cur.deviceId && c.interfaceId2 === cur.ifaceId)
            queue.push({ deviceId: c.deviceId1, ifaceId: c.interfaceId1 });
        });
      }
      return null;
    };

    const ref = findRef();
    if (!ref) {
      const used = new Set<string>();
      topology.devices.forEach((d) =>
        d.interfaces.forEach((i) => {
          if (i.ip) used.add(i.ip);
        }),
      );
      for (let n = 2; n < 255; n++) {
        const candidate = `192.168.1.${n}`;
        if (!used.has(candidate)) {
          updateInterface(device.id, iface.id, {
            ip: candidate,
            subnetMask: '255.255.255.0',
          });
          return;
        }
      }
      return;
    }

    const peer = topology.devices.find((d) => d.id === ref.deviceId);
    const peerIface = peer?.interfaces.find((i) => i.id === ref.ifaceId);
    if (!peer || !peerIface?.ip || !peerIface.subnetMask) return;

    const refIp = peerIface.ip;
    const refMask = peerIface.subnetMask;
    const network = getNetworkAddress(refIp, refMask);
    const broadcast = getBroadcastAddress(refIp, refMask);
    const start = ipToNumber(network) + 1;
    const end = ipToNumber(broadcast) - 1;

    const used = new Set<string>();
    topology.devices.forEach((d) =>
      d.interfaces.forEach((i) => {
        if (i.ip && i.status === 'up') used.add(i.ip);
      }),
    );

    let freeIp: string | null = null;
    for (let n = start; n <= end; n++) {
      const candidate = numberToIp(n);
      if (!used.has(candidate)) {
        freeIp = candidate;
        break;
      }
    }
    if (!freeIp) return;

    const isL3 = peer?.type === 'router' || peer?.type === 'firewall' || peer?.type === 'core' || peer?.type === 'access_point';
    updateInterface(device.id, iface.id, {
      ip: freeIp,
      subnetMask: refMask,
      gateway: isL3 ? refIp : undefined,
      dns: isL3 ? '8.8.8.8' : undefined,
    });
  };

  return (
    <div
      className="rounded-xl border border-[--color-border-primary]/40 bg-[#111A2C]/40 p-4"
      style={{ padding: 20 }}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2 min-w-0">
          {iface.type === 'wireless' ? (
            <Wifi size={13} className="text-[--color-accent-cyan] shrink-0" />
          ) : (
            <Cable size={13} className="text-[--color-text-muted] shrink-0" />
          )}
          <span className="text-[11px] font-semibold text-[--color-text-primary] truncate">
            {iface.name}
          </span>
          <span className="text-[9px] font-mono text-[--color-text-muted] truncate">
            {iface.mac}
          </span>
        </div>
        <div className="flex shrink-0">
          <button
            onClick={() => toggleInterfaceStatus(device.id, iface.id)}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border cursor-pointer transition-colors shrink-0',
              iface.status === 'up'
                ? 'border-[--color-status-connected]/30 bg-[--color-status-connected]/10 text-[--color-status-connected]'
                : 'border-[--color-border-secondary] bg-[#1C2538] text-[--color-text-muted]',
            )}
          >
            <Power size={11} />
            {iface.status === 'up' ? 'UP' : 'DOWN'}
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        <IpInput
          label="Endereço IP"
          value={iface.ip ?? ''}
          placeholder="192.168.1.10"
          resetKey={`${device.id}-${iface.id}-ip`}
          onCommit={(v) =>
            updateInterface(device.id, iface.id, { ip: v || undefined })
          }
          validate={(v) => {
            if (v && !isValidIp(v)) return 'IP fora do range (0–255)';
            if (v && ipInUse(v)) return 'IP já em uso por outro dispositivo';
          }}
        />
        <div className="grid grid-cols-2 gap-2">
          <IpInput
            label="Máscara"
            value={iface.subnetMask ?? ''}
            placeholder="255.255.255.0"
            resetKey={`${device.id}-${iface.id}-mask`}
            onCommit={(v) =>
              updateInterface(device.id, iface.id, {
                subnetMask: v || undefined,
              })
            }
            validate={(v) => {
              if (v && !isValidMask(v)) return 'Máscara inválida';
            }}
          />
          <IpInput
            label="Gateway"
            value={iface.gateway ?? ''}
            placeholder="192.168.1.1"
            resetKey={`${device.id}-${iface.id}-gw`}
            onCommit={(v) =>
              updateInterface(device.id, iface.id, { gateway: v || undefined })
            }
            validate={(v) => {
              if (v && !isValidIp(v)) return 'IP fora do range (0–255)';
            }}
          />
        </div>
        <IpInput
          label="DNS"
          value={iface.dns ?? ''}
          placeholder="8.8.8.8"
          resetKey={`${device.id}-${iface.id}-dns`}
          onCommit={(v) =>
            updateInterface(device.id, iface.id, { dns: v || undefined })
          }
          validate={(v) => {
            if (v && !isValidIp(v)) return 'IP fora do range (0–255)';
          }}
        />
        <button
          onClick={autoConfigure}
          title="Auto configurar IP/Máscara/Gateway conforme a rede conectada"
          className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-[--color-accent-purple]/30 bg-[--color-accent-purple]/10 text-[--color-accent-purple] hover:bg-[--color-accent-purple]/20 text-[10px] font-bold px-2.5 py-1.5 cursor-pointer transition-colors"
        >
          <Wand2 size={11} /> Auto configurar interface
        </button>
        <IpCalculator iface={iface} />
      </div>
    </div>
  );
}

function SwitchPorts({ device }: { device: Device }) {
  const topology = useSimulatorStore((s) => s.topology);
  const toggleInterfaceStatus = useSimulatorStore(
    (s) => s.toggleInterfaceStatus,
  );

  return (
    <div className="rounded-xl border border-[--color-border-primary]/50 bg-[#111A2C]/40 p-3">
      <div className="grid grid-cols-2 gap-1.5">
        {device.interfaces.map((iface) => {
          const conn = topology.connections.find(
            (c) =>
              (c.deviceId1 === device.id && c.interfaceId1 === iface.id) ||
              (c.deviceId2 === device.id && c.interfaceId2 === iface.id),
          );
          const peerId = conn
            ? conn.deviceId1 === device.id
              ? conn.deviceId2
              : conn.deviceId1
            : null;
          const peer = peerId
            ? topology.devices.find((d) => d.id === peerId)
            : null;
          const linked = !!conn && iface.status === 'up';
          return (
            <button
              key={iface.id}
              onClick={() => toggleInterfaceStatus(device.id, iface.id)}
              className={clsx(
                'flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-left cursor-pointer transition-all duration-150',
                linked
                  ? 'border-[--color-status-connected]/30 bg-[--color-status-connected]/5 hover:bg-[--color-status-connected]/10'
                  : iface.status === 'down'
                    ? 'border-[--color-border-primary]/60 bg-[#0D1424]/60 opacity-55 hover:opacity-80'
                    : 'border-[--color-border-primary]/60 bg-[#0D1424]/60 hover:bg-[--color-bg-hover]/50',
              )}
            >
              <span
                className={clsx(
                  'w-1.5 h-1.5 rounded-full shrink-0',
                  linked
                    ? 'bg-[--color-status-connected]'
                    : iface.status === 'down'
                      ? 'bg-[--color-accent-red]'
                      : 'bg-[--color-text-muted]/50',
                )}
              />
              <div className="min-w-0">
                <p className="text-[10px] font-mono text-[--color-text-secondary] truncate">
                  {iface.name.replace('FastEthernet', 'Fa')}
                </p>
                {peer && (
                  <p className="text-[9px] text-[--color-text-muted] truncate">
                    {peer.name}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[9px] text-[--color-text-muted]/70 mt-2">
        Clique numa porta para ativá-la/desativá-la.
      </p>
    </div>
  );
}

function ArpTable({ deviceId }: { deviceId: string }) {
  const arpTable = useSimulatorStore((s) => s.arpTables[deviceId] ?? EMPTY_ARP);

  return (
    <Section title="Tabela ARP">
      {arpTable.length === 0 ? (
        <p className="text-[10px] text-[--color-text-muted]">
          Vazia. Faça um{' '}
          <span className="font-mono text-[--color-text-secondary]">ping</span>{' '}
          para popular.
        </p>
      ) : (
        <div className="space-y-0.5">
          {arpTable.map((entry) => (
            <div
              key={entry.ip}
              className="flex items-center justify-between gap-2 text-[10px] font-mono px-1.5 py-1 rounded bg-[#0D1424]/60 border border-[--color-border-primary]/40"
            >
              <span className="text-[--color-text-primary]">{entry.ip}</span>
              <span className="text-[--color-text-muted] truncate">
                {entry.mac}
              </span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function RouteEditor({ device }: { device: Device }) {
  const updateRoutes = useSimulatorStore((s) => s.updateRoutes);
  const [destination, setDestination] = useState('');
  const [mask, setMask] = useState('');
  const [gateway, setGateway] = useState('');

  const routes = device.config.routes;

  const addRoute = () => {
    if (
      !isValidIp(destination) ||
      !isValidIp(gateway) ||
      !isValidMask(mask || '255.255.255.0')
    )
      return;
    const newRoute: NetworkRoute = {
      destination,
      gateway,
      mask: mask || '255.255.255.0',
      metric: 1,
      interfaceName: '',
    };
    const exists = routes.some(
      (r) =>
        r.destination === newRoute.destination &&
        r.mask === newRoute.mask &&
        r.gateway === newRoute.gateway,
    );
    if (exists) return;
    updateRoutes(device.id, [...routes, newRoute]);
    setDestination('');
    setMask('');
    setGateway('');
  };

  const removeRoute = (index: number) => {
    updateRoutes(
      device.id,
      routes.filter((_, i) => i !== index),
    );
  };

  return (
    <Section title="Rotas estáticas" icon={<Route size={10} />}>
      {routes.length > 0 && (
        <div className="space-y-1 mb-2">
          {routes.map((r, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-2 rounded-lg bg-[#0D1424]/70 border border-[--color-border-primary]/50 px-2 py-1.5"
            >
              <div className="min-w-0 font-mono text-[10px] text-[--color-text-secondary] leading-tight">
                <p className="truncate">
                  {r.destination}/{r.mask.replace('0.0.0.', '')}
                </p>
                <p className="text-[--color-text-muted] truncate">
                  via {r.gateway}
                </p>
              </div>
              <button
                onClick={() => removeRoute(i)}
                className="p-1 rounded text-[--color-text-muted] hover:text-[--color-accent-red] hover:bg-[--color-accent-red]/10 cursor-pointer shrink-0"
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
          onChange={(e) => setDestination(e.target.value)}
          placeholder="Destino"
          className="w-full min-w-0 bg-[#0D1424] border border-[--color-border-primary]/70 rounded-lg px-2 py-1.5 text-[10px] font-mono text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:border-[--color-accent-blue]"
        />
        <input
          value={mask}
          onChange={(e) => setMask(e.target.value)}
          placeholder="Máscara"
          className="w-full min-w-0 bg-[#0D1424] border border-[--color-border-primary]/70 rounded-lg px-2 py-1.5 text-[10px] font-mono text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:border-[--color-accent-blue]"
        />
        <input
          value={gateway}
          onChange={(e) => setGateway(e.target.value)}
          placeholder="Gateway (próximo salto)"
          className="w-full min-w-0 bg-[#0D1424] border border-[--color-border-primary]/70 rounded-lg px-2 py-1.5 text-[10px] font-mono text-[--color-text-primary] placeholder:text-[--color-text-muted]/60 focus:outline-none focus:border-[--color-accent-blue] col-span-2"
        />
      </div>
      <button
        onClick={addRoute}
        className="mt-1.5 w-full flex items-center justify-center gap-1 rounded-lg bg-[#1C2538] hover:bg-[#273651] text-[--color-text-secondary] hover:text-[--color-text-primary] text-[10px] font-medium px-2 py-1.5 cursor-pointer transition-colors"
      >
        <Plus size={11} /> Adicionar rota
      </button>
      <p className="text-[9px] text-[--color-text-muted]/70 mt-1.5">
        Ex.: destino 192.168.5.0, máscara 255.255.255.0, gateway 172.16.0.2
      </p>
    </Section>
  );
}

interface PropertyPanelProps {
  open: boolean;
  onToggle: () => void;
}

export function PropertyPanel({ open, onToggle }: PropertyPanelProps) {
  const topology = useSimulatorStore((s) => s.topology);
  const selectedDeviceId = useSimulatorStore((s) => s.selectedDeviceIds[0] ?? null);
  const selectedConnectionId = useSimulatorStore((s) => s.selectedConnectionId);
  const renameDevice = useSimulatorStore((s) => s.renameDevice);
  const removeDevice = useSimulatorStore((s) => s.removeDevice);
  const removeConnection = useSimulatorStore((s) => s.removeConnection);
  const copyDevice = useSimulatorStore((s) => s.copyDevice);
  const pasteDevice = useSimulatorStore((s) => s.pasteDevice);
  const openTerminal = useTerminalStore((s) => s.openTerminal);

  const device = topology.devices.find((d) => d.id === selectedDeviceId);
  const connection = topology.connections.find(
    (c) => c.id === selectedConnectionId,
  );

  const [tab, setTab] = useState<PanelTab>('config');
  const [manualOpen, setManualOpen] = useState(false);

  if (!open) {
    const peerLabel = connection
      ? `${topology.devices.find((d) => d.id === connection.deviceId1)?.name} â†” ${topology.devices.find((d) => d.id === connection.deviceId2)?.name}`
      : device?.name;
    return (
      <div className="w-9 shrink-0 border-l border-[--color-border-primary]/50 bg-[#0D1424] flex flex-col items-center pt-2 gap-2 overflow-hidden">
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer"
          title="Abrir painel de propriedades"
        >
          <PanelLeftOpen size={14} />
        </button>
        {peerLabel && (
          <span
            className="text-[9px] text-[--color-text-muted]/70 font-mono whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {peerLabel}
          </span>
        )}
      </div>
    );
  }

  if (connection) {
    const dev1 = topology.devices.find((d) => d.id === connection.deviceId1);
    const dev2 = topology.devices.find((d) => d.id === connection.deviceId2);
    return (
      <div className="w-80 shrink-0 border-l border-[--color-border-primary]/40 bg-[#0D1424] p-4 overflow-y-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[--color-accent-blue]/10 border border-[--color-accent-blue]/30">
              <Link2 size={13} className="text-[--color-accent-blue]" />
            </span>
            <h3 className="text-xs font-semibold text-[--color-text-primary]">
              Conexão
            </h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer"
            title="Recolher painel"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>

        <div className="rounded-xl border border-[--color-border-primary]/50 bg-[#111A2C]/60 p-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[--color-status-connected] shrink-0" />
              <span className="truncate text-[--color-text-primary]">
                {dev1?.name}
              </span>
            </span>
            <span className="text-[--color-text-muted] shrink-0">â†”</span>
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="h-1.5 w-1.5 rounded-full bg-[--color-status-connected] shrink-0" />
              <span className="truncate text-[--color-text-primary]">
                {dev2?.name}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[--color-text-muted]">
            <span className="flex items-center gap-1.5">
              {connection.type === 'wireless' ? (
                <Wifi size={10} className="text-[--color-accent-cyan]" />
              ) : null}
              {connection.type === 'wireless' ? 'WiFi' : 'Ethernet'}
            </span>
            <span className="font-mono">
              {connection.bandwidth} Mbps · {connection.latency} ms
            </span>
          </div>
        </div>

        <p className="text-[10px] text-[--color-text-muted] px-1">
          {dev1?.name}:{' '}
          <span className="font-mono text-[--color-text-secondary]">
            {connection.interfaceId1}
          </span>
        </p>
        <p className="text-[10px] text-[--color-text-muted] px-1">
          {dev2?.name}:{' '}
          <span className="font-mono text-[--color-text-secondary]">
            {connection.interfaceId2}
          </span>
        </p>

        <button
          onClick={() => removeConnection(connection.id)}
          className="mt-auto w-full flex items-center justify-center gap-1.5 rounded-lg bg-[--color-accent-red]/10 border border-[--color-accent-red]/30 text-[--color-accent-red] hover:bg-[--color-accent-red]/20 text-xs font-medium px-3 py-2 cursor-pointer transition-all duration-150 hover:-translate-y-px"
        >
          <Trash2 size={13} /> Remover conexão
        </button>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="w-80 shrink-0 border-l border-[--color-border-primary]/40 bg-[#0D1424] p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wider">
            Propriedades
          </h3>
          <button
            onClick={onToggle}
            className="p-1 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer"
            title="Recolher painel"
          >
            <PanelLeftClose size={13} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-14 text-center px-2">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-[--color-accent-blue]/10 blur-xl" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1C2538] to-[#111A2C] border border-[--color-border-primary]/70 shadow-inner">
              <Info size={22} className="text-[--color-text-muted]" />
            </span>
          </div>
          <p className="mt-4 text-xs text-[--color-text-secondary]">
            Nenhum equipamento selecionado
          </p>
          <p className="text-[10px] text-[--color-text-muted] mt-1.5 leading-relaxed">
            Selecione um equipamento na topologia
            <br />
            para ver e editar suas configurações.
          </p>
        </div>
      </div>
    );
  }

  const Icon = DEVICE_ICONS[device.type];
  const colors = DEVICE_COLORS[device.type];
  const status = interfaceStatus(device);
  const primary = device.interfaces.find((i) => i.ip);
  const tabs = getTabs(device.type);
  const activeTab = tabs.includes(tab) ? tab : tabs[0];
  const guide = DEVICE_GUIDES[device.type];

  return (
    <div className="w-80 shrink-0 border-l border-[--color-border-primary]/40 bg-[#0D1424] flex flex-col min-h-0">
      {/* Device header */}
      <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 shrink-0">
        <div className="relative shrink-0">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: colors.fill,
              border: `1px solid ${colors.stroke}45`,
              boxShadow: `0 0 14px ${colors.stroke}22`,
            }}
          >
            <Icon size={19} color={colors.text} />
          </span>
          <span
            className={clsx(
              'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0D1424]',
              status.color.includes('connected') &&
                'bg-[--color-status-connected]',
              status.color.includes('yellow') && 'bg-[--color-accent-yellow]',
              (status.color.includes('muted') ||
                status.color.includes('Inativo')) &&
                'bg-[--color-text-muted]',
            )}
          />
        </div>
        <div className="min-w-0 flex-1">
          <input
            value={device.name}
            onChange={(e) => renameDevice(device.id, e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-[--color-text-primary] focus:outline-none border-b border-transparent focus:border-[--color-accent-blue]"
          />
          <p className="text-[10px] text-[--color-text-muted]">
            {DEVICE_LABELS[device.type]}
          </p>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover]/60 cursor-pointer shrink-0"
          title="Recolher painel"
        >
          <PanelLeftClose size={13} />
        </button>
      </div>

      {/* Status chip row */}
      <div className="px-4 pb-3 flex items-center gap-2 shrink-0">
        <span
          className={clsx(
            'px-2 py-0.5 rounded-md border text-[9px] font-bold',
            status.color,
          )}
        >
          {status.label}
        </span>
        {primary?.ip && (
          <span className="text-[9px] font-mono text-[--color-text-muted] truncate">
            {primary.ip}
          </span>
        )}
      </div>

      {/* Manual */}
      <div className="px-4 pb-2 shrink-0">
        <button
          onClick={() => setManualOpen((v) => !v)}
          className="w-full flex items-center justify-between rounded-lg border border-[--color-accent-cyan]/25 bg-[--color-accent-cyan]/5 px-2.5 py-2 hover:border-[--color-accent-cyan]/50 hover:bg-[--color-accent-cyan]/10 cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[--color-accent-cyan]">
            <BookOpen size={12} /> Manual do equipamento
          </span>
          <ChevronDown
            size={12}
            className={clsx(
              'text-[--color-text-muted] transition-transform',
              manualOpen && 'rotate-180',
            )}
          />
        </button>
        {manualOpen && (
          <div className="mt-2 space-y-2 rounded-lg border border-[--color-border-primary]/50 bg-[#111A2C]/40 p-2.5 animate-fade-in">
            <p className="text-[10px] font-semibold text-[--color-text-secondary] leading-relaxed">
              {guide.role}
            </p>
            <p className="text-[10px] text-[--color-text-muted] leading-relaxed">
              {guide.how}
            </p>
            <div className="pt-1 border-t border-[--color-border-primary]/40">
              <p className="text-[9px] uppercase tracking-wider text-[--color-text-muted] mb-1.5">
                Como configurar
              </p>
              <ol className="space-y-1">
                {guide.config.map((s, i) => (
                  <li
                    key={i}
                    className="flex gap-1.5 text-[10px] text-[--color-text-muted] leading-snug"
                  >
                    <span className="text-[--color-accent-green] font-mono shrink-0">
                      {i + 1}.
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2 shrink-0">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-150',
              activeTab === t
                ? 'bg-[--color-accent-blue]/15 text-[--color-accent-blue] ring-inset-blue-soft'
                : 'text-[--color-text-muted] hover:text-[--color-text-secondary] hover:bg-[--color-bg-hover]/40',
            )}
          >
            {t === 'config' && <Settings2 size={11} />}
            {t === 'interfaces' && <Network size={11} />}
            {t === 'ports' && <Cpu size={11} />}
            {t === 'rotas' && <Route size={11} />}
            {t === 'config' ? 'Config' : t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 space-y-4">
        {activeTab === 'config' && (
          <>
            <Section title="Informações" icon={<Info size={10} />}>
              <div className="space-y-1">
                {[
                  ['Hostname', device.config.hostname],
                  ['Tipo', DEVICE_LABELS[device.type]],
                  ['Interfaces', String(device.interfaces.length)],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between gap-2 text-[10px]"
                  >
                    <span className="text-[--color-text-muted]">{k}</span>
                    <span className="font-mono text-[--color-text-secondary]">
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Rede" icon={<Network size={10} />}>
              {primary ? (
                <div className="space-y-1">
                  {[
                    ['IP', primary.ip ?? '—'],
                    ['Máscara', primary.subnetMask ?? '—'],
                    ['Gateway', primary.gateway ?? '—'],
                    ['DNS', primary.dns ?? '—'],
                    ['MAC', primary.mac],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between gap-2 text-[10px]"
                    >
                      <span className="text-[--color-text-muted]">{k}</span>
                      <span className="font-mono text-[--color-text-secondary] truncate">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-[--color-text-muted]">
                  Aba{' '}
                  <span className="text-[--color-accent-blue] font-medium">
                    Interfaces
                  </span>{' '}
                  para configurar IP.
                </p>
              )}
            </Section>
          </>
        )}

        {activeTab === 'interfaces' && (
          <div className="space-y-2.5">
            {device.interfaces.map((iface) => (
              <InterfaceConfig key={iface.id} device={device} iface={iface} />
            ))}
          </div>
        )}

        {activeTab === 'ports' && <SwitchPorts device={device} />}

        {activeTab === 'rotas' && <RouteEditor device={device} />}

<button
  onClick={() => openTerminal(device.id)}
  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[--color-status-connected]/10 border border-[--color-status-connected]/30 text-[--color-status-connected] hover:bg-[--color-status-connected]/20 text-xs font-medium px-3 py-2 cursor-pointer transition-all duration-150 hover:-translate-y-px"
>
  <TerminalSquare size={13} /> Abrir console
</button>

<div className="grid grid-cols-2 gap-2">
  <button
    onClick={() => copyDevice(device.id)}
    title="Copiar (Ctrl+C)"
    className="flex items-center justify-center gap-1.5 rounded-lg bg-[--color-accent-cyan]/10 border border-[--color-accent-cyan]/30 text-[--color-accent-cyan] hover:bg-[--color-accent-cyan]/20 text-xs font-medium px-3 py-2 cursor-pointer transition-all duration-150"
  >
    <Copy size={12} /> Copiar
  </button>
  <button
    onClick={() => {
      copyDevice(device.id);
      pasteDevice();
    }}
    title="Duplicar (Ctrl+D)"
    className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1C2538] border border-[--color-border-primary]/60 text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-hover] text-xs font-medium px-3 py-2 cursor-pointer transition-all duration-150"
  >
    <CopyPlus size={12} /> Duplicar
  </button>
</div>

{device.type !== 'switch' && device.type !== 'hub' && <ArpTable deviceId={device.id} />}

<button
  onClick={() => removeDevice(device.id)}
  className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[--color-accent-red]/10 border border-[--color-accent-red]/30 text-[--color-accent-red] hover:bg-[--color-accent-red]/20 text-xs font-medium px-3 py-2 cursor-pointer transition-all duration-150 hover:-translate-y-px"
>
  <Trash2 size={13} /> Remover equipamento
</button>
      </div>
    </div>
  );
}
