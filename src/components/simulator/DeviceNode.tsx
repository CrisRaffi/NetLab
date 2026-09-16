import type { Device } from '../../types';
import { DEVICE_ICONS, DEVICE_COLORS } from './deviceIcons';

export const DEVICE_BOX_SIZE = 80;

interface DeviceNodeProps {
  device: Device;
  selected: boolean;
  connecting: boolean;
  isConnectionSource: boolean;
  connected: boolean;
  validate: 'pass' | 'fail' | null;
  onPointerDown: (e: React.PointerEvent, deviceId: string) => void;
  onDoubleClick: (deviceId: string) => void;
  onContextMenu?: (e: React.MouseEvent, deviceId: string) => void;
}

const NEEDS_IP_TYPES = new Set(['pc', 'server', 'router', 'firewall', 'printer', 'ip_camera', 'ip_phone', 'access_point', 'core']);

function truncateName(name: string): string {
  return name.length > 11 ? `${name.slice(0, 10)}…` : name;
}

export function DeviceNode({
  device,
  selected,
  connecting,
  isConnectionSource,
  connected,
  validate,
  onPointerDown,
  onDoubleClick,
  onContextMenu,
}: DeviceNodeProps) {
  const Icon = DEVICE_ICONS[device.type];
  const colors = DEVICE_COLORS[device.type];
  const half = DEVICE_BOX_SIZE / 2;
  const primaryInterface = device.interfaces.find(i => i.ip);
  const hasUpWithIp = device.interfaces.some(i => i.status === 'up' && i.ip);
  const needsIp = NEEDS_IP_TYPES.has(device.type);

  const statusColor = !connected ? '#64748B' : needsIp && !hasUpWithIp ? '#F59E0B' : '#10B981';
  const statusLabel = !connected ? 'sem link' : needsIp && !hasUpWithIp ? 'falta IP' : 'conectado';

  return (
    <g
      transform={`translate(${device.position.x} ${device.position.y})`}
      onPointerDown={e => onPointerDown(e, device.id)}
      onDoubleClick={() => onDoubleClick(device.id)}
      onContextMenu={e => onContextMenu?.(e, device.id)}
      style={{ cursor: connecting ? 'crosshair' : 'grab' }}
    >
      {/* Selection glow */}
      {selected && (
        <rect
          x={-half - 8}
          y={-half - 8}
          width={DEVICE_BOX_SIZE + 16}
          height={DEVICE_BOX_SIZE + 16}
          rx={16}
          fill="none"
          stroke="#6366F1"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          filter="url(#node-glow)"
        />
      )}

      {/* Connection-source pulsing ring */}
      {isConnectionSource && (
        <rect
          x={-half - 7}
          y={-half - 7}
          width={DEVICE_BOX_SIZE + 14}
          height={DEVICE_BOX_SIZE + 14}
          rx={15}
          fill="none"
          stroke="#818CF8"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        >
          <animate attributeName="opacity" values="1;0.25;1" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Node card */}
      <rect
        x={-half}
        y={-half}
        width={DEVICE_BOX_SIZE}
        height={DEVICE_BOX_SIZE}
        rx={14}
        fill={colors.fill}
        stroke={selected ? '#6366F1' : colors.stroke}
        strokeOpacity={selected ? 0.9 : 0.45}
        strokeWidth={selected ? 2 : 1.25}
        vectorEffect="non-scaling-stroke"
      />

      {/* Top highlight (glass sheen) */}
      <rect
        x={-half + 1}
        y={-half + 1}
        width={DEVICE_BOX_SIZE - 2}
        height={(DEVICE_BOX_SIZE - 2) / 2}
        rx={13}
        fill="url(#node-sheen)"
      />

      {/* Validation badge */}
      {validate && (
        <g>
          <circle cx={-half + 11} cy={-half + 11} r={7} fill={validate === 'pass' ? '#22C55E' : '#EF4444'} stroke="#0A0E1A" strokeWidth={1.5} />
          <text
            x={-half + 11}
            y={-half + 14}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill="#0A0E1A"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {validate === 'pass' ? '✓' : '✕'}
          </text>
        </g>
      )}

      {/* Status dot */}
      <circle cx={half - 11} cy={-half + 11} r={4} fill={statusColor} stroke="#0A0E1A" strokeWidth={1.5} />
      {statusColor === '#10B981' && (
        <circle cx={half - 11} cy={-half + 11} r={7} fill="none" stroke="#10B981" strokeWidth={1} opacity={0.5}>
          <animate attributeName="r" values="5;9" dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}

      {/* Icon */}
      <g transform="translate(-13 -14)" style={{ pointerEvents: 'none' }}>
        <Icon size={26} color={colors.text} strokeWidth={1.6} />
      </g>

      {/* Name */}
      <text
        x={0}
        y={half - 11}
        textAnchor="middle"
        fontSize={9}
        fontWeight={600}
        fontFamily="var(--font-sans, Inter, sans-serif)"
        fill="#E8EDF5"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {truncateName(device.name)}
      </text>

      {/* IP */}
      {primaryInterface?.ip ? (
        <text
          x={0}
          y={half + 16}
          textAnchor="middle"
          fontSize={8}
          fontFamily="var(--font-mono, monospace)"
          fill="#64748B"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {primaryInterface.ip}
        </text>
      ) : (
        <text
          x={0}
          y={half + 16}
          textAnchor="middle"
          fontSize={7}
          fontFamily="var(--font-sans, Inter, sans-serif)"
          fill="#64748B"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {statusLabel}
        </text>
      )}
    </g>
  );
}