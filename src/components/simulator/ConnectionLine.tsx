import type { Connection, Device } from '../../types';

const STATUS_COLORS: Record<Connection['status'], string> = {
  connected: '#22c55e',
  negotiating: '#eab308',
  disconnected: '#ef4444',
};

interface ConnectionLineProps {
  connection: Connection;
  devices: Device[];
  selected: boolean;
  onSelect: (connectionId: string) => void;
}

export function ConnectionLine({ connection, devices, selected, onSelect }: ConnectionLineProps) {
  const dev1 = devices.find(d => d.id === connection.deviceId1);
  const dev2 = devices.find(d => d.id === connection.deviceId2);
  if (!dev1 || !dev2) return null;

  const color = STATUS_COLORS[connection.status];
  const midX = (dev1.position.x + dev2.position.x) / 2;
  const midY = (dev1.position.y + dev2.position.y) / 2;

  return (
    <g>
      <line
        x1={dev1.position.x}
        y1={dev1.position.y}
        x2={dev2.position.x}
        y2={dev2.position.y}
        stroke={selected ? '#3b82f6' : color}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeDasharray={connection.status === 'negotiating' ? '6 4' : undefined}
        vectorEffect="non-scaling-stroke"
      />
      {selected && (
        <>
          <circle cx={midX} cy={midY} r={9} fill="#3b82f6" stroke="#0a0e17" strokeWidth={1.5} />
          <text x={midX} y={midY + 3} textAnchor="middle" fontSize={9} fill="#fff" style={{ pointerEvents: 'none' }}>
            ×
          </text>
        </>
      )}
      <line
        x1={dev1.position.x}
        y1={dev1.position.y}
        x2={dev2.position.x}
        y2={dev2.position.y}
        stroke="transparent"
        strokeWidth={14}
        vectorEffect="non-scaling-stroke"
        style={{ cursor: 'pointer' }}
        onPointerDown={e => {
          e.stopPropagation();
          onSelect(connection.id);
        }}
      />
    </g>
  );
}