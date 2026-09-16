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
  Maximize2,
  Minimize2,
  Undo2,
  Redo2,
  BoxSelect,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { DevicePalette } from './DevicePalette';
import { TopologyCanvas, type TopologyCanvasHandle } from './TopologyCanvas';
import { PropertyPanel } from './PropertyPanel';
import { Terminal } from './Terminal';
import { PacketInspector } from './PacketInspector';
import { ContextualHintOverlay } from './ContextualHint';
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
  const selectedDeviceIds = useSimulatorStore((s) => s.selectedDeviceIds);
  const addDevice = useSimulatorStore((s) => s.addDevice);
  const packets = useSimulatorStore(useShallow((s) => s.packets));
  const topology = useSimulatorStore((s) => s.topology);
  const copyDevice = useSimulatorStore((s) => s.copyDevice);
  const pasteDevice = useSimulatorStore((s) => s.pasteDevice);
  const removeDevice = useSimulatorStore((s) => s.removeDevice);
  const removeConnection = useSimulatorStore((s) => s.removeConnection);
  const selectedConnectionId = useSimulatorStore((s) => s.selectedConnectionId);
  const selectedBlockIds = useSimulatorStore((s) => s.selectedBlockIds);
  const setSelection = useSimulatorStore((s) => s.setSelection);
  const removeSelection = useSimulatorStore((s) => s.removeSelection);
  const copiedDeviceId = useSimulatorStore((s) => s.copiedDeviceId);
  const undo = useSimulatorStore((s) => s.undo);
  const redo = useSimulatorStore((s) => s.redo);
  const undoStack = useSimulatorStore((s) => s.undoStack);
  const redoStack = useSimulatorStore((s) => s.redoStack);
  const renameDevice = useSimulatorStore((s) => s.renameDevice);

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

      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (mod && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }
      if (mod && e.key.toLowerCase() === 'c') {
        if (selectedDeviceIds.length) copyDevice(selectedDeviceIds[0]);
        return;
      }
      if (mod && e.key.toLowerCase() === 'v') {
        if (copiedDeviceId) pasteDevice();
        return;
      }
      if (mod && e.key.toLowerCase() === 'd') {
        if (selectedDeviceIds.length) {
          copyDevice(selectedDeviceIds[0]);
          requestAnimationFrame(() => pasteDevice());
        }
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedDeviceIds.length || selectedBlockIds.length) {
          removeSelection(selectedDeviceIds, selectedBlockIds);
        } else if (selectedConnectionId) removeConnection(selectedConnectionId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    selectedDeviceIds,
    selectedConnectionId,
    selectedBlockIds,
    copiedDeviceId,
    copyDevice,
    pasteDevice,
    removeDevice,
    removeSelection,
    removeConnection,
    undo,
    redo,
  ]);

  const [connectMode, setConnectMode] = useState<
    'ethernet' | 'wireless' | null
  >(null);
  const [selectMode, setSelectMode] = useState(false);
  const [showHelp] = useState(true);
  const [propertyPanelOpen, setPropertyPanelOpen] = useState(true);
  const [bottomTab, setBottomTab] = useState<
    'console' | 'packets' | 'evaluation'
  >(defaultBottomTab ?? 'console');

  const [bottomExpanded, setBottomExpanded] = useState(
    Boolean(defaultBottomTab),
  );

  const [isFullscreen, setIsFullscreen] = useState(false);

  const terminalOpen = useTerminalStore((s) => s.open);
  const terminalDeviceId = useTerminalStore((s) => s.deviceId);

  const terminalDeviceName = useSimulatorStore(
    (s) =>
      s.topology.devices.find((d) => d.id === terminalDeviceId)?.name ?? null,
  );

  const prevTerminalOpenRef = useRef(terminalOpen);
  const canvasRef = useRef<TopologyCanvasHandle>(null);
  useEffect(() => {
    if (terminalOpen && !prevTerminalOpenRef.current) {
      setBottomTab('console');
      setBottomExpanded(true);
    }
    prevTerminalOpenRef.current = terminalOpen;
  }, [terminalOpen]);

  const createHomeNetworkExample = () => {
    const loadTopology = useSimulatorStore.getState().loadTopology;
    const resetTopology = useSimulatorStore.getState().resetTopology;
    resetTopology();
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
          iface('eth0', '192.168.1.10', {
            mask: '255.255.255.0',
            gw: '192.168.1.1',
            dns: '8.8.8.8',
          }),
        ]),
        device('pc2', 'pc', 'PC-Quarto', 80, 180, [
          iface('eth0', '192.168.1.11', {
            mask: '255.255.255.0',
            gw: '192.168.1.1',
            dns: '8.8.8.8',
          }),
        ]),
        device('server1', 'server', 'NAS', 80, 300, [
          iface('eth0', '192.168.2.10', {
            mask: '255.255.255.0',
            gw: '192.168.2.1',
            dns: '8.8.8.8',
          }),
        ]),
        device('ap1', 'access_point', 'WiFi-Casa', 200, 300, [
          iface('eth0', '192.168.3.10', {
            mask: '255.255.255.0',
            gw: '192.168.3.1',
            dns: '8.8.8.8',
          }),
        ]),
        device('printer1', 'printer', 'Impressora', 320, 300, [
          iface('eth0', '192.168.3.11', {
            mask: '255.255.255.0',
            gw: '192.168.3.1',
            dns: '8.8.8.8',
          }),
        ]),
        device('cloud1', 'cloud', 'Internet', 680, 120, [
          iface('eth0', '203.0.113.2', {
            mask: '255.255.255.252',
            gw: '203.0.113.1',
          }),
        ]),
      ],
      connections: [
        conn('core1', 'eth0', 'switch1', 'f0/1'),
        conn('switch1', 'f0/2', 'pc1', 'eth0'),
        conn('switch1', 'f0/3', 'pc2', 'eth0'),
        conn('core1', 'eth1', 'server1', 'eth0'),
        conn('core1', 'eth2', 'ap1', 'eth0'),
        conn('switch1', 'f0/4', 'printer1', 'eth0'),
        conn('core1', 'eth3', 'cloud1', 'eth0'),
      ],
    };
    loadTopology(topology);
  };

  function createTopologyHelpers() {
    function iface(
      id: string,
      ip?: string,
      opts: { mask?: string; gw?: string; dns?: string } = {},
    ) {
      return {
        id,
        name: id,
        type: 'ethernet' as const,
        mac: `AA:BB:CC:DD:${id.charCodeAt(0).toString(16).padStart(2, '0')}:00`,
        ip: ip ?? undefined,
        subnetMask: opts.mask,
        gateway: opts.gw,
        dns: opts.dns,
        status: 'up' as const,
        speed: 100,
      };
    }
    function device(
      id: string,
      type: any,
      name: string,
      x: number,
      y: number,
      interfaces: any[],
      routes: any[] = [],
    ) {
      return {
        id,
        type,
        name,
        position: { x, y },
        interfaces,
        config: { hostname: name, routes },
      };
    }
    function conn(a: string, ia: string, b: string, ib: string) {
      return {
        id: `conn-${a}-${b}`,
        deviceId1: a,
        interfaceId1: ia,
        deviceId2: b,
        interfaceId2: ib,
        type: 'ethernet' as const,
        status: 'connected' as const,
        bandwidth: 100,
        latency: 1,
      };
    }
    return { iface, device, conn };
  }

  const handleDeviceClick = (deviceId: string, additive = false) => {
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

    if (additive) {
      const next = selectedDeviceIds.includes(deviceId)
        ? selectedDeviceIds.filter((x) => x !== deviceId)
        : [...selectedDeviceIds, deviceId];
      setSelection(next, selectedBlockIds);
      setPropertyPanelOpen(true);
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

  const handleContextAction = (action: string, deviceId: string) => {
    switch (action) {
      case 'rename': {
        const device = useSimulatorStore.getState().topology.devices.find((d) => d.id === deviceId);
        const name = window.prompt('Novo nome do equipamento', device?.name ?? '');
        if (name) renameDevice(deviceId, name.trim());
        break;
      }
      case 'duplicate':
        copyDevice(deviceId);
        requestAnimationFrame(() => pasteDevice());
        break;
      case 'connect':
        selectDevice(deviceId);
        setConnectMode('ethernet');
        startConnection(deviceId, 'ethernet');
        break;
      case 'console':
        selectDevice(deviceId);
        useTerminalStore.getState().openTerminal(deviceId);
        setBottomTab('console');
        setBottomExpanded(true);
        break;
      case 'info':
        selectDevice(deviceId);
        setPropertyPanelOpen(true);
        break;
      case 'delete':
        removeDevice(deviceId);
        break;
    }
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

    if (!terminalOpen && selectedDeviceIds.length) {
      useTerminalStore.getState().openTerminal(selectedDeviceIds[0]);
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

  const renderSimulatorContent = () => (
    <div className="flex flex-col h-full">


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
          <DevicePalette
            onAdd={(type, position) => {
              const center = canvasRef.current?.getVisibleCenter();
              addDevice(
                type,
                center ?? position,
              );
            }}
          />

          <div className="relative flex flex-1 min-w-0 min-h-0">
            <TopologyCanvas
              ref={canvasRef}
              connectMode={!!connectMode}
              selectMode={selectMode}
              onDeviceClick={handleDeviceClick}
              onBackgroundClick={handleBackgroundClick}
              onConnectionSelect={() => setPropertyPanelOpen(true)}
              onDeviceContextAction={handleContextAction}
            />

            <ContextualHintOverlay
              device={topology.devices.find((d) => d.id === selectedDeviceIds[0]) ?? null}
              topology={topology}
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
                      setSelectMode(false);
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
              <button
                onClick={() => {
                  setSelectMode(s => !s);
                  setConnectMode(null);
                  cancelConnection();
                }}
                title="Seleção múltipla: arraste no fundo para selecionar vários equipamentos"
                className={clsx(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-all duration-150',
                  selectMode
                    ? 'bg-[--color-accent-blue]/15 text-[--color-accent-blue] ring-inset-blue'
                    : 'text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04]',
                )}
              >
                <BoxSelect size={14} />
                {selectMode ? 'Cancelar seleção' : 'Selecionar'}
              </button>
              {(selectedDeviceIds.length > 1 || selectedBlockIds.length > 1) && (
                <button
                  onClick={() => {
                  removeSelection(selectedDeviceIds, selectedBlockIds);
                }}
                  title="Excluir todos os selecionados"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-all duration-150 text-[#F87171] hover:bg-[#F87171]/15"
                >
                  <Trash2 size={14} />
                  Excluir seleção
                </button>
              )}
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

              {/* Example */}
              <button
                onClick={createHomeNetworkExample}
                className={clsx(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all duration-150',
                  'text-[--color-accent-cyan] hover:text-[--color-text-primary] hover:bg-[--color-accent-cyan]/10',
                )}
                title="Carregar rede doméstica de exemplo (resetar e criar nova)"
              >
                <Home size={13} />
                Exemplo
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={undo}
                disabled={undoStack.length === 0}
                title="Desfazer (Ctrl+Z)"
                className="p-2 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04] cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <Undo2 size={15} />
              </button>
              <button
                onClick={redo}
                disabled={redoStack.length === 0}
                title="Refazer (Ctrl+Y)"
                className="p-2 rounded-lg text-[--color-text-muted] hover:text-[--color-text-primary] hover:bg-white/[0.04] cursor-pointer disabled:opacity-30 disabled:cursor-default"
              >
                <Redo2 size={15} />
              </button>
              {onValidate && (
                <button
                  onClick={handleValidate}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium cursor-pointer transition-all duration-150',
                    allPassed
                      ? 'bg-[--color-accent-green]/15 text-[--color-accent-green] ring-inset-green'
                      : 'text-[--color-accent-blue] hover:text-[--color-text-primary] hover:bg-[--color-accent-blue]/10',
                  )}
                >
                  <ShieldCheck size={13} />
                  Validar
                  {validationSummary && (
                    <span
                      className={clsx(
                        'text-[9px] px-1.5 py-0.5 rounded-full font-mono',
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
              <button
                onClick={() => setIsFullscreen((v) => !v)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium cursor-pointer transition-all duration-150 text-[--color-accent-yellow] hover:text-[--color-text-primary] hover:bg-[--color-accent-yellow]/10"
                title={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
              >
                {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
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

  if (isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 z-50 bg-[--color-bg-primary] flex flex-col">
        {renderSimulatorContent()}
      </div>,
      document.body,
    );
  }

  return renderSimulatorContent();
}
