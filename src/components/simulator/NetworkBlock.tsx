import { useRef } from 'react';
import type { NetworkBlock as Block } from '../../types';

interface NetworkBlockProps {
  block: Block;
  selected: boolean;
  onSelect: (id: string, additive?: boolean) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, x: number, y: number, width: number, height: number) => void;
}

const FILL = 'rgba(56,189,248,0.05)';
const STROKE = '#38BDF8';

export function NetworkBlock({ block, selected, onSelect, onRemove, onMove, onResize }: NetworkBlockProps) {
  const dragRef = useRef<{ mode: 'move' | 'resize'; startX: number; startY: number; orig: Block } | null>(null);

  const onPointerDown = (e: React.PointerEvent, mode: 'move' | 'resize') => {
    e.stopPropagation();
    if (e.button !== 0) return;
    onSelect(block.id);
    dragRef.current = { mode, startX: e.clientX, startY: e.clientY, orig: { ...block } };

    const onMove = (ev: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = (ev.clientX - drag.startX) / 1;
      const dy = (ev.clientY - drag.startY) / 1;
      if (drag.mode === 'move') {
        onMove(drag.orig.id, drag.orig.x + dx, drag.orig.y + dy);
      } else {
        const width = Math.max(40, drag.orig.width + dx);
        const height = Math.max(30, drag.orig.height + dy);
        onResize(drag.orig.id, drag.orig.x, drag.orig.y, width, height);
      }
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <g className="pointer-events-none">
      <rect
        x={block.x}
        y={block.y}
        width={block.width}
        height={block.height}
        rx={10}
        fill={FILL}
        stroke={STROKE}
        strokeWidth={1.2}
        strokeDasharray="8 5"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x={block.x}
        y={block.y}
        width={block.width}
        height={block.height}
        rx={10}
        fill="none"
        stroke={selected ? '#F59E0B' : STROKE}
        strokeWidth={selected ? 2 : 1.2}
        vectorEffect="non-scaling-stroke"
        opacity={selected ? 1 : 0.25}
      />
      <rect
        x={block.x}
        y={block.y}
        width={block.width}
        height={block.height}
        rx={10}
        fill="transparent"
        className="pointer-events-auto cursor-default"
        onPointerDown={(e) => {
          e.stopPropagation();
          if (e.button === 0) onSelect(block.id, e.ctrlKey || e.metaKey);
        }}
      />
      <foreignObject
        x={block.x}
        y={block.y + 6}
        width={block.width}
        height={22}
        pointerEvents="none"
      >
        <div className="flex justify-center">
          <span className="px-2 py-0.5 rounded-md bg-[#0D1424]/85 border border-[#38BDF8]/40 text-[10px] font-semibold text-[--color-accent-cyan] whitespace-nowrap">
            {block.name}
          </span>
        </div>
      </foreignObject>
      <circle
        cx={block.x + block.width}
        cy={block.y + block.height}
        r={7}
        fill="#0D1424"
        stroke={STROKE}
        strokeWidth={1.5}
        className="pointer-events-auto cursor-nwse-resize"
        onPointerDown={(e) => onPointerDown(e, 'resize')}
      />
    </g>
  );
}