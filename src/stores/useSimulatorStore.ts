import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, Connection, Topology, DeviceType, NetworkInterface, SimulatedPacket, Route } from '../types';
import { generateMac } from '../utils/ip';
import type { ArpEntry } from '../engine/protocols/arp';
import type { Transmission } from '../engine/simulation/network';
import { normalizeTopology } from '../engine/lab';

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
  core: 'Núcleo de Rede',
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
  core: 'CORE',
};

const INTERFACE_COUNT: Record<DeviceType, number> = {
  pc: 1,
  server: 1,
  switch: 8,
  router: 4,
  access_point: 1,
  firewall: 2,
  printer: 1,
  ip_camera: 1,
  ip_phone: 1,
  cloud: 1,
  core: 6,
};

function createInterfaces(type: DeviceType, deviceIndex: number): NetworkInterface[] {
  const count = INTERFACE_COUNT[type];
  const base: NetworkInterface[] = Array.from({ length: count }, (_, i) => ({
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
  }));

  if (type === 'router' || type === 'access_point') {
    base.push({
      id: 'wlan0',
      name: 'WiFi',
      type: 'wireless' as const,
      mac: generateMac(),
      status: 'up' as const,
      speed: 150,
      ip: undefined as string | undefined,
      subnetMask: undefined as string | undefined,
      gateway: undefined as string | undefined,
      dns: undefined as string | undefined,
    });
  }

  return base.map((iface, i) => ({
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
    blocks: [],
  };
}

interface SimulatorState {
  topology: Topology;
  selectedDeviceIds: string[];
  selectedConnectionId: string | null;
  selectedBlockIds: string[];
  connectingFromId: string | null;
  connectType: 'ethernet' | 'wireless' | null;
  copiedDeviceId: string | null;
  packetLog: { id: string; from: string; to: string; type: string; timestamp: number }[];
  arpTables: Record<string, ArpEntry[]>;
  packets: SimulatedPacket[];
  selectedPacketId: string | null;
  animations: ActiveAnimation[];

  // Undo/Redo
  undoStack: Topology[];
  redoStack: Topology[];
  undo: () => void;
  redo: () => void;

  // Validation results per device
  deviceValidation: Record<string, 'pass' | 'fail'>;
  setDeviceValidation: (results: Record<string, 'pass' | 'fail'>) => void;

  loadTopology: (topology: Topology) => void;
  resetTopology: () => void;
  addDevice: (type: DeviceType, position: { x: number; y: number }) => void;
  removeDevice: (deviceId: string) => void;
  removeSelection: (deviceIds: string[], blockIds: string[]) => void;
  moveDevice: (deviceId: string, x: number, y: number) => void;
  commitMove: (previous: Topology) => void;
  renameDevice: (deviceId: string, name: string) => void;
  explodeTopology: () => void;
  copyDevice: (deviceId: string) => void;
  pasteDevice: (position?: { x: number; y: number }) => void;
  clearCopiedDevice: () => void;

  selectDevice: (deviceId: string | null) => void;
  selectConnection: (connectionId: string | null) => void;
  selectBlock: (blockId: string | null) => void;
  setSelection: (deviceIds: string[], blockIds: string[]) => void;

  startConnection: (deviceId: string, type?: 'ethernet' | 'wireless') => void;
  completeConnection: (deviceId: string) => void;
  cancelConnection: () => void;
  addConnection: (deviceId1: string, deviceId2: string) => void;
  removeConnection: (connectionId: string) => void;

  addBlock: (block: { name: string; x: number; y: number; width: number; height: number }) => void;
  removeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, x: number, y: number) => void;
  resizeBlock: (blockId: string, x: number, y: number, width: number, height: number) => void;

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

const MAX_UNDO = 30;

function pushUndo(topology: Topology, undoStack: Topology[]): Topology[] {
  const next = [...undoStack, topology];
  return next.length > MAX_UNDO ? next.slice(next.length - MAX_UNDO) : next;
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

  const iface1 = dev1.interfaces.find(i => i.type !== 'wireless' && !usedInterfaces(deviceId1).includes(i.id));
  const iface2 = dev2.interfaces.find(i => i.type !== 'wireless' && !usedInterfaces(deviceId2).includes(i.id));
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

function makeWifiConnection(topology: Topology, deviceId1: string, deviceId2: string): Connection | null {
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

  const provider = dev1.type === 'router' || dev1.type === 'access_point'
    ? dev1
    : dev2.type === 'router' || dev2.type === 'access_point'
      ? dev2
      : null;
  if (!provider) return null;
  const isProviderFirst = provider.id === dev1.id;
  const client = isProviderFirst ? dev2 : dev1;
  if (client.type === 'router' || client.type === 'access_point') return null;

  // O rádio (wlan0) é compartilhado: comporta vários clientes sem fio ao mesmo tempo.
  const wlan = provider.interfaces.find(i => i.type === 'wireless');
  const otherIface = client.interfaces.find(i => i.type !== 'wireless' && !usedInterfaces(client.id).includes(i.id));
  if (!wlan || !otherIface) return null;

  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    deviceId1,
    interfaceId1: isProviderFirst ? wlan.id : otherIface.id,
    deviceId2,
    interfaceId2: isProviderFirst ? otherIface.id : wlan.id,
    type: 'wireless',
    status: 'connected',
    bandwidth: wlan.speed ?? 150,
    latency: 5,
  };
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set, get) => ({
  topology: createDefaultTopology(),
  selectedDeviceIds: [],
  selectedConnectionId: null,
  selectedBlockIds: [],
  connectingFromId: null,
  connectType: null,
  copiedDeviceId: null,
  packetLog: [],
  arpTables: {},
  packets: [],
  selectedPacketId: null,
  animations: [],
  undoStack: [],
  redoStack: [],
  deviceValidation: {},

  loadTopology: (topology) =>
    set({
topology: normalizeTopology(topology),
      selectedDeviceIds: [],
      selectedConnectionId: null,
      selectedBlockIds: [],
      connectingFromId: null,
      connectType: null,
      arpTables: {},
      packets: [],
      selectedPacketId: null,
      animations: [],
      undoStack: [],
      redoStack: [],
      deviceValidation: {},
    }),

  resetTopology: () =>
    set({
topology: createDefaultTopology(),
      selectedDeviceIds: [],
      selectedConnectionId: null,
      selectedBlockIds: [],
      connectingFromId: null,
      connectType: null,
      packetLog: [],
      arpTables: {},
      packets: [],
      selectedPacketId: null,
      animations: [],
      undoStack: [],
      redoStack: [],
      deviceValidation: {},
    }),

  addDevice: (type, position) => {
    const { topology, undoStack } = get();
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
      selectedDeviceIds: [device.id],
      selectedBlockIds: [],
      selectedConnectionId: null,
      connectingFromId: null,
      connectType: null,
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  removeDevice: (deviceId) => {
    const { topology, arpTables, undoStack } = get();
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
      selectedDeviceIds: [],
      selectedBlockIds: [],
      connectingFromId: null,
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
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

  commitMove: (previous) => {
    const { undoStack } = get();
    set({ undoStack: pushUndo(previous, undoStack), redoStack: [] });
  },

  removeSelection: (deviceIds, blockIds) => {
    const { topology, arpTables, undoStack } = get();
    const nextArp = { ...arpTables };
    deviceIds.forEach(id => delete nextArp[id]);
    set({
      topology: {
        ...topology,
        devices: topology.devices.filter(d => !deviceIds.includes(d.id)),
        blocks: (topology.blocks ?? []).filter(b => !blockIds.includes(b.id)),
        connections: topology.connections.filter(
          c => !deviceIds.includes(c.deviceId1) && !deviceIds.includes(c.deviceId2)
        ),
      },
      arpTables: nextArp,
      selectedDeviceIds: [],
      selectedBlockIds: [],
      connectingFromId: null,
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  renameDevice: (deviceId, name) => {
    const { topology, undoStack } = get();
    set({
      topology: {
        ...topology,
        devices: topology.devices.map(d =>
          d.id === deviceId ? { ...d, name, config: { ...d.config, hostname: name } } : d
        ),
      },
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  explodeTopology: () => {
    const { topology } = get();
    const devices = topology.devices;
    if (devices.length === 0) return;

    const spacingX = 200;
    const spacingY = 180;
    const cols = devices.length <= 1 ? 1 : Math.ceil(Math.sqrt(devices.length));
    const rows = Math.ceil(devices.length / cols);

    const centerX = devices.reduce((s, d) => s + d.position.x, 0) / devices.length;
    const centerY = devices.reduce((s, d) => s + d.position.y, 0) / devices.length;

    const startX = centerX - ((cols - 1) * spacingX) / 2;
    const startY = centerY - ((rows - 1) * spacingY) / 2;

    set({
      topology: {
        ...topology,
        devices: devices.map((d, i) => ({
          ...d,
          position: {
            x: startX + (i % cols) * spacingX,
            y: startY + Math.floor(i / cols) * spacingY,
          },
        })),
      },
    });
  },

  copyDevice: (deviceId) => set({ copiedDeviceId: deviceId }),

  pasteDevice: (position) => {
    const { topology, copiedDeviceId, undoStack } = get();
    if (!copiedDeviceId) return;
    const source = topology.devices.find(d => d.id === copiedDeviceId);
    if (!source) return;

    const index = topology.devices.length + 1;
    const name = nextDeviceName(source.type, topology.devices);
    const device: Device = {
      id: `dev-${source.type}-${Date.now()}`,
      type: source.type,
      name,
      position: position ?? { x: source.position.x + 60, y: source.position.y + 60 },
      interfaces: source.interfaces.map(iface => ({
        ...iface,
        id: `${iface.id}-copy-${Date.now()}`,
        mac: `AA:BB:CC:${index.toString(16).padStart(2, '0').toUpperCase()}:${(iface.id === 'wlan0' ? 5 : 1).toString(16).padStart(2, '0').toUpperCase()}:00`,
      })),
      config: {
        hostname: name,
        routes: source.config.routes.map(route => ({ ...route })),
      },
    };
    set({
      topology: { ...topology, devices: [...topology.devices, device] },
      selectedDeviceIds: [device.id],
      selectedBlockIds: [],
      selectedConnectionId: null,
      connectingFromId: null,
      connectType: null,
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  clearCopiedDevice: () => set({ copiedDeviceId: null }),

  selectDevice: (deviceId) => set({ selectedDeviceIds: deviceId ? [deviceId] : [], selectedBlockIds: [], selectedConnectionId: null }),

  selectConnection: (connectionId) =>
    set({ selectedConnectionId: connectionId, selectedDeviceIds: [], selectedBlockIds: [] }),

  selectBlock: (blockId) =>
    set({ selectedBlockIds: blockId ? [blockId] : [], selectedDeviceIds: [], selectedConnectionId: null }),

  setSelection: (deviceIds, blockIds) =>
    set({ selectedDeviceIds: deviceIds, selectedBlockIds: blockIds, selectedConnectionId: null }),

  startConnection: (deviceId, type = 'ethernet') =>
    set({ connectingFromId: deviceId, connectType: type, selectedDeviceIds: [], selectedConnectionId: null }),

  completeConnection: (deviceId) => {
    const { topology, connectingFromId, connectType, undoStack } = get();
    if (!connectingFromId) return;
    const conn = connectType === 'wireless'
      ? makeWifiConnection(topology, connectingFromId, deviceId)
      : makeConnection(topology, connectingFromId, deviceId);
    if (conn) {
      set({ topology: { ...topology, connections: [...topology.connections, conn] }, undoStack: pushUndo(topology, undoStack), redoStack: [] });
    }
    set({ connectingFromId: null, connectType: null });
  },

  cancelConnection: () => set({ connectingFromId: null, connectType: null }),

  addConnection: (deviceId1, deviceId2) => {
    const { topology } = get();
    const conn = makeConnection(topology, deviceId1, deviceId2);
    if (conn) {
      set({ topology: { ...topology, connections: [...topology.connections, conn] } });
    }
  },

  removeConnection: (connectionId) => {
    const { topology, undoStack } = get();
    set({
      topology: {
        ...topology,
        connections: topology.connections.filter(c => c.id !== connectionId),
      },
      selectedConnectionId: null,
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  addBlock: (block) => {
    const { topology, undoStack } = get();
    const id = `block-${Date.now()}`;
    set({
      topology: {
        ...topology,
        blocks: [...(topology.blocks ?? []), { id, ...block }],
      },
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  removeBlock: (blockId) => {
    const { topology, undoStack } = get();
    set({
      topology: {
        ...topology,
        blocks: (topology.blocks ?? []).filter(b => b.id !== blockId),
      },
      selectedBlockIds: [],
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  moveBlock: (blockId, x, y) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        blocks: (topology.blocks ?? []).map(b =>
          b.id === blockId ? { ...b, x, y } : b
        ),
      },
    });
  },

  resizeBlock: (blockId, x, y, width, height) => {
    const { topology } = get();
    set({
      topology: {
        ...topology,
        blocks: (topology.blocks ?? []).map(b =>
          b.id === blockId ? { ...b, x, y, width, height } : b
        ),
      },
    });
  },

  updateInterface: (deviceId, interfaceId, updates) => {
    const { topology, undoStack } = get();
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
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  toggleInterfaceStatus: (deviceId, interfaceId) => {
    const { topology, undoStack } = get();
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
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
    });
  },

  updateRoutes: (deviceId, routes) => {
    const { topology, undoStack } = get();
    set({
      topology: {
        ...topology,
        devices: topology.devices.map(d =>
          d.id === deviceId
            ? { ...d, config: { ...d.config, routes } }
            : d
        ),
      },
      undoStack: pushUndo(topology, undoStack),
      redoStack: [],
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

  undo: () => {
    const { undoStack, topology, redoStack } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...redoStack, topology],
      topology: prev,
      selectedDeviceIds: [],
      selectedBlockIds: [],
      selectedConnectionId: null,
      deviceValidation: {},
    });
  },

  redo: () => {
    const { redoStack, topology, undoStack } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...undoStack, topology],
      topology: next,
      selectedDeviceIds: [],
      selectedBlockIds: [],
      selectedConnectionId: null,
      deviceValidation: {},
    });
  },

  setDeviceValidation: (results) => set({ deviceValidation: results }),

  selectPacket: (packetId) => set({ selectedPacketId: packetId }),

  clearPackets: () => set({ packets: [], animations: [], selectedPacketId: null }),
    }),
    {
      name: 'netlab-simulator',
      partialize: state => ({ topology: state.topology }),
      merge: (persisted: unknown, current: ReturnType<typeof useSimulatorStore.getState>) => ({
        ...current,
        ...(persisted as Record<string, unknown>),
        topology: normalizeTopology((persisted as { topology: ReturnType<typeof useSimulatorStore.getState>['topology'] })?.topology ?? current.topology),
      }),
    }
  )
);