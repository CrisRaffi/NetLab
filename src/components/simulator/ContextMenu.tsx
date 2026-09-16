import { useEffect, useRef } from 'react';
import { Pencil, Copy, Trash2, Cable, TerminalSquare, Info } from 'lucide-react';

interface ContextMenuState {
  x: number;
  y: number;
  deviceId: string | null;
}

interface ContextMenuProps {
  menu: ContextMenuState | null;
  onClose: () => void;
  onAction: (action: string, deviceId: string | null) => void;
}

const ITEMS: { id: string; label: string; icon: React.ReactNode; danger?: boolean }[] = [
  { id: 'rename', label: 'Renomear', icon: <Pencil size={12} /> },
  { id: 'duplicate', label: 'Duplicar', icon: <Copy size={12} /> },
  { id: 'connect', label: 'Conectar', icon: <Cable size={12} /> },
  { id: 'console', label: 'Abrir console', icon: <TerminalSquare size={12} /> },
  { id: 'info', label: 'Ver IPs', icon: <Info size={12} /> },
  { id: 'delete', label: 'Excluir', icon: <Trash2 size={12} />, danger: true },
];

export function ContextMenu({ menu, onClose, onAction }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const style: React.CSSProperties = {
    left: Math.min(menu.x, window.innerWidth - 180),
    top: Math.min(menu.y, window.innerHeight - 220),
  };

  return (
    <div
      ref={ref}
      className="fixed z-50 w-40 rounded-lg border border-[--color-border-primary] bg-[#111A2C]/95 backdrop-blur-md shadow-xl p-1"
      style={style}
    >
      {ITEMS.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            onAction(item.id, menu.deviceId);
            onClose();
          }}
          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[11px] text-left cursor-pointer transition-colors ${
            item.danger
              ? 'text-[--color-accent-red] hover:bg-[--color-accent-red]/10'
              : 'text-[--color-text-secondary] hover:bg-[--color-bg-hover] hover:text-[--color-text-primary]'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}