import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, Connection, Topology, DeviceType, NetworkInterface, SimulatedPacket, Route } from '../types';
import { generateMac } from '../utils/ip';
import type { ArpEntry } from '../engine/protocols/arp';
import type { Transmission } from '../engine/simulation/network';

export interface ActiveAnimation {
  id: string;
  packet: SimulatedPacket;
  points: { x: number; y: number }[];
  duration: number;
  delay: number;
  startedAt: number;
}

export const DEVICE_LABELS: Record<DeviceType, string> = {
  pc: 'PC',
  server: 'Servidor',
  switch: 'Switch',
  router: 'Roteador',
  access_point: 'Access Point',
  firewall: 'Firewall',
  printer: 'Impressora',
  ip_camera: 'Câmera IP',
  ip_phone: 'Telefone IP',
  cloud: 'Internet',
};

export const DEVICE_PREFIX: Record<DeviceType, string> = {
  pc: 'PC',
  server: 'SRV',
  switch: 'SW',
  router: 'R',
  access_point: 'AP',
  firewall: 'FW',
  printer: 'PRN',
  ip_camera: 'CAM',
  ip_phone: 'IPF',
  cloud: 'NET',
};

const INTERFACE_COUNT: Record<DeviceType, number> = {
  pc: 1,
  server: 1,
  switch: 8,
  router: 2,
  access_point: 1,
  firewall: 2,
  printer: 1,
  ip_camera: 1,
  ip_phone: 1,
  cloud: 1,
};

function createInterfaces(type: DeviceType, deviceIndex: number): NetworkInterface[] {
  const count = INTERFACE_COUNT[type];
  return Array.from({ length: count }, (_, i) => ({
    id: `eth${i}`,
    name: type === 'switch' ? `FastEthernet0/${i + 1}` : `eth${i}`,
    type: 'ethernet' as const,
    mac: generateMac(),
    status: 'up' as const,
    speed: 100,
    ip: undefined as string | undefined,
    subnetMask: undefined as string | undefined,
    gateway: undefined as string | undefined,
    dns: undefined as string | undefined,
  })).map((iface, i) => ({
    ...iface,
    mac: `AA:BB:CC:${deviceIndex.toString(16).padStart(2, '0').toUpperCase()}:${(i + 1).toString(16).padStart(2, '0').toUpperCase()}:00`,
  }));
}

