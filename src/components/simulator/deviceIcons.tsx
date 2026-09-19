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
  Cpu,
  Waves,
} from 'lucide-react';
import type { DeviceType } from '../../types';

export const DEVICE_ICONS: Record<DeviceType, React.ComponentType<{ size?: number | string; className?: string; color?: string; strokeWidth?: number }>> = {
  pc: Monitor,
  server: Server,
  hub: Waves,
  switch: Network,
  router: RouterIcon,
  access_point: Wifi,
  firewall: Shield,
  printer: Printer,
  ip_camera: Camera,
  ip_phone: Phone,
  cloud: Cloud,
  core: Cpu,
};

/** Node card colors: accent stroke, translucent fill, icon/text tone. */
export const DEVICE_COLORS: Record<DeviceType, { stroke: string; fill: string; text: string }> = {
  pc: { stroke: '#6366F1', fill: 'rgba(0,140,255,0.14)', text: '#66BDFF' },
  server: { stroke: '#10B981', fill: 'rgba(39,198,106,0.14)', text: '#5FE08F' },
  hub: { stroke: '#2DD4BF', fill: 'rgba(45,212,191,0.13)', text: '#5EEAD4' },
  switch: { stroke: '#F59E0B', fill: 'rgba(245,179,1,0.13)', text: '#FFD75E' },
  router: { stroke: '#8B7CF6', fill: 'rgba(139,124,246,0.14)', text: '#B3A8FF' },
  access_point: { stroke: '#818CF8', fill: 'rgba(129, 140, 248,0.13)', text: '#5CC9FF' },
  firewall: { stroke: '#F43F5E', fill: 'rgba(240,72,92,0.13)', text: '#FF8493' },
  printer: { stroke: '#A8B8CF', fill: 'rgba(120,145,170,0.16)', text: '#BFCBDD' },
  ip_camera: { stroke: '#F5901E', fill: 'rgba(245,144,30,0.13)', text: '#FFB95E' },
  ip_phone: { stroke: '#00C9FF', fill: 'rgba(0,201,255,0.13)', text: '#5ED9FF' },
  cloud: { stroke: '#4E9EF5', fill: 'rgba(78,158,245,0.13)', text: '#8CC2FF' },
  core: { stroke: '#FF6B35', fill: 'rgba(255,107,53,0.13)', text: '#FF9F7A' },
};

export const DEVICE_ORDER: DeviceType[] = [
  'pc',
  'server',
  'hub',
  'switch',
  'router',
  'access_point',
  'firewall',
  'printer',
  'ip_camera',
  'ip_phone',
  'cloud',
  'core',
];