import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Download, Upload, Crosshair } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { DeviceNode } from './DeviceNode';
import { ConnectionLine } from './ConnectionLine';
import { NetworkBlock } from './NetworkBlock';
import { PacketAnimator } from './PacketAnimator';
import { ContextMenu } from './ContextMenu';

interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface DragState {
  deviceId: string;
  offsetX: number;
  offsetY: number;
  startX: number;
  startY: number;
  moved: boolean;
}

interface PanState {
  startX: number;
  startY: number;
  panX: number;
  panY: number;
  moved: boolean;
}

export interface TopologyCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fitToContent: () => void;
  getZoom: () => number;
  getVisibleCenter: () => { x: number; y: number };
}

interface TopologyCanvasProps {
  connectMode: boolean;
  blockMode?: boolean;
  selectMode?: boolean;
  onDeviceClick: (deviceId: string, additive?: boolean) => void;
  onBackgroundClick: () => void;
  onConnectionSelect?: (connectionId: string) => void;
  onZoomChange?: (zoom: number) => void;
  onDeviceContextAction?: (action: string, deviceId: string) => void;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;

export const TopologyCanvas = forwardRef<TopologyCanvasHandle, TopologyCanvasProps>(
  function TopologyCanvas({ connectMode, blockMode = false, selectMode = false, onDeviceClick, onBackgroundClick, onConnectionSelect, onZoomChange, onDeviceContextAction }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const viewportRef = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });

    const topology = useSimulatorStore(s => s.topology);
    const loadTopology = useSimulatorStore(s => s.loadTopology);
    const addBlock = useSimulatorStore(s => s.addBlock);
    const removeBlock = useSimulatorStore(s => s.removeBlock);
    const moveBlock = useSimulatorStore(s => s.moveBlock);
    const resizeBlock = useSimulatorStore(s => s.resizeBlock);
    const selectedDeviceIds = useSimulatorStore(s => s.selectedDeviceIds);
    const selectedConnectionId = useSimulatorStore(s => s.selectedConnectionId);
    const selectedBlockIds = useSimulatorStore(s => s.selectedBlockIds);
    const setSelection = useSimulatorStore(s => s.setSelection);
    const selectBlock = useSimulatorStore(s => s.selectBlock);
    const handleBlockSelect = useCallback((id: string, additive = false) => {
      if (additive) {
        const next = selectedBlockIds.includes(id)
          ? selectedBlockIds.filter(x => x !== id)
          : [...selectedBlockIds, id];
        setSelection(selectedDeviceIds, next);
      } else {
        selectBlock(id);
      }
    }, [selectedBlockIds, selectedDeviceIds, setSelection, selectBlock]);
    const connectingFromId = useSimulatorStore(s => s.connectingFromId);
    const moveDevice = useSimulatorStore(s => s.moveDevice);
    const commitMove = useSimulatorStore(s => s.commitMove);
    const selectConnection = useSimulatorStore(s => s.selectConnection);
    const deviceValidation = useSimulatorStore(s => s.deviceValidation);

