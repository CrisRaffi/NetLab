import { useEffect, useRef, useState } from 'react';
import {
  Cable,
  Trash2,
  MousePointer2,
  TerminalSquare,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Wifi,
  Copy,
  Home,
} from 'lucide-react';
import { DevicePalette } from './DevicePalette';
import { TopologyCanvas } from './TopologyCanvas';
import { PropertyPanel } from './PropertyPanel';
import { Terminal } from './Terminal';
import { PacketInspector } from './PacketInspector';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { clsx } from 'clsx';
import { useShallow } from 'zustand/react/shallow';

interface SimulatorWorkspaceProps {
  onValidate?: (topology: any) => void;
  validationSummary?: { passed: number; total: number } | null;
  evaluationTab?: {
    label: string;
    content: React.ReactNode;
  } | null;
  defaultBottomTab?: 'console' | 'packets' | 'evaluation';
}

export function SimulatorWorkspace({
  onValidate,
  validationSummary,
  evaluationTab,
  defaultBottomTab,
}: SimulatorWorkspaceProps) {
  const selectDevice = useSimulatorStore((s) => s.selectDevice);
  const connectingFromId = useSimulatorStore((s) => s.connectingFromId);
  const startConnection = useSimulatorStore((s) => s.startConnection);
  const completeConnection = useSimulatorStore((s) => s.completeConnection);
  const cancelConnection = useSimulatorStore((s) => s.cancelConnection);
  const selectedDeviceId = useSimulatorStore((s) => s.selectedDeviceId);
  const addDevice = useSimulatorStore((s) => s.addDevice);
  const packets = useSimulatorStore(useShallow((s) => s.packets));
  const copyDevice = useSimulatorStore((s) => s.copyDevice);
  const pasteDevice = useSimulatorStore((s) => s.pasteDevice);
  const removeDevice = useSimulatorStore((s) => s.removeDevice);
  const removeConnection = useSimulatorStore((s) => s.removeConnection);
  const selectedConnectionId = useSimulatorStore((s) => s.selectedConnectionId);
  const copiedDeviceId = useSimulatorStore((s) => s.copiedDeviceId);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);
      if (isTyping) return;

      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === 'c') {
        if (selectedDeviceId) copyDevice(selectedDeviceId);
        return;
      }
      if (mod && e.key.toLowerCase() === 'v') {
        if (copiedDeviceId) pasteDevice();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        if (selectedDeviceId) {
          copyDevice(selectedDeviceId);
          requestAnimationFrame(() => pasteDevice());
        }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDeviceId) removeDevice(selectedDeviceId);
        else if (selectedConnectionId) removeConnection(selectedConnectionId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    selectedDeviceId,
    selectedConnectionId,
    copiedDeviceId,
    copyDevice,
    pasteDevice,
    removeDevice,
    removeConnection,
  ]);

  const [connectMode, setConnectMode] = useState<
    'ethernet' | 'wireless' | null
  >(null);
  const [showHelp] = useState(true);
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<
    'console' | 'packets' | 'evaluation'
  >(defaultBottomTab ?? 'console');

  const [bottomExpanded, setBottomExpanded] = useState(
    Boolean(defaultBottomTab),
  );

  const terminalOpen = useTerminalStore((s) => s.open);
  const terminalDeviceId = useTerminalStore((s) => s.deviceId);

  const terminalDeviceName = useSimulatorStore(
    (s) =>
      s.topology.devices.find((d) => d.id === terminalDeviceId)?.name ?? null,
  );

  const prevTerminalOpenRef = useRef(terminalOpen);
  useEffect(() => {
    if (terminalOpen && !prevTerminalOpenRef.current) {
      setBottomTab('console');
      setBottomExpanded(true);
    }
    prevTerminalOpenRef.current = terminalOpen;
  }, [terminalOpen]);

  const createHomeNetworkExample = () => {
    const loadTopology = useSimulatorStore.getState().loadTopology;
    const { device, iface, conn } = createTopologyHelpers();
    const topology = {
      id: 'home-network-example',
      name: 'Rede Doméstica Exemplo',
      devices: [
        device('core1', 'core', 'CORE-01', 440, 120, [
          iface('eth0', '192.168.1.1', { mask: '255.255.255.0' }),
          iface('eth1', '192.168.2.1', { mask: '255.255.255.0' }),
          iface('eth2', '192.168.3.1', { mask: '255.255.255.0' }),
          iface('eth3', '203.0.113.1', { mask: '255.255.255.252' }),
        ]),
        device('switch1', 'switch', 'SW-LAN', 200, 120, [
          iface('f0/1'),
          iface('f0/2'),
          iface('f0/3'),
          iface('f0/4'),
        ]),
        device('pc1', 'pc', 'PC-Sala', 80, 60, [
          iface('eth0', '192.168.1.10', { mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8' }),
        ]),
        device('pc2', 'pc', 'PC-Quarto', 80, 180, [
          iface('eth0', '192.168.1.11', { mask: '255.255.255.0', gw: '192.168.1.1', dns: '8.8.8.8' }),
        ]),
        device('server1', 'server', 'NAS', 80, 300, [
          iface('eth0', '192.168.2.10', { mask: '255.255.255.0', gw: '192.168.2.1', dns: '8.8.8.8' }),
        ]),
        device('ap1', 'access_point', 'WiFi-Casa', 200, 300, [
          iface('eth0', '192.168.3.10', { mask: '255.255.255.0', gw: '192.168.3.1', dns: '8.8.8.8' }),
        ]),
        device('printer1', 'printer', 'Impressora', 320, 300, [
          iface('eth0', '192.168.3.11', { mask: '255.255.255.0', gw: '192.168.3.1', dns: '8.8.8.8' }),
        ]),
        device('cloud1', 'cloud', 'Internet', 680, 120, [
          iface('eth0', '203.0.113.2', { mask: '255.255.255.252', gw: '203.0.113.1' }),
        ]),
      ],
      connections: [
        conn('core1', 'eth0', 'switch1', 'f0/1'),
        conn('switch1', 'f0/2', 'pc1', 'eth0'),
        conn('switch1', 'f0/3', 'pc2', 'eth0'),
        conn('core1', 'eth1', 'server1', 'eth0'),
        conn('core1', 'eth2', 'ap1', 'eth0'),
        conn('ap1', 'f0/2', 'printer1', 'eth0'),
        conn('core1', 'eth3', 'cloud1', 'eth0'),
      ],
    };
    loadTopology(topology);
  };

  function createTopologyHelpers() {
    function iface(id: string, ip?: string, opts: { mask?: string; gw?: string; dns?: string } = {}) {
      return { id, name: id, type: 'ethernet' as const, mac: `AA:BB:CC:DD:${id.charCodeAt(0).toString(16).padStart(2, '0')}:00`, ip: ip ?? undefined, subnetMask: opts.mask, gateway: opts.gw, dns: opts.dns, status: 'up' as const, speed: 100 };
    }
    function device(id: string, type: any, name: string, x: number, y: number, interfaces: any[], routes: any[] = []) {
      return { id, type, name, position: { x, y }, interfaces, config: { hostname: name, routes } };
    }
    function conn(a: string, ia: string, b: string, ib: string) {
      return { id: `conn-${a}-${b}`, deviceId1: a, interfaceId1: ia, deviceId2: b, interfaceId2: ib, type: 'ethernet' as const, status: 'connected' as const, bandwidth: 100, latency: 1 };
    }
    return { iface, device, conn };
  }

  const handleDeviceClick = (deviceId: string) => {
    if (connectMode) {
      if (!connectingFromId) {
        startConnection(deviceId, connectMode);
      } else if (connectingFromId === deviceId) {
        cancelConnection();
      } else {
        completeConnection(deviceId);
      }

      return;
    }

    selectDevice(deviceId);
    setPropertyPanelOpen(true);
  };

  const handleBackgroundClick = () => {
    if (connectingFromId) {
      cancelConnection();
    }

    selectDevice(null);
  };

  const handleValidate = () => {
    onValidate?.(useSimulatorStore.getState().topology);
  };

  const allPassed =
    validationSummary &&
    validationSummary.total > 0 &&
    validationSummary.passed === validationSummary.total;

  const handleConsoleTab = () => {
    setBottomTab('console');
    setBottomExpanded(true);

    if (!terminalOpen && selectedDeviceId) {
      useTerminalStore.getState().openTerminal(selectedDeviceId);
    }
  };

  const handlePacketsTab = () => {
    setBottomTab('packets');
    setBottomExpanded(true);
  };

  const handleEvaluationTab = () => {
    setBottomTab('evaluation');
    setBottomExpanded(true);
  };

  const handleBottomToggle = () => {
    setBottomExpanded((v) => !v);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-[--color-border-primary]/25 bg-[#0D1424]/50 backdrop-blur-md shrink-0">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-2.5"></div>

        {/* Right: Validate + Connect + Example */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={createHomeNetworkExample}
            className={clsx(
              'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium cursor-pointer transition-all duration-150',
              'bg-[--color-accent-cyan]/12 text-[#06B6D4] ring-inset-cyan hover:bg-[--color-accent-cyan]/20',
            )}
            title="Carregar rede doméstica de exemplo"
          >
            <Home size={14} />
            Exemplo
          </button>
          {onValidate && (
            <button
              onClick={handleValidate}
              className={clsx(
                'flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium cursor-pointer transition-all duration-150',
                allPassed
                  ? 'bg-[--color-accent-green]/12 text-[--color-accent-green] ring-inset-green'
                  : 'bg-[--color-accent-blue]/12 text-[#818CF8] ring-inset-blue hover:bg-[--color-accent-blue]/20',
              )}
            >
              <ShieldCheck size={14} />
              Validar laboratório
              {validationSummary && (
                <span
                  className={clsx(
                    'text-[10px] px-2 py-0.5 rounded-full font-mono',
                    allPassed
                      ? 'bg-[--color-accent-green]/20 text-[--color-accent-green]'
                      : 'bg-[--color-bg-tertiary] text-[--color-text-secondary]',
                  )}
                >
                  {validationSummary.passed}/{validationSummary.total}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Instructions */}
      {!showHelp && (
        <div className="flex items-center gap-5 px-4 py-2.5 bg-[#1C2538]/70 border-b border-[#273651]/25 text-xs text-[#94A3B8] shrink-0 overflow-x-auto">
          <span className="flex items-center gap-2">
            <MousePointer2 size={12} className="text-[#6366F1]" />
            <strong>Selecionar:</strong> clique num equipamento
          </span>

          <span className="flex items-center gap-2">
            <Cable size={12} className="text-[#818CF8]" />
            <strong>Conectar:</strong> ative 'Conectar' e clique em dois
            equipamentos
          </span>

          <span className="flex items-center gap-2">
            <Trash2 size={12} className="text-[#F43F5E]" />
            <strong>Remover:</strong> selecione e pressione Delete
          </span>

          <span className="flex items-center gap-2">
            <Copy size={12} className="text-[#818CF8]" />
            <strong>Copiar/Colar:</strong> Ctrl+C · Ctrl+V · Ctrl+D (duplicar)
          </span>

          <span className="text-[#94A3B8] shrink-0">
            Roda do mouse = zoom · arraste o fundo = mover
          </span>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex min-h-0 flex-1">
          <DevicePalette onAdd={addDevice} />

          <div className="relative flex flex-1 min-w-0 min-h-0">
            <TopologyCanvas
              connectMode={!!connectMode}
              onDeviceClick={handleDeviceClick}
              onBackgroundClick={handleBackgroundClick}
              onConnectionSelect={() => setPropertyPanelOpen(true)}
            />

            {/* Floating connect mode buttons over the canvas */}
            <div className="absolute top-3 right-3 z-20 flex items-center rounded-xl border border-[--color-border-primary]/25 bg-[#0D1424]/85 backdrop-blur-md p-1 gap-1 shadow-lg">
              {(['ethernet', 'wireless'] as const).map((mode) => {
                const active = connectMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      setConnectMode(active ? null : mode);
                      cancelConnection();
                    }}
                    className={clsx(
                      'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-all duration-150',
                      active
                        ? mode === 'wireless'
                          ? 'bg-[--color-accent-green]/15 text-[--color-accent-green] ring-inset-green-strong'
                          : 'bg-[--color-accent-red]/15 text-[--color-accent-red] ring-inset-red'
                        : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
                    )}
                  >
                    {mode === 'wireless' ? (
                      <Wifi size={14} />
                    ) : (
                      <MousePointer2 size={14} />
                    )}
                    {active
                      ? mode === 'wireless'
                        ? 'Cancelar WiFi'
                        : 'Cancelar conexão'
                      : mode === 'wireless'
                        ? 'WiFi'
                        : 'Conectar'}
                  </button>
                );
              })}
            </div>
          </div>

          <PropertyPanel
            open={propertyPanelOpen}
            onToggle={() => setPropertyPanelOpen((v) => !v)}
          />
        </div>

        {/* Bottom panel */}
        <div className="flex flex-col min-h-0 pb-3 max-h-[320px]">
          <div className="flex items-center justify-between px-4 py-2 border-t border-[--color-border-primary]/25 bg-[#0D1424]/90 shrink-0">
            <div className="flex items-center gap-1.5">
              {/* Console */}
              <button
                onClick={handleConsoleTab}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all duration-150',
                  bottomExpanded && bottomTab === 'console'
                    ? 'bg-[--color-accent-green]/15 text-[--color-accent-green] ring-inset-green'
                    : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
                )}
              >
                <TerminalSquare size={13} />
                Console
                {terminalDeviceName && (
                  <span className="text-[9px] text-[--color-text-muted] truncate">
                    {terminalDeviceName}
                  </span>
                )}
              </button>

              {/* Packets */}
              <button
                onClick={handlePacketsTab}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all duration-150',
                  bottomExpanded && bottomTab === 'packets'
                    ? 'bg-[--color-accent-blue]/15 text-[--color-accent-blue] ring-inset-blue'
                    : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
                )}
              >
                <Layers size={13} />
                Pacotes
                {packets.length > 0 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[--color-accent-blue]/20 text-[#818CF8]">
                    {packets.length}
                  </span>
                )}
              </button>

              {/* Evaluation */}
              {evaluationTab && (
                <button
                  onClick={handleEvaluationTab}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all duration-150',
                    bottomExpanded && bottomTab === 'evaluation'
                      ? 'bg-[--color-accent-yellow]/15 text-[--color-accent-yellow] ring-inset-yellow'
                      : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
                  )}
                >
                  <ShieldCheck size={13} />
                  {evaluationTab.label}
                </button>
              )}
            </div>

            {/* Bottom panel toggle */}
            <button
              onClick={handleBottomToggle}
              className="p-2 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04] cursor-pointer"
              title={bottomExpanded ? 'Recolher painel' : 'Expandir painel'}
            >
              {bottomExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronUp size={16} />
              )}
            </button>
          </div>

          {/* Bottom content */}
          {bottomExpanded && (
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
              {bottomTab === 'console' ? (
                terminalOpen ? (
                  <Terminal />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <TerminalSquare size={22} className="text-[#94A3B8] mb-2" />

                    <p className="text-xs text-[#94A3B8]">
                      Selecione um equipamento e clique em{' '}
                      <span className="text-[--color-accent-green]">
                        Abrir console
                      </span>
                      .
                    </p>

                    <p className="text-[10px] text-[#64748B] mt-1">
                      No console você pode executar ipconfig, ping, tracert, arp
                      e mais.
                    </p>
                  </div>
                )
              ) : bottomTab === 'packets' ? (
                <PacketInspector />
              ) : (
                (evaluationTab?.content ?? null)
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
