import {
  Monitor,
  Server,
  Network,
  Router as RouterIcon,
  Wifi,
  Shield,
  Printer,
  Camera,
  Phone,
  Cloud,
} from 'lucide-react';
import type { DeviceType } from '../../types';

export const DEVICE_ICONS: Record<DeviceType, React.ComponentType<{ size?: number | string; className?: string; color?: string; strokeWidth?: number }>> = {
  pc: Monitor,
  server: Server,
  switch: Network,
  router: RouterIcon,
  access_point: Wifi,
  firewall: Shield,
  printer: Printer,
  ip_camera: Camera,
  ip_phone: Phone,
  cloud: Cloud,
};

export const DEVICE_COLORS: Record<DeviceType, { stroke: string; fill: string; text: string }> = {
  pc: { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.12)', text: '#93c5fd' },
  server: { stroke: '#22c55e', fill: 'rgba(34,197,94,0.12)', text: '#86efac' },
  switch: { stroke: '#eab308', fill: 'rgba(234,179,8,0.12)', text: '#fde047' },
  router: { stroke: '#a855f7', fill: 'rgba(168,85,247,0.12)', text: '#d8b4fe' },
  access_point: { stroke: '#06b6d4', fill: 'rgba(6,182,212,0.12)', text: '#67e8f9' },
  firewall: { stroke: '#ef4444', fill: 'rgba(239,68,68,0.12)', text: '#fca5a5' },
  printer: { stroke: '#64748b', fill: 'rgba(100,116,139,0.12)', text: '#cbd5e1' },
  ip_camera: { stroke: '#f97316', fill: 'rgba(249,115,22,0.12)', text: '#fdba74' },
  ip_phone: { stroke: '#8b5cf6', fill: 'rgba(139,92,246,0.12)', text: '#c4b5fd' },
  cloud: { stroke: '#38bdf8', fill: 'rgba(56,189,248,0.12)', text: '#7dd3fc' },
};

export const DEVICE_ORDER: DeviceType[] = [
  'pc',
  'server',
  'switch',
  'router',
  'access_point',
  'firewall',
  'printer',
  'ip_camera',
  'ip_phone',
  'cloud',
];