    const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
    const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);
    const [drawBlock, setDrawBlock] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
    const [marquee, setMarquee] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
    const [panning, setPanning] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; deviceId: string | null } | null>(null);

    useEffect(() => {
      viewportRef.current = viewport;
    }, [viewport]);

    useEffect(() => {
      onZoomChange?.(viewport.zoom);
    }, [viewport.zoom, onZoomChange]);

    const getWorldPoint = useCallback((clientX: number, clientY: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return { x: 0, y: 0 };
      const vp = viewportRef.current;
      return {
        x: (clientX - rect.left - vp.x) / vp.zoom,
        y: (clientY - rect.top - vp.y) / vp.zoom,
      };
    }, []);

    const zoomBy = useCallback((factor: number) => {
      setViewport(v => ({ ...v, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor)) }));
    }, []);

    const fitToContent = useCallback(() => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect || (topology.devices.length === 0 && !(topology.blocks?.length))) return;
      const xs = [...topology.devices.map(d => d.position.x), ...(topology.blocks ?? []).map(b => b.x)];
      const ys = [...topology.devices.map(d => d.position.y), ...(topology.blocks ?? []).map(b => b.y)];
      const xs2 = [...topology.devices.map(d => d.position.x), ...(topology.blocks ?? []).map(b => b.x + b.width)];
      const ys2 = [...topology.devices.map(d => d.position.y), ...(topology.blocks ?? []).map(b => b.y + b.height)];
      const minX = Math.min(...xs) - 100;
      const maxX = Math.max(...xs2) + 100;
      const minY = Math.min(...ys) - 100;
      const maxY = Math.max(...ys2) + 100;
      const width = maxX - minX;
      const height = maxY - minY;
      const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(rect.width / width, rect.height / height)));
      setViewport({
        zoom,
        x: (rect.width - width * zoom) / 2 - minX * zoom,
        y: (rect.height - height * zoom) / 2 - minY * zoom,
      });
    }, [topology.devices, topology.blocks]);

    useEffect(() => {
      const id = requestAnimationFrame(() => {
        fitToContent();
        setLoaded(true);
      });
      return () => cancelAnimationFrame(id);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      zoomIn: () => zoomBy(1.25),
      zoomOut: () => zoomBy(1 / 1.25),
      fitToContent,
      getZoom: () => viewportRef.current.zoom,
      getVisibleCenter: () => {
        const rect = svgRef.current?.getBoundingClientRect();
        return rect
          ? getWorldPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          : { x: 200, y: 150 };
      },
    }), [zoomBy, fitToContent, getWorldPoint]);

    const handleDevicePointerDown = useCallback(
      (e: React.PointerEvent, deviceId: string) => {
        e.stopPropagation();
        if (e.button !== 0) return;
        const device = topology.devices.find(d => d.id === deviceId);
        if (!device) return;
        const world = getWorldPoint(e.clientX, e.clientY);

        const group = selectedDeviceIds.length > 1 && selectedDeviceIds.includes(deviceId)
          ? topology.devices.filter(d => selectedDeviceIds.includes(d.id)).map(d => ({ id: d.id, x: d.position.x, y: d.position.y }))
          : null;

        const drag: DragState = {
          deviceId,
          offsetX: world.x - device.position.x,
          offsetY: world.y - device.position.y,
          startX: e.clientX,
          startY: e.clientY,
          moved: false,
        };
        const startWorld = { x: world.x, y: world.y };
        const originalTopology = topology;

        const onMove = (ev: PointerEvent) => {
          const dx = ev.clientX - drag.startX;
          const dy = ev.clientY - drag.startY;
          if (!drag.moved && Math.hypot(dx, dy) < 4) return;
          drag.moved = true;
          const p = getWorldPoint(ev.clientX, ev.clientY);
          if (group) {
            const ddx = p.x - startWorld.x;
            const ddy = p.y - startWorld.y;
            group.forEach(g => moveDevice(g.id, g.x + ddx, g.y + ddy));
          } else {
            moveDevice(drag.deviceId, p.x - drag.offsetX, p.y - drag.offsetY);
          }
        };

        const onUp = (ev: PointerEvent) => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          if (drag.moved) commitMove(originalTopology);
          else onDeviceClick(deviceId, ev.ctrlKey || ev.metaKey);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      },
      [topology, selectedDeviceIds, getWorldPoint, moveDevice, commitMove, onDeviceClick]
    );

    const handleBackgroundPointerDown = useCallback(
      (e: React.PointerEvent) => {
        if (e.button !== 0 && e.button !== 1) return;
        const start = getWorldPoint(e.clientX, e.clientY);

        if (blockMode) {
          setDrawBlock({ x1: start.x, y1: start.y, x2: start.x, y2: start.y });
          const onMove = (ev: PointerEvent) => {
            const p = getWorldPoint(ev.clientX, ev.clientY);
            setDrawBlock(d => (d ? { ...d, x2: p.x, y2: p.y } : d));
          };
          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            setDrawBlock(d => {
              if (d) {
                const x = Math.min(d.x1, d.x2);
                const y = Math.min(d.y1, d.y2);
                const width = Math.abs(d.x2 - d.x1);
                const height = Math.abs(d.y2 - d.y1);
                if (width > 20 && height > 20)
                  addBlock({
                    name: `Bloco ${(topology.blocks?.length ?? 0) + 1}`,
                    x,
                    y,
                    width,
                    height,
                  });
              }
              return null;
            });
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
          return;
        }

        if (selectMode || e.ctrlKey || e.metaKey) {
          const sel = { x1: start.x, y1: start.y, x2: start.x, y2: start.y, moved: false };
          setMarquee({ x1: start.x, y1: start.y, x2: start.x, y2: start.y });

          const apply = (ev: PointerEvent) => {
            const p = getWorldPoint(ev.clientX, ev.clientY);
            sel.x2 = p.x;
            sel.y2 = p.y;
            if (!sel.moved && Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 4) return;
            sel.moved = true;
            setMarquee({ x1: sel.x1, y1: sel.y1, x2: sel.x2, y2: sel.y2 });
            const x = Math.min(sel.x1, sel.x2);
            const y = Math.min(sel.y1, sel.y2);
            const w = Math.abs(sel.x2 - sel.x1);
            const h = Math.abs(sel.y2 - sel.y1);
            setSelection(
              topology.devices.filter(d => d.position.x >= x && d.position.x <= x + w && d.position.y >= y && d.position.y <= y + h).map(d => d.id),
              (topology.blocks ?? []).filter(b => b.x < x + w && b.x + b.width > x && b.y < y + h && b.y + b.height > y).map(b => b.id)
            );
          };

          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            setMarquee(null);
            if (!sel.moved) onBackgroundClick();
          };

          const onMove = (ev: PointerEvent) => apply(ev);
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
          return;
        }

        const pan: PanState = {
          startX: e.clientX,
          startY: e.clientY,
          panX: viewportRef.current.x,
          panY: viewportRef.current.y,
          moved: false,
        };
        setPanning(true);

        const onMove = (ev: PointerEvent) => {
          const dx = ev.clientX - pan.startX;
          const dy = ev.clientY - pan.startY;
          if (!pan.moved && Math.hypot(dx, dy) < 3) return;
          pan.moved = true;
          setViewport(v => ({ ...v, x: pan.panX + dx, y: pan.panY + dy }));
        };

        const onUp = () => {
          window.removeEventListener('pointermove', onMove);
          window.removeEventListener('pointerup', onUp);
          setPanning(false);
          if (!pan.moved) onBackgroundClick();
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
      },
      [blockMode, selectMode, getWorldPoint, addBlock, topology, onBackgroundClick, setSelection]
    );

    const handleWheel = useCallback((e: React.WheelEvent) => {
      e.preventDefault();
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      const vp = viewportRef.current;
      const worldBefore = {
        x: (e.clientX - rect.left - vp.x) / vp.zoom,
        y: (e.clientY - rect.top - vp.y) / vp.zoom,
      };
      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, vp.zoom * factor));
      setViewport({
        zoom: newZoom,
        x: e.clientX - rect.left - worldBefore.x * newZoom,
        y: e.clientY - rect.top - worldBefore.y * newZoom,
      });
    }, []);

    const sourceDevice = connectingFromId
      ? topology.devices.find(d => d.id === connectingFromId)
      : undefined;

    const handleContextMenu = useCallback((e: React.MouseEvent, deviceId: string | null) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, deviceId });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
      <div className="relative flex-1 bg-[#0A0E1A] overflow-hidden">
        {!loaded && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0A0E1A]">
            <span className="text-xs text-[#64748B]">Carregando quadro…</span>
          </div>
        )}
        <svg
          ref={svgRef}
          className="w-full h-full"
          onPointerDown={handleBackgroundPointerDown}
          onWheel={handleWheel}
          onPointerMove={e => {
            if (!connectingFromId) return;
            setCursorWorld(getWorldPoint(e.clientX, e.clientY));
          }}
          style={{
            cursor: panning ? 'grabbing' : connectMode ? 'crosshair' : 'default',
            touchAction: 'none',
          }}
        >
          <defs>
            {/* Dot grid */}
            <pattern id="netlab-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="0.7" fill="#273651" opacity="0.5" />
            </pattern>
            {/* Grid accent lines every 5 cells */}
            <pattern id="netlab-grid-major" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="url(#netlab-grid)" />
              <line x1="0" y1="0" x2="120" y2="0" stroke="#273651" strokeWidth="0.4" opacity="0.45" />
              <line x1="0" y1="0" x2="0" y2="120" stroke="#273651" strokeWidth="0.4" opacity="0.45" />
            </pattern>
            {/* Node glow */}
            <filter id="node-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Node glass sheen */}
            <linearGradient id="node-sheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity="0.06" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            {/* Subtle canvas vignette */}
            <radialGradient id="canvas-vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="#000" stopOpacity="0.35" />
            </radialGradient>
          </defs>

          <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
            <rect
              data-bg="true"
              x={-10000}
              y={-10000}
              width={20000}
              height={20000}
              fill="url(#netlab-grid-major)"
            />

            {topology.blocks?.map(block => (
              <NetworkBlock
                key={block.id}
                block={block}
                selected={selectedBlockIds.includes(block.id)}
                onSelect={handleBlockSelect}
                onRemove={removeBlock}
                onMove={moveBlock}
                onResize={resizeBlock}
              />
            ))}

            {drawBlock && (
              <rect
                x={Math.min(drawBlock.x1, drawBlock.x2)}
                y={Math.min(drawBlock.y1, drawBlock.y2)}
                width={Math.abs(drawBlock.x2 - drawBlock.x1)}
                height={Math.abs(drawBlock.y2 - drawBlock.y1)}
                fill="rgba(56,189,248,0.06)"
                stroke="#38BDF8"
                strokeWidth={1}
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {marquee && (
              <rect
                x={Math.min(marquee.x1, marquee.x2)}
                y={Math.min(marquee.y1, marquee.y2)}
                width={Math.abs(marquee.x2 - marquee.x1)}
                height={Math.abs(marquee.y2 - marquee.y1)}
                fill="rgba(99,102,241,0.08)"
                stroke="#818CF8"
                strokeWidth={1}
                strokeDasharray="4 3"
                vectorEffect="non-scaling-stroke"
              />
            )}

            {topology.connections.map(conn => (
              <ConnectionLine
                key={conn.id}
                connection={conn}
                devices={topology.devices}
                selected={selectedConnectionId === conn.id}
                onSelect={id => {
                  selectConnection(id);
                  onConnectionSelect?.(id);
                }}
              />
            ))}

            {connectingFromId && sourceDevice && cursorWorld && (
              <line
                x1={sourceDevice.position.x}
                y1={sourceDevice.position.y}
                x2={cursorWorld.x}
                y2={cursorWorld.y}
                stroke="#818CF8"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
                strokeOpacity={0.8}
              />
            )}

            {topology.devices.map(device => (
              <DeviceNode
                key={device.id}
                device={device}
                selected={selectedDeviceIds.includes(device.id)}
                connecting={connectMode || !!connectingFromId}
                isConnectionSource={connectingFromId === device.id}
                connected={topology.connections.some(
                  (c) => c.deviceId1 === device.id || c.deviceId2 === device.id
                )}
                validate={deviceValidation[device.id] ?? null}
                onPointerDown={handleDevicePointerDown}
                onDoubleClick={() => {}}
                onContextMenu={handleContextMenu}
              />
            ))}

            <PacketAnimator />
          </g>
        </svg>

        {/* Canvas vignette overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(2,9,20,0.4) 100%)' }} />

        {/* Connect mode banner */}
        {connectMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-[#1C2538]/90 border border-[--color-accent-cyan]/40 px-4 py-2 text-xs text-[--color-accent-cyan] shadow-lg animate-fade-in-up">
            <Crosshair size={13} />
            <span className="font-medium">{connectingFromId ? 'Clique no segundo equipamento para conectar' : 'Clique no primeiro equipamento'}</span>
          </div>
        )}

        {/* Status chip */}
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-[#111A2C]/80 border border-[--color-border-primary]/60 text-[10px] font-mono text-[--color-text-muted] glass">
          {Math.round(viewport.zoom * 100)}% · {topology.devices.length} disp. · {topology.connections.length} conexões
        </div>

        {/* Export / Import */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          <button
            onClick={() => {
              const json = JSON.stringify(topology, null, 2);
              const blob = new Blob([json], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `netlab-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            title="Exportar quadro (.json)"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#111A2C]/80 border border-[--color-border-primary]/60 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-accent-cyan]/40 transition-colors cursor-pointer glass"
          >
            <Download size={11} />
            Exportar
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Importar quadro (.json)"
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#111A2C]/80 border border-[--color-border-primary]/60 text-[10px] font-medium text-[--color-text-muted] hover:text-[--color-text-primary] hover:border-[--color-accent-cyan]/40 transition-colors cursor-pointer glass"
          >
            <Upload size={11} />
            Importar
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = () => {
                try {
                  const data = JSON.parse(reader.result as string);
                  if (data?.devices && data?.connections) {
                    loadTopology(data);
                  }
                } catch {}
              };
              reader.readAsText(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* Context menu */}
        <ContextMenu
          menu={contextMenu}
          onClose={() => setContextMenu(null)}
          onAction={(action, deviceId) => {
            if (!deviceId) return;
            onDeviceContextAction?.(action, deviceId);
          }}
        />
      </div>
    );
  }
);