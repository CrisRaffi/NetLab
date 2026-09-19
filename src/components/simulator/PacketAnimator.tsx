import { useEffect, useState } from 'react';
import { useSimulatorStore } from '../../stores/useSimulatorStore';
import type { ActiveAnimation } from '../../stores/useSimulatorStore';
import { PROTOCOL_TIPS } from '../../data/protocolTips';

const PACKET_COLORS: Record<string, string> = {
  icmp: '#10B981',
  arp: '#F59E0B',
  tcp: '#6366F1',
  udp: '#00C9FF',
  dns: '#8B7CF6',
  dhcp: '#F5901E',
};

const PACKET_LABELS: Record<string, string> = {
  icmp: 'ICMP',
  arp: 'ARP',
  tcp: 'TCP',
  udp: 'UDP',
  dns: 'DNS',
  dhcp: 'DHCP',
};

function pointAt(points: { x: number; y: number }[], t: number) {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  const total = points.length - 1;
  const scaled = Math.max(0, Math.min(1, t)) * total;
  const i = Math.min(Math.floor(scaled), total - 1);
  const local = scaled - i;
  const a = points[i];
  const b = points[i + 1];
  return { x: a.x + (b.x - a.x) * local, y: a.y + (b.y - a.y) * local };
}

function progressOf(anim: ActiveAnimation, now: number): number {
  const elapsed = now - anim.startedAt - anim.delay;
  if (elapsed < 0) return -1;
  return Math.min(1, elapsed / anim.duration);
}

function branchProgressOf(branch: { startFraction: number }, progress: number): number {
  if (branch.startFraction >= 1) return -1;
  if (progress < branch.startFraction) return -1;
  return (progress - branch.startFraction) / (1 - branch.startFraction);
}

export function PacketAnimator() {
  const animations = useSimulatorStore(s => s.animations);
  const [frameTime, setFrameTime] = useState(0);

  useEffect(() => {
    if (animations.length === 0) return;
    let raf = 0;
    const tick = (t: number) => {
      setFrameTime(t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animations.length]);

  if (animations.length === 0) return null;

  const now = frameTime;

  return (
    <g pointerEvents="none">
      {animations.map(anim => {
        const progress = progressOf(anim, now);
        if (progress < 0 || progress >= 1) return null;
        const { x, y } = pointAt(anim.points, progress);
        const color = PACKET_COLORS[anim.packet.type] ?? '#6366F1';
        return (
          <g key={anim.id}>
            <g transform={`translate(${x} ${y})`}>
              <circle r={14} fill={color} opacity={0.15} />
              <circle r={7} fill={color} stroke="#111A2C" strokeWidth={1.5} />
              <text
                x={0}
                y={-13}
                textAnchor="middle"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill={color}
              >
                {PACKET_LABELS[anim.packet.type] ?? anim.packet.type.toUpperCase()}
                <title>{PROTOCOL_TIPS[PACKET_LABELS[anim.packet.type] ?? anim.packet.type.toUpperCase()]}</title>
              </text>
            </g>
            {(anim.branches ?? []).map((branch, bi) => {
              const bProgress = branchProgressOf(branch, progress);
              if (bProgress < 0 || bProgress >= 1) return null;
              const bp = pointAt(branch.points, bProgress);
              return (
                <g key={`${anim.id}-branch-${bi}`} transform={`translate(${bp.x} ${bp.y})`}>
                  <circle r={14} fill={color} opacity={0.08} />
                  <circle r={6} fill={color} stroke="#111A2C" strokeWidth={1.5} />
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}
