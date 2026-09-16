import { Lightbulb } from 'lucide-react';
import type { Device, Topology } from '../../types';

const NEEDS_IP_TYPES = new Set(['pc', 'server', 'router', 'firewall', 'printer', 'ip_camera', 'ip_phone', 'access_point', 'core']);

function getContextualHint(
  device: Device,
  topology: Topology,
): { title: string; detail: string; ok: boolean } | null {
  const hasConn = topology.connections.some(
    (c) => c.deviceId1 === device.id || c.deviceId2 === device.id,
  );
  const needsIp = NEEDS_IP_TYPES.has(device.type);

  if (!hasConn)
    return { title: 'Sem conexão', detail: 'Conecte este equipamento a um switch ou roteador (cabo) ou a um AP (WiFi).', ok: false };

  if (!needsIp)
    return { title: 'Tudo certo! 🎉', detail: 'Equipamento conectado e operacional.', ok: true };

  const hasUp = device.interfaces.some((i) => i.status === 'up' && i.ip);
  const hasGw = device.interfaces.some((i) => i.gateway);
  const isClient =
    device.type === 'pc' || device.type === 'printer' || device.type === 'ip_camera' || device.type === 'ip_phone';

  if (!hasUp)
    return { title: 'Configure um IP', detail: 'Defina o IP e a máscara na interface conectada para ele participar da rede.', ok: false };
  if (isClient && !hasGw)
    return { title: 'Falta gateway', detail: 'Informe o gateway = IP do roteador/núcleo da rede (ex: rede 192.168.1.0/24 → 192.168.1.1).', ok: false };
  if (isClient && !hasDns(device))
    return { title: 'Falta DNS', detail: 'Adicione um servidor DNS (ex: 8.8.8.8) para resolver nomes como "servidor".', ok: false };
  return { title: 'Tudo certo! 🎉', detail: 'Equipamento configurado. Valide o laboratório ou teste com ping.', ok: true };
}

function hasDns(device: Device): boolean {
  return device.interfaces.some((i) => !!i.dns);
}

export function ContextualHintOverlay({ device, topology }: { device: Device | null; topology: Topology }) {
  if (!device) return null;
  const hint = getContextualHint(device, topology);
  if (!hint) return null;

  return (
    <div
      className={`absolute bottom-3 right-3 max-w-[240px] rounded-lg border px-3 py-2 shadow-lg pointer-events-none backdrop-blur-md bg-[#1C2538]/90 ${
        hint.ok ? 'border-[--color-accent-green]/40' : 'border-[--color-accent-yellow]/30'
      }`}
    >
      <div
        className={`flex items-center gap-1.5 text-[10px] font-semibold mb-0.5 ${
          hint.ok ? 'text-[--color-accent-green]' : 'text-[--color-accent-yellow]'
        }`}
      >
        <Lightbulb size={11} />
        {hint.title}
      </div>
      <p className="text-[10px] leading-relaxed text-[--color-text-muted]">{hint.detail}</p>
    </div>
  );
}