export type DeviceType = 'pc' | 'server' | 'switch' | 'router' | 'access_point' | 'firewall' | 'printer' | 'ip_camera' | 'ip_phone' | 'cloud' | 'core';

export type ConnectionType = 'ethernet' | 'crossover' | 'fiber' | 'wireless';
export type ConnectionStatus = 'connected' | 'disconnected' | 'negotiating';
export type InterfaceStatus = 'up' | 'down';

export interface Position {
  x: number;
  y: number;
}

export interface NetworkInterface {
  id: string;
  name: string;
  type: 'ethernet' | 'wireless' | 'serial';
  mac: string;
  ip?: string;
  subnetMask?: string;
  gateway?: string;
  dns?: string;
  vlan?: number;
  status: InterfaceStatus;
  speed: number;
}

export interface Route {
  destination: string;
  gateway: string;
  mask: string;
  metric: number;
  interfaceName: string;
}

export interface DeviceConfig {
  hostname: string;
  routes: Route[];
}

export interface Device {
  id: string;
  type: DeviceType;
  name: string;
  position: Position;
  interfaces: NetworkInterface[];
  config: DeviceConfig;
}

export interface Connection {
  id: string;
  deviceId1: string;
  interfaceId1: string;
  deviceId2: string;
  interfaceId2: string;
  type: ConnectionType;
  status: ConnectionStatus;
  bandwidth: number;
  latency: number;
}

export interface Topology {
  id: string;
  name: string;
  devices: Device[];
  connections: Connection[];
}

export interface Hint {
  level: 1 | 2 | 3;
  text: string;
}

export interface Solution {
  explanation: string;
  steps: string[];
  commands?: string[];
}

export interface ValidationCheck {
  type: 'connectivity' | 'config' | 'command_output' | 'topology' | 'arp' | 'route';
  target?: string;
  expected: unknown;
  description: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'troubleshooting' | 'configuration' | 'design' | 'theory' | 'subnetting';
  concepts: string[];
  prerequisites: string[];
  initialTopology: Topology;
  objective: string;
  hints: Hint[];
  solution: Solution;
  validation: ValidationCheck[];
  xpReward: number;
  estimatedTime: number;
}

export interface ConceptProgress {
  conceptId: string;
  mastery: number;
  attempts: number;
  lastPracticed: string;
  nextReview: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  xpReward: number;
}

export interface UserProgress {
  xp: number;
  level: number;
  concepts: ConceptProgress[];
  completedExercises: string[];
  achievements: Achievement[];
  stats: {
    totalTime: number;
    exercisesAttempted: number;
    exercisesCompleted: number;
    averageScore: number;
  };
}

export interface PacketLayer {
  name: string;
  protocol: string;
  fields: Record<string, string>;
}

export interface SimulatedPacket {
  id: string;
  type: 'icmp' | 'arp' | 'tcp' | 'udp' | 'dns' | 'dhcp';
  source: { mac: string; ip: string; port?: number };
  destination: { mac: string; ip: string; port?: number };
  ttl: number;
  layers: PacketLayer[];
}

export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
}
