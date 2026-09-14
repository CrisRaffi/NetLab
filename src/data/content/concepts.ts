export const CONCEPT_DEFINITIONS: Record<string, { name: string; level: number; prerequisites: string[] }> = {
  'networking-basics': {
    name: 'O que é uma rede',
    level: 1,
    prerequisites: [],
  },
  'lan-wan': {
    name: 'LAN / WAN',
    level: 1,
    prerequisites: ['networking-basics'],
  },
  'network-devices': {
    name: 'Dispositivos de Rede',
    level: 1,
    prerequisites: ['networking-basics'],
  },
  'topologies': {
    name: 'Topologias',
    level: 1,
    prerequisites: ['networking-basics'],
  },
  'ethernet-basics': {
    name: 'Ethernet',
    level: 1,
    prerequisites: ['topologies'],
  },
  'client-server': {
    name: 'Cliente/Servidor',
    level: 1,
    prerequisites: ['network-devices'],
  },
  'osi-model': {
    name: 'Modelo OSI',
    level: 2,
    prerequisites: ['ethernet-basics'],
  },
  'tcp-ip-model': {
    name: 'Modelo TCP/IP',
    level: 2,
    prerequisites: ['osi-model'],
  },
  'encapsulation': {
    name: 'Encapsulamento',
    level: 2,
    prerequisites: ['osi-model'],
  },
  'mac-address': {
    name: 'Endereço MAC',
    level: 3,
    prerequisites: ['ethernet-basics'],
  },
  'switch-operations': {
    name: 'Como o Switch funciona',
    level: 3,
    prerequisites: ['mac-address'],
  },
  'arp': {
    name: 'ARP',
    level: 3,
    prerequisites: ['mac-address', 'ipv4-basics'],
  },
  'frames': {
    name: 'Frames Ethernet',
    level: 3,
    prerequisites: ['mac-address'],
  },
  'ipv4-basics': {
    name: 'Endereço IPv4',
    level: 4,
    prerequisites: ['tcp-ip-model'],
  },
  'subnet-mask': {
    name: 'Máscara de Sub-rede',
    level: 4,
    prerequisites: ['ipv4-basics'],
  },
  'gateway': {
    name: 'Gateway',
    level: 4,
    prerequisites: ['ipv4-basics'],
  },
  'broadcast': {
    name: 'Broadcast',
    level: 4,
    prerequisites: ['subnet-mask'],
  },
  'subnetting': {
    name: 'Subnetting',
    level: 5,
    prerequisites: ['subnet-mask', 'broadcast'],
  },
  'cidr': {
    name: 'Notação CIDR',
    level: 5,
    prerequisites: ['subnet-mask'],
  },
  'host-calculation': {
    name: 'Cálculo de Hosts',
    level: 5,
    prerequisites: ['subnetting'],
  },
  'dhcp': {
    name: 'DHCP',
    level: 6,
    prerequisites: ['ipv4-basics'],
  },
  'dns': {
    name: 'DNS',
    level: 6,
    prerequisites: ['ipv4-basics'],
  },
  'routing-basics': {
    name: 'Roteamento Básico',
    level: 6,
    prerequisites: ['gateway'],
  },
};

export const CONCEPT_ORDER = [
  'networking-basics',
  'lan-wan',
  'network-devices',
  'topologies',
  'ethernet-basics',
  'client-server',
  'osi-model',
  'tcp-ip-model',
  'encapsulation',
  'mac-address',
  'switch-operations',
  'arp',
  'frames',
  'ipv4-basics',
  'subnet-mask',
  'gateway',
  'broadcast',
  'subnetting',
  'cidr',
  'host-calculation',
  'dhcp',
  'dns',
  'routing-basics',
];