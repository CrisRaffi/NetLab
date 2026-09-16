import { useRef, useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Crosshair } from 'lucide-react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import { DeviceNode } from './DeviceNode';
import { ConnectionLine } from './ConnectionLine';
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
  onDeviceClick: (deviceId: string) => void;
  onBackgroundClick: () => void;
  onConnectionSelect?: (connectionId: string) => void;
  onZoomChange?: (zoom: number) => void;
  onDeviceContextAction?: (action: string, deviceId: string) => void;
}

const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;

export const TopologyCanvas = forwardRef<TopologyCanvasHandle, TopologyCanvasProps>(
  function TopologyCanvas({ connectMode, onDeviceClick, onBackgroundClick, onConnectionSelect, onZoomChange, onDeviceContextAction }, ref) {
    const svgRef = useRef<SVGSVGElement>(null);
    const viewportRef = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });

    const topology = useSimulatorStore(s => s.topology);
    const selectedDeviceId = useSimulatorStore(s => s.selectedDeviceId);
    const selectedConnectionId = useSimulatorStore(s => s.selectedConnectionId);
    const connectingFromId = useSimulatorStore(s => s.connectingFromId);
    const moveDevice = useSimulatorStore(s => s.moveDevice);
    const selectConnection = useSimulatorStore(s => s.selectConnection);
    const deviceValidation = useSimulatorStore(s => s.deviceValidation);

    const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, zoom: 1 });
    const [cursorWorld, setCursorWorld] = useState<{ x: number; y: number } | null>(null);
    const [panning, setPanning] = useState(false);
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
                selected={selectedDeviceId === device.id}
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