function nextDeviceName(type: DeviceType, devices: Device[]): string {
  const prefix = DEVICE_PREFIX[type];
  const existing = devices
    .filter(d => d.type === type)
    .map(d => {
      const match = d.name.match(/(\d+)$/);
      return match ? Number(match[1]) : 0;
    });
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}-${String(next).padStart(2, '0')}`;
}

export function createDefaultTopology(): Topology {
  const devices: Device[] = [
    {
      id: 'dev-pc-1',
      type: 'pc',
      name: 'PC-01',
      position: { x: 220, y: 160 },
      interfaces: createInterfaces('pc', 1),
      config: { hostname: 'PC-01', routes: [] },
    },
    {
      id: 'dev-switch-1',
      type: 'switch',
      name: 'SW-01',
      position: { x: 440, y: 160 },
      interfaces: createInterfaces('switch', 2),
      config: { hostname: 'SW-01', routes: [] },
    },
    {
      id: 'dev-router-1',
      type: 'router',
      name: 'R-01',
      position: { x: 660, y: 160 },
      interfaces: createInterfaces('router', 3),
      config: { hostname: 'R-01', routes: [] },
    },
  ];

  return {
    id: 'free-topology',
    name: 'Laboratório Livre',
    devices,
    connections: [],
  };
}

interface SimulatorState {
  topology: Topology;
  selectedDeviceId: string | null;
  selectedConnectionId: string | null;
  connectingFromId: string | null;
  packetLog: { id: string; from: string; to: string; type: string; timestamp: number }[];
  arpTables: Record<string, ArpEntry[]>;
  packets: SimulatedPacket[];
  selectedPacketId: string | null;
  animations: ActiveAnimation[];

  loadTopology: (topology: Topology) => void;
  resetTopology: () => void;
  addDevice: (type: DeviceType, position: { x: number; y: number }) => void;
  removeDevice: (deviceId: string) => void;
  moveDevice: (deviceId: string, x: number, y: number) => void;
  renameDevice: (deviceId: string, name: string) => void;

  selectDevice: (deviceId: string | null) => void;
  selectConnection: (connectionId: string | null) => void;

  startConnection: (deviceId: string) => void;
  completeConnection: (deviceId: string) => void;
  cancelConnection: () => void;
  addConnection: (deviceId1: string, deviceId2: string) => void;
  removeConnection: (connectionId: string) => void;

  updateInterface: (deviceId: string, interfaceId: string, updates: Partial<NetworkInterface>) => void;
  toggleInterfaceStatus: (deviceId: string, interfaceId: string) => void;
  updateRoutes: (deviceId: string, routes: Route[]) => void;

  logPacket: (from: string, to: string, type: string) => void;
  clearPacketLog: () => void;

  runTransmissions: (transmissions: Transmission[]) => void;
  addArpEntries: (learned: { deviceId: string; entry: ArpEntry }[]) => void;
  selectPacket: (packetId: string | null) => void;
  clearPackets: () => void;
}

function makeConnection(topology: Topology, deviceId1: string, deviceId2: string): Connection | null {
  if (deviceId1 === deviceId2) return null;

  const alreadyConnected = topology.connections.some(
    c =>
      (c.deviceId1 === deviceId1 && c.deviceId2 === deviceId2) ||
      (c.deviceId1 === deviceId2 && c.deviceId2 === deviceId1)
  );
  if (alreadyConnected) return null;

  const usedInterfaces = (deviceId: string) =>
    topology.connections
      .filter(c => c.deviceId1 === deviceId || c.deviceId2 === deviceId)
      .map(c => (c.deviceId1 === deviceId ? c.interfaceId1 : c.interfaceId2));

  const dev1 = topology.devices.find(d => d.id === deviceId1);
  const dev2 = topology.devices.find(d => d.id === deviceId2);
  if (!dev1 || !dev2) return null;

  const iface1 = dev1.interfaces.find(i => !usedInterfaces(deviceId1).includes(i.id));
  const iface2 = dev2.interfaces.find(i => !usedInterfaces(deviceId2).includes(i.id));
  if (!iface1 || !iface2) return null;

  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    deviceId1,
    interfaceId1: iface1.id,
    deviceId2,
    interfaceId2: iface2.id,
    type: 'ethernet',
    status: 'connected',
    bandwidth: 100,
    latency: 1,
  };
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
  topology: createDefaultTopology(),
  selectedDeviceId: null,
  selectedConnectionId: null,
  connectingFromId: null,
  packetLog: [],
  arpTables: {},
  packets: [],
  selectedPacketId: null,
  animations: [],

  loadTopology: (topology) =>
    set({
      topology,
      selectedDeviceId: null,
      selectedConnectionId: null,
      connectingFromId: null,
      arpTables: {},
      packets: [],
      selectedPacketId: null,
      animations: [],
    }),

  resetTopology: () =>
    set({
      topology: createDefaultTopology(),
      selectedDeviceId: null,
      selectedConnectionId: null,
      connectingFromId: null,
      packetLog: [],
      arpTables: {},
      packets: [],
      selectedPacketId: null,
      animations: [],
    }),

  addDevice: (type, position) => {
    const { topology } = get();
    const index = topology.devices.length + 1;
    const name = nextDeviceName(type, topology.devices);
    const device: Device = {
      id: `dev-${type}-${Date.now()}`,
      type,
      name,
      position,
      interfaces: createInterfaces(type, index),
      config: { hostname: name, routes: [] },
    };
    set({
      topology: { ...topology, devices: [...topology.devices, device] },
      selectedDeviceId: device.id,
      selectedConnectionId: null,
      connectingFromId: null,
    });
  },

  removeDevice: (deviceId) => {
    const { topology, arpTables } = get();
    const nextArp = { ...arpTables };
    delete nextArp[deviceId];
    set({
      topology: {
        ...topology,
        devices: topology.devices.filter(d => d.id !== deviceId),
        connections: topology.connections.filter(
          c => c.deviceId1 !== deviceId && c.deviceId2 !== deviceId
        ),
      },
      arpTables: nextArp,
      selectedDeviceId: null,
      connectingFromId: null,
    });
  },

  moveDevice: (deviceId, x, y) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        devices: topology.devices.map(d => (d.id === deviceId ? { ...d, position: { x, y } } : d)),
      },
    });
  },

  renameDevice: (deviceId, name) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        devices: topology.devices.map(d =>
          d.id === deviceId ? { ...d, name, config: { ...d.config, hostname: name } } : d
        ),
      },
    });
  },

  selectDevice: (deviceId) => set({ selectedDeviceId: deviceId, selectedConnectionId: null }),

  selectConnection: (connectionId) =>
    set({ selectedConnectionId: connectionId, selectedDeviceId: null }),

  startConnection: (deviceId) => set({ connectingFromId: deviceId, selectedDeviceId: null, selectedConnectionId: null }),

  completeConnection: (deviceId) => {
    const { topology, connectingFromId } = get();
    if (!connectingFromId) return;
    const conn = makeConnection(topology, connectingFromId, deviceId);
    if (conn) {
      set({ topology: { ...topology, connections: [...topology.connections, conn] } });
    }
    set({ connectingFromId: null });
  },

  cancelConnection: () => set({ connectingFromId: null }),

  addConnection: (deviceId1, deviceId2) => {
    const { topology } = get();
    const conn = makeConnection(topology, deviceId1, deviceId2);
    if (conn) {
      set({ topology: { ...topology, connections: [...topology.connections, conn] } });
    }
  },

  removeConnection: (connectionId) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        connections: topology.connections.filter(c => c.id !== connectionId),
      },
      selectedConnectionId: null,
    });
  },

  updateInterface: (deviceId, interfaceId, updates) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        devices: topology.devices.map(d =>
          d.id === deviceId
            ? {
                ...d,
                interfaces: d.interfaces.map(i =>
                  i.id === interfaceId ? { ...i, ...updates } : i
                ),
              }
            : d
        ),
      },
    });
  },

  toggleInterfaceStatus: (deviceId, interfaceId) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        devices: topology.devices.map(d =>
          d.id === deviceId
            ? {
                ...d,
                interfaces: d.interfaces.map(i =>
                  i.id === interfaceId
                    ? { ...i, status: i.status === 'up' ? 'down' : 'up' }
                    : i
                ),
              }
            : d
        ),
      },
    });
  },

  updateRoutes: (deviceId, routes) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        devices: topology.devices.map(d =>
          d.id === deviceId
            ? { ...d, config: { ...d.config, routes } }
            : d
        ),
      },
    });
  },

  logPacket: (from, to, type) =>
    set(state => ({
      packetLog: [
        { id: `pkt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`, from, to, type, timestamp: Date.now() },
        ...state.packetLog,
      ].slice(0, 50),
    })),

  clearPacketLog: () => set({ packetLog: [] }),

  runTransmissions: (transmissions) => {
    if (transmissions.length === 0) return;
    const newPackets = transmissions.map(t => t.packet);
    const animations: ActiveAnimation[] = transmissions.map((t, i) => ({
      id: `anim-${t.packet.id}`,
      packet: t.packet,
      points: t.points,
      duration: 900 + Math.max(0, t.points.length - 2) * 160,
      delay: i * 450,
      startedAt: performance.now(),
    }));
    set(state => ({
      packets: [...newPackets, ...state.packets].slice(0, 50),
      selectedPacketId: state.selectedPacketId ?? newPackets[newPackets.length - 1]?.id ?? null,
      animations: [...state.animations, ...animations],
    }));

    const total = Math.max(...animations.map(a => a.delay + a.duration)) + 300;
    setTimeout(() => {
      set(state => ({
        animations: state.animations.filter(a => !animations.some(na => na.id === a.id)),
      }));
    }, total);
  },

  addArpEntries: (learned) => {
    if (learned.length === 0) return;
    set(state => {
      const arpTables = { ...state.arpTables };
      for (const { deviceId, entry } of learned) {
        const existing = arpTables[deviceId] ?? [];
        const filtered = existing.filter(e => e.ip !== entry.ip);
        arpTables[deviceId] = [...filtered, entry];
      }
      return { arpTables };
    });
  },

  selectPacket: (packetId) => set({ selectedPacketId: packetId }),

  clearPackets: () => set({ packets: [], animations: [], selectedPacketId: null }),
    }),
    {
      name: 'netlab-simulator',
      partialize: state => ({ topology: state.topology }),
    }
  )
);