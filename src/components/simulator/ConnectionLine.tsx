import type { Connection, Device } from '../../types';

const STATUS_COLORS: Record<Connection['status'], string> = {
  connected: '#10B981',
  negotiating: '#F59E0B',
  disconnected: '#F43F5E',
};

const WIRELESS_COLOR = '#10B981';

/*
 * Hierarquia dos equipamentos: o tráfego "desce" de onde vem a Internet
 * (nuvem) para os dispositivos finais. Usado para orientar a direção das
 * bolinhas de tráfego nos cabos, refletindo o fluxo lógico da rede.
 */
const DEV_RANK: Record<string, number> = {
  cloud: 0,
  core: 1,
  router: 1,
  firewall: 1,
  server: 2,
  access_point: 2,
  switch: 3,
  hub: 3,
  printer: 4,
  ip_camera: 4,
  ip_phone: 4,
  pc: 4,
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

  const iface1 = dev1.interfaces.find(i => i.id === connection.interfaceId1);
  const iface2 = dev2.interfaces.find(i => i.id === connection.interfaceId2);
  const linkUp =
    (iface1?.status ?? 'up') === 'up' && (iface2?.status ?? 'up') === 'up';
  const status: Connection['status'] = linkUp
    ? connection.status
    : 'disconnected';

  const color = connection.type === 'wireless' ? WIRELESS_COLOR : STATUS_COLORS[status];
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
        stroke={selected ? '#6366F1' : color}
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
        stroke={selected ? '#6366F1' : color}
        strokeWidth={selected ? 2.5 : 1.5}
        strokeLinecap="round"
        strokeDasharray={connection.type === 'wireless' ? '4 6' : status === 'negotiating' ? '6 4' : undefined}
        strokeOpacity={connection.type === 'wireless' ? 0.9 : status === 'disconnected' ? 0.6 : 1}
        vectorEffect="non-scaling-stroke"
        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
      >
        {status === 'negotiating' && (
          <animate
            attributeName="stroke-dashoffset"
            values="0;-16"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </line>

      {/* Traffic flow dots (bolinhas indicando tráfego ativo) */}
      {linkUp && status === 'connected' && (
        <line
            x1={dev1.position.x}
            y1={dev1.position.y}
            x2={dev2.position.x}
            y2={dev2.position.y}
            stroke={color}
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeDasharray="0.01 26"
            pointerEvents="none"
            opacity={selected ? 0.95 : 0.7}
          >
          <animate
            attributeName="stroke-dashoffset"
            values={
              (DEV_RANK[dev2.type] ?? 5) < (DEV_RANK[dev1.type] ?? 5)
                ? '0;26.01'
                : '0;-26.01'
            }
            dur="1.6s"
            repeatCount="indefinite"
          />
        </line>
      )}

      {/* Delete indicator when selected */}
      {selected && (
        <>
          <circle cx={midX} cy={midY} r={10} fill="#182743" stroke="#6366F1" strokeWidth={1.5} />
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