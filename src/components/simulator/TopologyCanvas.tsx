import { useRef, useState, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, Crosshair } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { DeviceNode } from './DeviceNode';
import { ConnectionLine } from './ConnectionLine';
import { PacketAnimator } from './PacketAnimator';

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

interface TopologyCanvasProps {
  connectMode: boolean;
  onDeviceClick: (deviceId: string) => void;
  onBackgroundClick: () => void;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;

export function TopologyCanvas({ connectMode, onDeviceClick, onBackgroundClick }: TopologyCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const viewportRef = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });

  const topology = useSimulatorStore(s => s.topology);
  const selectedDeviceId = useSimulatorStore(s => s.selectedDeviceId);
  const selectedConnectionId = useSimulatorStore(s => s.selectedConnectionId);
  const connectingFromId = useSimulatorStore(s => s.connectingFromId);
  const moveDevice = useSimulatorStore(s => s.moveDevice);
  const selectConnection = useSimulatorStore(s => s.selectConnection);

  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
  const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);
  const [panning, setPanning] = useState(false);

  useEffect(() => {
    viewportRef.current = viewport;
  }, [viewport]);

  const getWorldPoint = useCallback((clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const vp = viewportRef.current;
    return {
      x: (clientX - rect.left - vp.x) / vp.zoom,
      y: (clientY - rect.top - vp.y) / vp.zoom,
    };
  }, []);

  const handleDevicePointerDown = useCallback(
    (e: React.PointerEvent, deviceId: string) => {
      e.stopPropagation();
      if (e.button !== 0) return;
      const device = topology.devices.find(d => d.id === deviceId);
      if (!device) return;
      const world = getWorldPoint(e.clientX, e.clientY);

      const drag: DragState = {
        deviceId,
        offsetX: world.x - device.position.x,
        offsetY: world.y - device.position.y,
        startX: e.clientX,
        startY: e.clientY,
        moved: false,
      };

      const onMove = (ev: PointerEvent) => {
        const dx = ev.clientX - drag.startX;
        const dy = ev.clientY - drag.startY;
        if (!drag.moved && Math.hypot(dx, dy) < 4) return;
        drag.moved = true;
        const p = getWorldPoint(ev.clientX, ev.clientY);
        moveDevice(drag.deviceId, p.x - drag.offsetX, p.y - drag.offsetY);
      };

      const onUp = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (!drag.moved) onDeviceClick(deviceId);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [topology.devices, getWorldPoint, moveDevice, onDeviceClick]
  );

  const handleBackgroundPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.button !== 1) return;
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
    [onBackgroundClick]
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

  const zoomBy = (factor: number) => {
    setViewport(v => ({ ...v, zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.zoom * factor)) }));
  };

  const fitToContent = useCallback(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || topology.devices.length === 0) return;
    const xs = topology.devices.map(d => d.position.x);
    const ys = topology.devices.map(d => d.position.y);
    const minX = Math.min(...xs) - 100;
    const maxX = Math.max(...xs) + 100;
    const minY = Math.min(...ys) - 100;
    const maxY = Math.max(...ys) + 100;
    const width = maxX - minX;
    const height = maxY - minY;
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(rect.width / width, rect.height / height)));
    setViewport({
      zoom,
      x: (rect.width - width * zoom) / 2 - minX * zoom,
      y: (rect.height - height * zoom) / 2 - minY * zoom,
    });
  }, [topology.devices]);

  const sourceDevice = connectingFromId
    ? topology.devices.find(d => d.id === connectingFromId)
    : undefined;

  return (
    <div className="relative flex-1 bg-[--color-bg-primary] overflow-hidden">
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
          <pattern id="netlab-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#16213a" strokeWidth="0.6" />
          </pattern>
        </defs>

        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`}>
          <rect
            data-bg="true"
            x={-10000}
            y={-10000}
            width={20000}
            height={20000}
            fill="url(#netlab-grid)"
          />

          {topology.connections.map(conn => (
            <ConnectionLine
              key={conn.id}
              connection={conn}
              devices={topology.devices}
              selected={selectedConnectionId === conn.id}
              onSelect={selectConnection}
            />
          ))}

          {connectingFromId && sourceDevice && cursorWorld && (
            <line
              x1={sourceDevice.position.x}
              y1={sourceDevice.position.y}
              x2={cursorWorld.x}
              y2={cursorWorld.y}
              stroke="#06b6d4"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              vectorEffect="non-scaling-stroke"
              pointerEvents="none"
            />
          )}

          {topology.devices.map(device => (
            <DeviceNode
              key={device.id}
              device={device}
              selected={selectedDeviceId === device.id}
              connecting={connectMode || !!connectingFromId}
              isConnectionSource={connectingFromId === device.id}
              onPointerDown={handleDevicePointerDown}
              onDoubleClick={() => {}}
            />
          ))}

          <PacketAnimator />
        </g>
      </svg>

      {connectMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-md bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs text-cyan-400">
          <Crosshair size={13} />
          {connectingFromId ? 'Clique no segundo equipamento para conectar' : 'Clique no primeiro equipamento'}
        </div>
      )}

      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
        <button
          onClick={() => zoomBy(1.2)}
          className="p-2 rounded-md bg-[--color-bg-card] border border-[--color-border-primary] text-slate-400 hover:text-slate-200 hover:bg-[--color-bg-hover] cursor-pointer"
          title="Aproximar"
        >
          <ZoomIn size={15} />
        </button>
        <button
          onClick={() => zoomBy(1 / 1.2)}
          className="p-2 rounded-md bg-[--color-bg-card] border border-[--color-border-primary] text-slate-400 hover:text-slate-200 hover:bg-[--color-bg-hover] cursor-pointer"
          title="Afastar"
        >
          <ZoomOut size={15} />
        </button>
        <button
          onClick={fitToContent}
          className="p-2 rounded-md bg-[--color-bg-card] border border-[--color-border-primary] text-slate-400 hover:text-slate-200 hover:bg-[--color-bg-hover] cursor-pointer"
          title="Ajustar à tela"
        >
          <Maximize size={15} />
        </button>
      </div>

      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-600">
        {Math.round(viewport.zoom * 100)}% · {topology.devices.length} disp. · {topology.connections.length} conexões
      </div>
    </div>
  );
}