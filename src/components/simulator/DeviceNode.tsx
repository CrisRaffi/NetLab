import type { Device } from '../../types';
import { DEVICE_ICONS, DEVICE_COLORS } from './deviceIcons';

export const DEVICE_BOX_SIZE = 68;

interface DeviceNodeProps {
  device: Device;
  selected: boolean;
  connecting: boolean;
  isConnectionSource: boolean;
  onPointerDown: (e: React.PointerEvent, deviceId: string) => void;
  onDoubleClick: (deviceId: string) => void;
}

export function DeviceNode({
  device,
  selected,
  connecting,
  isConnectionSource,
  onPointerDown,
  onDoubleClick,
}: DeviceNodeProps) {
  const Icon = DEVICE_ICONS[device.type];
  const colors = DEVICE_COLORS[device.type];
  const half = DEVICE_BOX_SIZE / 2;
  const primaryInterface = device.interfaces.find(i => i.ip);
  const anyInterfaceUp = device.interfaces.some(i => i.status === 'up');

  const statusColor = !anyInterfaceUp ? '#64748b' : primaryInterface ? '#22c55e' : '#eab308';

  return (
    <g
      transform={`translate(${device.position.x} ${device.position.y})`}
      onPointerDown={e => onPointerDown(e, device.id)}
      onDoubleClick={() => onDoubleClick(device.id)}
      style={{ cursor: connecting ? 'crosshair' : 'grab' }}
    >
      {selected && (
        <rect
          x={-half - 6}
          y={-half - 6}
          width={DEVICE_BOX_SIZE + 12}
          height={DEVICE_BOX_SIZE + 12}
          rx={14}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          vectorEffect="non-scaling-stroke"
        />
      )}

      {isConnectionSource && (
        <rect
          x={-half - 6}
          y={-half - 6}
          width={DEVICE_BOX_SIZE + 12}
          height={DEVICE_BOX_SIZE + 12}
          rx={14}
          fill="none"
          stroke="#06b6d4"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        >
          <animate attributeName="opacity" values="1;0.3;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}

      <rect
        x={-half}
        y={-half}
        width={DEVICE_BOX_SIZE}
        height={DEVICE_BOX_SIZE}
        rx={10}
        fill={colors.fill}
        stroke={selected ? '#3b82f6' : colors.stroke}
        strokeWidth={selected ? 2 : 1.25}
        vectorEffect="non-scaling-stroke"
      />

      <g transform="translate(-16 -18)">
        <Icon size={32} color={colors.text} strokeWidth={1.6} />
      </g>

      <text
        x={0}
        y={half - 6}
        textAnchor="middle"
        fontSize={9}
        fontFamily="var(--font-mono, monospace)"
        fill="#cbd5e1"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {device.name}
      </text>

      <circle cx={half - 8} cy={-half + 8} r={3.5} fill={statusColor} stroke="#0a0e17" strokeWidth={1} />

      {primaryInterface?.ip && (
        <text
          x={0}
          y={half + 14}
          textAnchor="middle"
          fontSize={8}
          fontFamily="var(--font-mono, monospace)"
          fill="#64748b"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {primaryInterface.ip}
        </text>
      )}
    </g>
  );
}