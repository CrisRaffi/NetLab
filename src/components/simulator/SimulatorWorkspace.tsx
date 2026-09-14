import { useEffect, useState } from 'react';
import {
  Cable,
  Trash2,
  MousePointer2,
  RotateCcw,
  Info,
  TerminalSquare,
  Layers,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Plus as PlusIcon,
  Maximize as MaximizeIcon,
  Minimize as MinimizeIcon,
} from 'lucide-react';
import { DevicePalette } from './DevicePalette';
import { TopologyCanvas } from './TopologyCanvas';
import { PropertyPanel } from './PropertyPanel';
import { Terminal } from './Terminal';
import { PacketInspector } from './PacketInspector';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { useTerminalStore } from '../../stores/useTerminalStore';
import { clsx } from 'clsx';

interface SimulatorWorkspaceProps {
  title: string;
  subtitle?: string;
  extraHeaderActions?: React.ReactNode;
  onValidate?: (topology: any) => void;
  validationSummary?: { passed: number; total: number } | null;
  resetTopologyTo?: any;
  evaluationTab?: {
    label: string;
    content: React.ReactNode;
  } | null;
  flashHint?: boolean;
  defaultBottomTab?: 'console' | 'packets' | 'evaluation';
}

export function SimulatorWorkspace({
  title,
  subtitle,
  extraHeaderActions,
  onValidate,
  validationSummary,
  resetTopologyTo,
  evaluationTab,
  flashHint,
  defaultBottomTab,
}: SimulatorWorkspaceProps) {
  const addDevice = useSimulatorStore((s) => s.addDevice);
  const resetTopology = useSimulatorStore((s) => s.resetTopology);
  const loadTopology = useSimulatorStore((s) => s.loadTopology);
  const selectDevice = useSimulatorStore((s) => s.selectDevice);
  const connectingFromId = useSimulatorStore((s) => s.connectingFromId);
  const startConnection = useSimulatorStore((s) => s.startConnection);
  const completeConnection = useSimulatorStore((s) => s.completeConnection);
  const cancelConnection = useSimulatorStore((s) => s.cancelConnection);
  const selectedDeviceId = useSimulatorStore((s) => s.selectedDeviceId);
  const selectedConnectionId = useSimulatorStore((s) => s.selectedConnectionId);
  const removeDevice = useSimulatorStore((s) => s.removeDevice);
  const removeConnection = useSimulatorStore((s) => s.removeConnection);
  const deviceCount = useSimulatorStore((s) => s.topology.devices.length);
  const packets = useSimulatorStore((s) => s.packets);

  const [connectMode, setConnectMode] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
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
    (s) => s.topology.devices.find((d) => d.id === terminalDeviceId)?.name,
  );

  const topology = useSimulatorStore((s) => s.topology);

  /*
   * Quando o console é aberto, selecionamos automaticamente
   * a aba "console" e expandimos o painel inferior.
   *
   * Antes havia uma assinatura manual:
   *
   * useTerminalStore.subscribe(...)
   *
   * Isso podia causar conflito com o mecanismo de
   * atualização do Zustand/React e gerar:
   *
   * Maximum update depth exceeded
   *
   * Agora usamos diretamente o estado já observado pelo componente.
   */
  useEffect(() => {
    if (terminalOpen) {
      setBottomTab('console');
      setBottomExpanded(true);
    }
  }, [terminalOpen]);

  const handleDeviceClick = (deviceId: string) => {
    if (connectMode) {
      if (!connectingFromId) {
        startConnection(deviceId);
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

  const toggleConnectMode = () => {
    setConnectMode((v) => !v);
    cancelConnection();
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
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[--color-border-primary]/50 bg-[#03111F]/60 backdrop-blur-md shrink-0 glass">
        {/* Left: Brand & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#123B61] to-[#0A2037] flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-lg shadow-blue-500/20">
            NL
          </div>

          <div className="hidden lg:block">
            <span className="text-sm font-semibold text-[#EAF4FF] tracking-tight">
              NetLab
            </span>

            <span className="block text-[9px] text-[#7891AA] uppercase tracking-wider">
              Simulador de Redes
            </span>
          </div>
        </div>

        {/* Right: Validate + Connect */}
        <div className="flex items-center gap-2 shrink-0">
          {onValidate && (
            <button
              onClick={handleValidate}
              className={clsx(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border cursor-pointer transition-colors',
                allPassed
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  : 'bg-blue-600/15 border-blue-500/40 text-blue-300 hover:bg-blue-600/25',
              )}
            >
              <ShieldCheck size={13} />
              Validar laboratório
              {validationSummary && (
                <span
                  className={clsx(
                    'text-[9px] px-1.5 rounded-full font-mono',
                    allPassed
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-700 text-slate-300',
                  )}
                >
                  {validationSummary.passed}/{validationSummary.total}
                </span>
              )}
            </button>
          )}

          <button
            onClick={toggleConnectMode}
            className={clsx(
              'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border cursor-pointer transition-colors',
              connectMode
                ? 'bg-[#0A2037] border-[#F0485C]/40 text-[#F0485C]'
                : 'border-[#123B61] text-[#7891AA] hover:text-[#C4D8EC] hover:bg-[#081C30]',
            )}
          >
            <MousePointer2 size={13} />

            {connectMode ? 'Cancelar conexão' : 'Conectar'}
          </button>
        </div>
      </div>

      {/* Instructions */}
      {showHelp && (
        <div className="flex items-center gap-4 px-4 py-2 bg-[#0A2037]/80 border-b border-[#123B61]/30 text-xs text-[#7891AA] shrink-0 overflow-x-auto">
          <span className="flex items-center gap-1.5">
            <MousePointer2 size={12} className="text-[#008CFF]" />
            <strong>Selecionar:</strong> clique num equipamento
          </span>

          <span className="flex items-center gap-1.5">
            <Cable size={12} className="text-[#00A8FF]" />
            <strong>Conectar:</strong> ative 'Conectar' e clique em dois
            equipamentos
          </span>

          <span className="flex items-center gap-1.5">
            <Trash2 size={12} className="text-[#F0485C]" />
            <strong>Remover:</strong> selecione e pressione Delete
          </span>

          <span className="text-[#7891AA] shrink-0">
            Roda do mouse = zoom · arraste o fundo = mover
          </span>
        </div>
      )}

      {/* Main workspace */}
      <div className="flex flex-1 min-h-0 flex-col">
        <div className="flex min-h-0 flex-1">
          <DevicePalette
            onAdd={() => {
              // Mantido conforme código original.
              // A lógica de adicionar dispositivos continua
              // sendo controlada pelo componente DevicePalette/store.
            }}
          />

          <TopologyCanvas
            connectMode={connectMode}
            onDeviceClick={handleDeviceClick}
            onBackgroundClick={handleBackgroundClick}
            onConnectionSelect={() => setPropertyPanelOpen(true)}
          />

          <PropertyPanel
            open={propertyPanelOpen}
            onToggle={() => setPropertyPanelOpen((v) => !v)}
          />
        </div>

        {/* Bottom panel */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-1.5 border-t border-[--color-border-primary]/40 bg-[#03111F] shrink-0 glass">
            <div className="flex items-center gap-1">
              {/* Console */}
              <button
                onClick={handleConsoleTab}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors',
                  bottomExpanded && bottomTab === 'console'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-[#7891AA] hover:text-[#C4D8EC] hover:bg-[#081C30]',
                )}
              >
                <TerminalSquare size={13} />
                Console
                {terminalDeviceName && (
                  <span className="text-[9px] text-[#7891AA] truncate">
                    {terminalDeviceName}
                  </span>
                )}
              </button>

              {/* Packets */}
              <button
                onClick={handlePacketsTab}
                className={clsx(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors',
                  bottomExpanded && bottomTab === 'packets'
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-[#7891AA] hover:text-[#C4D8EC] hover:bg-[#081C30]',
                )}
              >
                <Layers size={13} />
                Pacotes
                {packets.length > 0 && (
                  <span className="text-[9px] px-1.5 rounded-full bg-blue-500/20 text-blue-300">
                    {packets.length}
                  </span>
                )}
              </button>

              {/* Evaluation */}
              {evaluationTab && (
                <button
                  onClick={handleEvaluationTab}
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium cursor-pointer transition-colors',
                    bottomExpanded && bottomTab === 'evaluation'
                      ? 'bg-amber-500/15 text-amber-400'
                      : 'text-[#7891AA] hover:text-[#C4D8EC] hover:bg-[#081C30]',
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
              className="p-1 rounded text-[#7891AA] hover:text-[#C4D8EC] hover:bg-[#081C30] cursor-pointer"
              title={bottomExpanded ? 'Recolher painel' : 'Expandir painel'}
            >
              {bottomExpanded ? (
                <ChevronDown size={15} />
              ) : (
                <ChevronUp size={15} />
              )}
            </button>
          </div>

          {/* Bottom content */}
          {bottomExpanded && (
            <div className="flex flex-1 min-h-0 overflow-y-auto">
              {bottomTab === 'console' ? (
                terminalOpen ? (
                  <Terminal />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <TerminalSquare size={22} className="text-[#7891AA] mb-2" />

                    <p className="text-xs text-[#7891AA]">
                      Selecione um equipamento e clique em{' '}
                      <span className="text-emerald-400">Abrir console</span>.
                    </p>

                    <p className="text-[10px] text-[#5A7088] mt-1">
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
