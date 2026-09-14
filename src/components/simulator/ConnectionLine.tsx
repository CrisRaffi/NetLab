import type { Connection, Device } from '../../types';

const STATUS_COLORS: Record<Connection['status'], string> = {
  connected: '#27C66A',
  negotiating: '#F5B301',
  disconnected: '#F0485C',
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
      {/* Under-glow */}
      <line
        x1={dev1.position.x}
        y1={dev1.position.y}
        x2={dev2.position.x}
        y2={dev2.position.y}
        stroke={selected ? '#008CFF' : color}
        strokeWidth={selected ? 7 : 5}
        strokeOpacity={selected ? 0.12 : 0.08}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        pointerEvents="none"
      />

      {/* Main line */}
      <line
        x1={dev1.position.x}
        y1={dev1.position.y}
        x2={dev2.position.x}
        y2={dev2.position.y}
        stroke={selected ? '#008CFF' : color}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeDasharray={connection.status === 'negotiating' ? '6 4' : undefined}
        strokeOpacity={connection.status === 'disconnected' ? 0.6 : 1}
        vectorEffect="non-scaling-stroke"
      >
        {connection.status === 'negotiating' && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;-16"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </line>

      {/* Delete indicator when selected */}
      {selected && (
        <>
          <circle cx={midX} cy={midY} r={10} fill="#071A2C" stroke="#008CFF" strokeWidth={1.5} />
          <text
            x={midX}
            y={midY + 3.5}
            textAnchor="middle"
            fontSize={10}
            fill="#EAF4FF"
            fontFamily="var(--font-sans, sans-serif)"
            style={{ pointerEvents: 'none' }}
          >
            ×
          </text>
        </>
      )}

      {/* Hit area (invisible, wider) */}
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