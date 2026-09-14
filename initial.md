# INITIAL.md — Documento de Inicialização do Projeto

## Nome do Projeto

**NetLab** — Laboratório Virtual de Redes de Computadores

---

## 1. Visão do Produto

NetLab é uma plataforma web interativa para aprendizado prático de Redes de Computadores. Diferente de plataformas tradicionais de cursos, NetLab é um laboratório virtual onde o estudante aprende experimentando, construindo, quebrando e consertando redes.

### Proposta de Valor

> "Aprenda porque precisa resolver um problema."

O aluno não memoriza conceitos — ele os descobre ao resolver situações reais de TI.

### Combinação de Conceitos

```
Packet Tracer (simulação visual)
       +
Laboratório de Redes (exercícios práticos)
       +
Plataforma de exercícios (progressão gamificada)
       +
Troubleshooting Simulator (diagnóstico de problemas)
       +
Professor particular (explicações adaptativas)
```

---

## 2. Objetivos

### Curto Prazo (MVP)

- Plataforma funcional com dashboard, simulador básico e 10 laboratórios.
- Capacidade de montar topologias simples (PC, Switch, Router).
- Configuração IPv4, ping, terminal virtual.
- Visualização de pacotes.
- Sistema de dicas e progresso.

### Médio Prazo

- Troubleshooting com problemas aleatórios.
- Subnetting interativo.
- DHCP, DNS, VLAN.
- Modo prova.
- Modo livre (Packet Tracer simplificado).

### Longo Prazo

- Integração com IA tutor.
- Modo empresa.
- Ranking e competições.
- Repetição espaçada.
- Exportação de documentação.
- Deploy web com contas de usuário.

---

## 3. Arquitetura Proposta

### 3.1 Visão Geral

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│  React + TypeScript + Vite                          │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ Dashboard │ │Simulator │ │ Terminal │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │Topology  │ │ Packet   │ │Exercise  │           │
│  │ Canvas   │ │Inspector │ │ Engine   │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  ┌──────────────────────────────────────┐          │
│  │         Network Engine (client)      │          │
│  │  IPv4 · ARP · ICMP · Routing · VLAN │          │
│  └──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
                      │
                      │ API REST (futuro: WebSocket)
                      │
┌─────────────────────────────────────────────────────┐
│                    BACKEND                          │
│  Node.js + TypeScript                               │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │   API    │ │Exercise  │ │ Progress │           │
│  │  Routes  │ │  Bank    │ │ Service  │           │
│  └──────────┘ └──────────┘ └──────────┘           │
│                                                     │
│  ┌──────────────────────────────────────┐          │
│  │         Database (SQLite)            │          │
│  └──────────────────────────────────────┘          │
└─────────────────────────────────────────────────────┘
```

### 3.2 Módulos do Frontend

#### Network Engine (Client-side)

Motor de simulação de rede que roda no browser. Responsável por:

- Simulação de dispositivos (PC, Switch, Router, Server).
- Processo de configuração (IP, máscara, gateway, etc).
- Resolução ARP.
- Envio/recebimento de pacotes ICMP.
- Tabela de roteamento.
- Validação de conectividade.

**Por que client-side?**

- Sem necessidade de backend para simulações básicas.
- Resposta instantânea.
- Funciona offline.
- Mais simples de depurar.

#### Topology Canvas

Renderização visual da topologia de rede. Componentes:

- SVG Canvas (React + SVG nativo).
- Dispositivos como componentes SVG interativos.
- Conexões como linhas/curvas SVG.
- Estado visual das conexões.
- Drag & drop.
- Zoom/Pan.

**Por que SVG e não Canvas?**

- Componentes React = acessibilidade.
- Interatividade nativa (click, hover).
- Mais fácil de estilizar.
- Funciona bem para topologias de até ~50 dispositivos.

#### Exercise Engine

Motor de exercícios que:

- Carrega cenários pré-definidos.
- Valida ações do aluno.
- Verifica soluções.
- Gerencia dicas.
- Registra progresso.

#### Terminal Virtual

Simulador de terminal que:

- Interpreta comandos simulados.
- Mantém estado do dispositivo.
- Oferece autocomplete.
- Histórico de comandos.

### 3.3 Módulos do Backend

#### API Routes

Endpoints REST:

```
GET    /api/exercises          - Listar exercícios
GET    /api/exercises/:id      - Buscar exercício
POST   /api/exercises/:id/submit - Submeter solução
GET    /api/progress           - Buscar progresso
POST   /api/progress           - Atualizar progresso
GET    /api/labs               - Listar laboratórios
GET    /api/labs/:id           - Buscar laboratório
```

#### Exercise Bank

Banco de exercícios estruturados em JSON.

#### Progress Service

Serviços de progresso, XP, conquistas.

---

## 4. Stack Tecnológica

### Frontend

| Tecnologia | Uso | Justificativa |
|---|---|---|
| React 18+ | Framework UI | Ecossistema maduro, componentes |
| TypeScript 5+ | Tipagem | Segurança, DX |
| Vite | Build tool | Rápido, HMR excelente |
| Zustand | State management | Simples, leve, sem boilerplate |
| Tailwind CSS | Estilos | Produtividade, consistência |
| React Router | Navegação | Padrão da indústria |
| Lucide React | Ícones | Leve, consistente |

### Backend

| Tecnologia | Uso | Justificativa |
|---|---|---|
| Node.js 20+ | Runtime | JavaScript no server |
| TypeScript 5+ | Tipagem | Consistência com frontend |
| Express ou Hono | HTTP server | Simples, flexível |
| Drizzle ORM | Database ORM | Leve, type-safe |
| SQLite | Database | Simples, local, zero config |
| better-sqlite3 | SQLite driver | Performático, síncrono |

### Futuro

| Tecnologia | Uso | Quando |
|---|---|---|
| PostgreSQL | Database | Deploy production |
| WebSocket | Simulação tempo real | Multiplayer |
| Redis | Cache/sessão | Deploy production |
| JWT | Autenticação | Contas de usuário |

---

## 5. Estrutura de Diretórios

```
netlab/
├── agent.md
├── initial.md
├── prompt-patterns.md
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── index.html
│
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Layout.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ProgressCard.tsx
│   │   │   ├── StatsCard.tsx
│   │   │   └── RecentActivity.tsx
│   │   │
│   │   ├── simulator/
│   │   │   ├── SimulatorView.tsx
│   │   │   ├── TopologyCanvas.tsx
│   │   │   ├── DevicePalette.tsx
│   │   │   ├── DeviceNode.tsx
│   │   │   ├── ConnectionLine.tsx
│   │   │   ├── PropertyPanel.tsx
│   │   │   └── PacketVisualization.tsx
│   │   │
│   │   ├── terminal/
│   │   │   ├── Terminal.tsx
│   │   │   ├── TerminalInput.tsx
│   │   │   └── TerminalOutput.tsx
│   │   │
│   │   ├── exercise/
│   │   │   ├── ExerciseView.tsx
│   │   │   ├── HintSystem.tsx
│   │   │   ├── SolutionView.tsx
│   │   │   └── ValidationFeedback.tsx
│   │   │
│   │   └── common/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── Modal.tsx
│   │       └── Tooltip.tsx
│   │
│   ├── engine/
│   │   ├── types/
│   │   │   ├── device.ts
│   │   │   ├── network.ts
│   │   │   ├── packet.ts
│   │   │   └── exercise.ts
│   │   │
│   │   ├── devices/
│   │   │   ├── DeviceFactory.ts
│   │   │   ├── PC.ts
│   │   │   ├── Switch.ts
│   │   │   ├── Router.ts
│   │   │   └── Server.ts
│   │   │
│   │   ├── protocols/
│   │   │   ├── IPv4.ts
│   │   │   ├── ARP.ts
│   │   │   ├── ICMP.ts
│   │   │   └── Ethernet.ts
│   │   │
│   │   ├── simulation/
│   │   │   ├── NetworkSimulator.ts
│   │   │   ├── PacketTracer.ts
│   │   │   └── ConnectivityChecker.ts
│   │   │
│   │   └── commands/
│   │       ├── CommandParser.ts
│   │       ├── IPConfig.ts
│   │       ├── Ping.ts
│   │       ├── Tracert.ts
│   │       ├── ARP.ts
│   │       ├── Route.ts
│   │       └── NSLookup.ts
│   │
│   ├── stores/
│   │   ├── useSimulatorStore.ts
│   │   ├── useExerciseStore.ts
│   │   ├── useTerminalStore.ts
│   │   └── useProgressStore.ts
│   │
│   ├── data/
│   │   ├── exercises/
│   │   │   ├── lab-01-first-network.json
│   │   │   ├── lab-02-different-subnets.json
│   │   │   └── ...
│   │   │
│   │   ├── topology/
│   │   │   └── device-templates.ts
│   │   │
│   │   └── content/
│   │       └── explanations.ts
│   │
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── SimulatorPage.tsx
│   │   ├── LabsPage.tsx
│   │   ├── LabViewPage.tsx
│   │   ├── LearningMapPage.tsx
│   │   └── FreeModePage.tsx
│   │
│   └── utils/
│       ├── ip.ts
│       ├── subnet.ts
│       ├── mac.ts
│       └── validation.ts
│
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── exercises.ts
│   │   │   ├── progress.ts
│   │   │   └── labs.ts
│   │   │
│   │   ├── services/
│   │   │   ├── ExerciseService.ts
│   │   │   └── ProgressService.ts
│   │   │
│   │   ├── database/
│   │   │   ├── schema.ts
│   │   │   └── connection.ts
│   │   │
│   │   └── types/
│   │       └── api.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── shared/
│   └── types/
│       ├── exercise.ts
│       ├── device.ts
│       └── progress.ts
│
└── docs/
    ├── architecture.md
    └── api.md
```

---

## 6. Modelo de Dados

### 6.1 Dispositivo

```typescript
type DeviceType = 'pc' | 'server' | 'switch' | 'router' | 'access_point' | 'firewall' | 'printer' | 'ip_camera' | 'ip_phone' | 'cloud';

interface Device {
  id: string;
  type: DeviceType;
  name: string;
  position: { x: number; y: number };
  interfaces: NetworkInterface[];
  config: DeviceConfig;
}

interface NetworkInterface {
  id: string;
  name: string; // "eth0", "eth1", "FastEthernet0/1"
  type: 'ethernet' | 'wireless' | 'serial';
  mac: string;
  ip?: string;
  subnetMask?: string;
  gateway?: string;
  dns?: string;
  vlan?: number;
  status: 'up' | 'down';
  speed: number; // Mbps
}

interface DeviceConfig {
  hostname: string;
  routes: Route[];
  dhcp?: DHCPConfig;
  dns?: DNSConfig;
  firewall?: FirewallConfig;
  vlans?: VLANConfig[];
}

interface Route {
  destination: string;
  gateway: string;
  mask: string;
  metric: number;
  interface: string;
}
```

### 6.2 Conexão

```typescript
interface Connection {
  id: string;
  deviceId1: string;
  interfaceId1: string;
  deviceId2: string;
  interfaceId2: string;
  type: 'ethernet' | 'crossover' | 'fiber' | 'wireless';
  status: 'connected' | 'disconnected' | 'negotiating';
  bandwidth: number; // Mbps
  latency: number; // ms
}
```

### 6.3 Topologia

```typescript
interface Topology {
  id: string;
  name: string;
  devices: Device[];
  connections: Connection[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    author?: string;
  };
}
```

### 6.4 Exercício

```typescript
interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'troubleshooting' | 'configuration' | 'design' | 'theory' | 'subnetting';
  concepts: string[];
  prerequisites: string[];
  lab: {
    initialTopology: Topology;
    problem?: {
      description: string;
      symptoms: string[];
    };
    objective: string;
    steps?: LabStep[];
  };
  hints: Hint[];
  solution: Solution;
  validation: ValidationCriteria;
  xpReward: number;
  estimatedTime: number; // minutes
}

interface LabStep {
  order: number;
  description: string;
  action: StepAction;
  validation: StepValidation;
}

interface Hint {
  level: 1 | 2 | 3;
  text: string;
  revealSolution: boolean;
}

interface Solution {
  explanation: string;
  steps: string[];
  commands?: string[];
}

interface ValidationCriteria {
  type: 'automatic' | 'manual' | 'hybrid';
  checks: ValidationCheck[];
}

interface ValidationCheck {
  type: 'connectivity' | 'config' | 'command_output' | 'topology';
  target?: string;
  expected: unknown;
  description: string;
}
```

### 6.5 Progresso do Usuário

```typescript
interface UserProgress {
  userId: string;
  xp: number;
  level: number;
  concepts: ConceptProgress[];
  completedExercises: string[];
  completedLabs: string[];
  achievements: Achievement[];
  stats: {
    totalTime: number;
    exercisesAttempted: number;
    exercisesCompleted: number;
    averageScore: number;
    streakDays: number;
  };
  lastActivity: string;
}

interface ConceptProgress {
  conceptId: string;
  mastery: number; // 0-100
  attempts: number;
  lastPracticed: string;
  nextReview: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  xpReward: number;
}
```

### 6.6 Pacote Simulado

```typescript
interface Packet {
  id: string;
  type: 'icmp' | 'arp' | 'tcp' | 'udp' | 'dns' | 'dhcp';
  source: {
    mac: string;
    ip: string;
    port?: number;
  };
  destination: {
    mac: string;
    ip: string;
    port?: number;
  };
  payload: unknown;
  ttl: number;
  timestamp: number;
  layers: PacketLayer[];
}

interface PacketLayer {
  name: string;
  protocol: string;
  fields: Record<string, string>;
}
```

---

## 7. Arquitetura do Simulador

### 7.1 Ciclo de Simulação

```
┌─────────────────────────────────────────────┐
│              UTILIZADOR                      │
│  (adiciona dispositivo, configura, ping)     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│           TOPOLOGY CANVAS                    │
│  (renderiza SVG, captura eventos)            │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          NETWORK SIMULATOR                   │
│  (gerencia estado da rede)                   │
│                                              │
│  ┌────────────┐  ┌────────────────────┐     │
│  │ Device Mgr │  │ Connection Mgr     │     │
│  └────────────┘  └────────────────────┘     │
│  ┌────────────┐  ┌────────────────────┐     │
│  │ ARP Table  │  │ Routing Table      │     │
│  └────────────┘  └────────────────────┘     │
│  ┌────────────┐  ┌────────────────────┐     │
│  │ Packet     │  │ Connectivity       │     │
│  │ Generator  │  │ Checker            │     │
│  └────────────┘  └────────────────────┘     │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│          PACKET TRACER                       │
│  (gera pacotes, anima fluxo)                 │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────┐
│        PACKET INSPECTOR                      │
│  (mostra camadas do pacote)                  │
└─────────────────────────────────────────────┘
```

### 7.2 Fluxo de um Ping

```
1. Utilizador digita: ping 192.168.10.20
                        │
2. Command Parser interpreta
                        │
3. Verifica se IP destino é local
   ├── SIM: verifica ARP table
   │   ├── TEM: envia ICMP Echo Request
   │   └── NÃO TEM: envia ARP Request
   │       └── Recebe ARP Reply
   │           └── envia ICMP Echo Request
   │
   └── NÃO: envia para gateway
       └── (repete lógica)
                        │
4. Packet Tracer gera pacote ICMP
                        │
5. Pacote percorre topologia:
   PC → Switch → Server
                        │
6. Server responde ICMP Echo Reply
                        │
7. Resposta retorna:
   Server → Switch → PC
                        │
8. Terminal mostra:
   Reply from 192.168.10.20: bytes=32 time=1ms TTL=128
```

### 7.3 Resolução ARP Simulada

```
PC quer enviar pacote para 192.168.10.20

1. Verifica ARP Table
   ├── 192.168.10.20 → AA:BB:CC:DD:EE:02 (TEM)
   │   └── Usa MAC diretamente
   │
   └── Não tem entrada
       ├── Cria pacote ARP Request:
       │   Source MAC: AA:BB:CC:DD:EE:01
       │   Source IP: 192.168.10.50
       │   Target MAC: FF:FF:FF:FF:FF:FF
       │   Target IP: 192.168.10.20
       │
       ├── Envia para todos (broadcast)
       │
       ├── Server recebe ARP Request
       │   └── Responde ARP Reply:
       │       Source MAC: AA:BB:CC:DD:EE:02
       │       Source IP: 192.168.10.20
       │       Target MAC: AA:BB:CC:DD:EE:01
       │       Target IP: 192.168.10.50
       │
       └── PC recebe ARP Reply
           └── Adiciona na ARP Table
               └── Envia pacote original
```

---

## 8. Arquitetura do Motor de Rede

### 8.1 Camadas do Motor

```
┌─────────────────────────────────────────┐
│         Command Layer                    │
│  (ipconfig, ping, tracert, arp, etc)     │
├─────────────────────────────────────────┤
│         Transport Layer                  │
│  (TCP, UDP - futuro)                     │
├─────────────────────────────────────────┤
│         Network Layer                    │
│  (IPv4, routing, subnetting)             │
├─────────────────────────────────────────┤
│         Link Layer                       │
│  (Ethernet, MAC, ARP, Switching)         │
├─────────────────────────────────────────┤
│         Physical Layer                   │
│  (conexões, cabos, status)               │
└─────────────────────────────────────────┘
```

### 8.2 Validação de Conectividade

```
Para verificar se PC1 pode fazer ping em PC2:

1. Verificar:
   ├── Ambos ligados? ✓/✗
   ├── Existe conexão física? ✓/✗
   ├── Interfaces UP? ✓/✗

2. Verificar endereçamento:
   ├── IPs configurados? ✓/✗
   ├── Mesma sub-rede?
   │   ├── SIM: comunicam diretamente
   │   └── NÃO: precisam de gateway
   │       ├── Gateway configurado? ✓/✗
   │       ├── Gateway acessível? ✓/✗
   │       ├── Rota existe? ✓/✗
   │       └── Roteador rota entre redes? ✓/✗

3. Verificar bloqueios:
   ├── Firewall bloqueia ICMP? ✓/✗
   ├── ACL bloqueia? ✓/✗
   └── Interface down? ✓/✗

4. Resultado:
   ├── Caminho existe → SUCESSO
   └── Caminho não existe → FALHA (com motivo)
```

### 8.3 Comandos Simulados

| Comando | O que faz | O que mostra |
|---|---|---|
| `ipconfig` | Mostra configuração IP | IP, máscara, gateway, DNS |
| `ipconfig /all` | Configuração completa | Tudo acima + MAC, DHCP |
| `ping <ip>` | Testa conectividade | Reply/Timeout com tempos |
| `tracert <ip>` | Mostra caminho | Saltos até destino |
| `arp -a` | Mostra tabela ARP | IP → MAC mapeamentos |
| `route print` | Mostra tabela de rotas | Destino, gateway, máscara |
| `nslookup <host>` | Resolve DNS | IP do hostname |
| `netstat` | Mostra conexões | Portas e estado |
| `ipconfig /release` | Libera DHCP | Remove IP |
| `ipconfig /renew` | Renova DHCP | Obtém novo IP |

---

## 9. Arquitetura dos Exercícios

### 9.1 Tipos de Exercício

#### 1. Troubleshooting

```
Cenário: Rede quebrada.
Objetivo: Encontrar e corrigir o problema.
Fluxo:
  1. Aluno vê topologia com problema.
  2. Usa comandos para investigar.
  3. Identifica causa raiz.
  4. Corrige configuração.
  5. Valida com ping/tracert.
```

#### 2. Configuration

```
Cenário: Topologia sem configurar.
Objetivo: Configurar corretamente.
Fluxo:
  1. Aluno recebe topologia.
  2. Configura IPs, máscaras, gateways.
  3. Valida conectividade.
  4. Sistema verifica configuração.
```

#### 3. Design

```
Cenário: Requisitos de negócio.
Objetivo: Projetar a rede.
Fluxo:
  1. Aluno recebe requisitos.
  2. Escolhe dispositivos.
  3. Define endereçamento.
  4. Conecta tudo.
  5. Valida funcionamento.
```

#### 4. Theory (Prático)

```
Cenário: Pergunta conceitual aplicada.
Objetivo: Entender "por que".
Fluxo:
  1. Pergunta contextualizada.
  2. Aluno experimenta.
  3. Resposta baseada em experiência.
```

#### 5. Subnetting

```
Cenário: Rede precisa ser dividida.
Objetivo: Calcular sub-redes corretas.
Fluxo:
  1. Recebe rede base.
  2. Define máscara.
  3. Sistema mostra sub-redes geradas.
  4. Valida se atende requisitos.
```

### 9.2 Sistema de Dicas

```
Nível 1 — Pista Sutil
"Que tal verificar a configuração de rede do computador?"

Nível 2 — Direcionamento
"Compare a máscara de sub-rede dos dois dispositivos.
Eles estão na mesma rede?"

Nível 3 — Quase Resolução
"O PC1 tem máscara 255.255.255.0 e IP 192.168.10.50.
O PC2 tem máscara 255.255.255.0 e IP 192.168.20.50.
Eles estão em redes diferentes. O que precisa para comunicar?"

SOLUÇÃO
"PC1 está na rede 192.168.10.0/24 e PC2 na 192.168.20.0/24.
Para comunicar, precisam de um roteador configurado como gateway
em ambos, ou precisam estar na mesma sub-rede."
```

---

## 10. Arquitetura Pedagógica

### 10.1 Ciclo de Aprendizado

```
PROBLEMA → TENTATIVA → INVESTIGAÇÃO → EXPERIMENTO → ERRO → EXPLICAÇÃO → CORREÇÃO → NOVO DESAFIO
```

### 10.2 Mapeamento Conceitual

```
FUNDAMENTOS
  ├── O que é rede
  ├── LAN / WAN
  ├── Dispositivos
  └── Topologias
       │
MODELO OSI
  ├── Camada 1 — Física
  ├── Camada 2 — Enlace
  ├── Camada 3 — Rede
  ├── Camada 4 — Transporte
  └── Camada 7 — Aplicação
       │
ETHERNET
  ├── Frames
  ├── MAC Address
  ├── Switch
  └── ARP
       │
IPv4
  ├── Endereçamento
  ├── Máscara
  ├── Gateway
  └── Broadcast
       │
SUBNETTING
  ├── CIDR
  ├── Cálculo de Redes
  └── Cálculo de Hosts
       │
SERVIÇOS
  ├── DHCP
  ├── DNS
  ├── HTTP/HTTPS
  └── FTP
       │
ROUTING
  ├── Tabela de Rotas
  ├── Rotas Estáticas
  └── OSPF (futuro)
       │
SWITCHING
  ├── VLAN
  ├── Trunk
  └── STP
       │
WIRELESS
  ├── SSID
  ├── Canais
  └── Segurança
       │
TROUBLESHOOTING
  ├── Diagnóstico
  ├── Ferramentas
  └── Casos Reais
```

### 10.3 Níveis de Progressão

| Nível | XP Necessário | Conteúdo |
|---|---|---|
| 1 | 0 | Fundamentos |
| 2 | 100 | Modelo OSI |
| 3 | 250 | Ethernet |
| 4 | 500 | IPv4 |
| 5 | 800 | Subnetting |
| 6 | 1200 | Serviços |
| 7 | 1800 | Routing |
| 8 | 2500 | Switching |
| 9 | 3500 | Wireless |
| 10 | 5000 | Troubleshooting Avançado |

### 10.4 Gamificação

#### Conquistas

```
🏆 Primeiro Ping — Complete seu primeiro ping com sucesso
🏆 Redes Iguais — Entenda sub-redes idênticas
🏆 Detective — Encontre seu primeiro bug
🏆 Subnet Master — Complete 5 exercícios de subnetting
🏆 Router Hero — Configure um roteador com sucesso
🏆 VLAN Expert — Configure VLANs corretamente
🏆 Troubleshooter — Resolva 10 problemas
🏆 Architect — Projete uma rede completa
🏆 Streak 7 — Estude 7 dias seguidos
🏆 100% — Complete todos os exercícios de um módulo
```

---

## 11. Roadmap Completo

### FASE 0 — ANÁLISE ✅ (atual)

- [x] Definir visão do produto
- [x] Definir arquitetura
- [x] Definir stack tecnológica
- [x] Definir estrutura de diretórios
- [x] Definir modelo de dados
- [x] Definir arquitetura do simulador
- [x] Definir arquitetura do motor de rede
- [x] Definir arquitetura dos exercícios
- [x] Definir arquitetura pedagógica
- [x] Definir roadmap
- [x] Identificar riscos
- [x] Criar governance files

### FASE 1 — FOUNDATION ✅ (concluída)

- [x] Inicializar projeto (Vite + React + TS)
- [x] Configurar Tailwind CSS
- [x] Configurar Zustand
- [x] Criar layout base (Sidebar + Header)
- [x] Criar componentes UI base
- [x] Criar tema dark mode
- [x] Criar rotas
- [x] Criar Dashboard com cards de progresso
- [x] Criar página de laboratórios (lista)
- [x] Criar estrutura de dados de exercícios
- [x] Criar 3 exercícios exemplo

**Entregável:** App compilando, navegação funcional, dashboard visível.

### FASE 2 — NETWORK SIMULATOR ✅ (concluída)

- [x] Criar SVG Canvas
- [x] Criar componente de dispositivo (PC, Switch, Router)
- [x] Criar paleta de dispositivos
- [x] Criar sistema de conexões
- [x] Criar painel de propriedades
- [x] Criar store do simulador
- [x] Salvar/carregar topologia

**Entregável:** Visualização de rede funcional, dispositivos arrastáveis, conexões visuais.

### FASE 3 — NETWORK ENGINE ✅ (concluída)

- [x] Implementar IPv4 (validação, classes, sub-rede)
- [x] Implementar tabela ARP
- [x] Implementar ICMP (ping)
- [x] Implementar verificação de conectividade
- [x] Implementar tabela de rotas básica
- [x] Implementar terminal virtual (ipconfig, ping, arp)
- [x] Integrar engine com canvas

**Entregável:** Ping funcional entre dispositivos, terminal operacional.

### FASE 4 — LABORATÓRIOS ✅ (concluída)

- [x] Criar sistema de exercícios completo
- [x] Criar 10 laboratórios iniciais
- [x] Implementar validação automática
- [x] Implementar sistema de dicas
- [x] Implementar sistema de progresso
- [x] Implementar XP e conquistas

**Entregável:** 10 labs completos, validação, dicas, progresso.

### FASE 5 — TROUBLESHOOTING

- [ ] Criar motor de falhas
- [ ] Implementar tipos de falha (IP, máscara, gateway, etc)
- [ ] Criar modo "Quebrei a Rede"
- [ ] Problemas aleatórios
- [ ] Sistema de diagnóstico

**Entregável:** Modo troubleshooting com problemas gerados aleatoriamente.

### FASE 6 — APRENDIZADO ADAPTATIVO

- [ ] Sistema de dificuldade adaptativa
- [ ] Revisão espaçada
- [ ] Identificação de conceitos fracos
- [ ] Exercícios de reforço
- [ ] Estatísticas detalhadas

**Entregável:** Sistema inteligente de progressão.

### FASE 7 — CONTEÚDO AVANÇADO

- [ ] VLAN
- [ ] DHCP
- [ ] DNS
- [ ] NAT
- [ ] Routing avançado
- [ ] Wireless
- [ ] ACL

**Entregável:** Plataforma com conteúdo completo.

---

## 12. Riscos Técnicos

### Risco 1: Complexidade do Motor de Simulação

**Descrição:** O motor de simulação de rede pode se tornar complexo demais.

**Mitigação:**
- Começar com cenários extremamente simples.
- Simular apenas protocolos essenciais (IPv4, ICMP, ARP).
- Não tentar simular TCP/UDP no MVP.
- Manter o motor testável e isolado.

### Risco 2: Performance do SVG Canvas

**Descrição:** Topologias grandes podem causar lentidão.

**Mitigação:**
- Limitar a ~50 dispositivos no MVP.
- Usar React.memo e otimizações.
- Lazy rendering (apenas dispositivos visíveis).
- Canvas como alternativa futura.

### Risco 3: Escopo Grand demais

**Descrição:** O projeto é enorme e pode nunca ser terminado.

**Mitigação:**
- MVP rigoroso — apenas o essencial.
- Fases claras com entregáveis.
- Não avançar de fase sem completar a anterior.
- Celebrar cada entregável.

### Risco 4: Usuário Perdido

**Descrição:** Interface complexa pode confundir iniciantes.

**Mitigação:**
- Tutorial interativo no primeiro acesso.
- Tooltips em elementos importantes.
- Guia passo a passo nos primeiros labs.
- Feedback claro em cada ação.

### Risco 5: Manutenção de Exercícios

**Descrição:** Criar e manter exercícios é trabalhoso.

**Mitigação:**
- Estrutura JSON padronizada.
- Gerador de exercícios (futuro).
- exercícios simples primeiro.
- Comunidade (futuro).

---

## 13. Decisões Pendentes

### D1: Editor de Topologia

**Pergunta:** Usar SVG puro ou uma lib como ReactFlow?

**Opções:**
- SVG puro: Mais controle, menos dependência, mais trabalho.
- ReactFlow: Mais funcionalidades prontas, dependência externa.

**Recomendação:** Começar com SVG puro. Mais controle, aprendizado, e o caso de uso é específico.

### D2: Persistência

**Pergunta:** Onde salvar o progresso do usuário no MVP?

**Opções:**
- localStorage: Simples, offline, sem backend.
- Backend + SQLite: Mais robusto, preparado para deploy.

**Recomendação:** localStorage no MVP. Backend na Fase 4+.

### D3: Terminal Virtual

**Pergunta:** xterm.js ou implementação customizada?

**Opções:**
- xterm.js: Terminal real, pesado, muitas features.
- Custom: Leve, sob controle total, menos realista.

**Recomendação:** Custom. Terminal simulado, não precisa de terminal real.

### D4: Animação de Pacotes

**Pergunta:** CSS animations ou framer-motion?

**Opções:**
- CSS: Leve, sem dependência.
- framer-motion: Mais poderoso, mais pesado.

**Recomendação:** CSS animations + requestAnimationFrame. Simples e eficiente.

---

## 14. Proposta do MVP

### O que o MVP conterá

```
✅ Dashboard com progresso
✅ Mapa de aprendizado (visual)
✅ Simulador básico
  ├── Adicionar PC, Switch, Router
  ├── Conectar dispositivos
  ├── Mover dispositivos
  ├── Remover dispositivos
✅ Configuração IPv4
  ├── IP
  ├── Máscara
  ├── Gateway
  ├── DNS
✅ Conexão entre dispositivos
✅ Ping funcional
✅ Terminal virtual
  ├── ipconfig
  ├── ping
  ├── arp
  ├── tracert
  ├── route
✅ Visualização de pacotes
  ├── ICMP (ping)
  ├── ARP
✅ Exercícios
  ├── 10 laboratórios
  ├── Sistema de dicas
  ├── Validação
✅ Progresso do aluno
  ├── XP
  ├── Conquistas
  ├── Conceitos dominados
✅ Dark mode profissional
```

### O que o MVP NÃO conterá

```
❌ Backend (API, banco de dados)
❌ Contas de usuário
❌ WebSocket
❌ DHCP, DNS, VLAN simulados
❌ Modo empresa
❌ IA tutor
❌ Repetição espaçada
❌ Ranking multiplayer
❌ Exportação PDF/PNG
❌ Mais de 10 labs
❌ Subnetting interativo avançado
❌ Modo prova
```

---

## 15. Wireframe Textual das Principais Telas

### Tela 1: Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ [☰] NetLab                              [🔔] [👤 Usuário]          │
├───────────┬─────────────────────────────────────────────────────────┤
│           │                                                         │
│ 📊 Home   │  Olá! Bem-vindo ao NetLab.                             │
│           │                                                         │
│ 🗺️ Mapa   │  ┌─────────────────────────────────────────────┐       │
│           │  │ Progresso Geral                              │       │
│ 🔬 Simula │  │ ████████████████░░░░░░░░░░  62%             │       │
│           │  └─────────────────────────────────────────────┘       │
│ 📚 Labs   │                                                         │
│           │  ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│ 🧪 Debug  │  │ Fundament.│ │ IPv4      │ │ Subnetting│            │
│           │  │ ████████░░│ │ ██████░░░░│ │ ███░░░░░░░│            │
│ 📝 Prova  │  │ 80%       │ │ 60%       │ │ 35%       │            │
│           │  └───────────┘ └───────────┘ └───────────┘            │
│ ⚙️ Config │                                                         │
│           │  ┌───────────┐ ┌───────────┐ ┌───────────┐            │
│           │  │ Switching │ │ Routing   │ │ Services  │            │
│           │  │ ██░░░░░░░░│ │ █░░░░░░░░░│ │ ░░░░░░░░░░│            │
│           │  │ 20%       │ │ 10%       │ │ 0%        │            │
│           │  └───────────┘ └───────────┘ └───────────┘            │
│           │                                                         │
│           │  ┌─────────────────────┐  ┌─────────────────────┐     │
│           │  │ Último Laboratório  │  │ Próximo Desafio     │     │
│           │  │ Lab 03: Sub-rede    │  │ Lab 04: Gateway     │     │
│           │  │ ✅ Completo         │  │ ▶ Iniciar           │     │
│           │  └─────────────────────┘  └─────────────────────┘     │
│           │                                                         │
│           │  ┌─────────────────────────────────────────────┐       │
│           │  │ Conquistas Recentes                         │       │
│           │  │ 🏆 Primeiro Ping  🏆 Detective  🏆 Redes    │       │
│           │  └─────────────────────────────────────────────┘       │
│           │                                                         │
└───────────┴─────────────────────────────────────────────────────────┘
```

### Tela 2: Simulador

```
┌─────────────────────────────────────────────────────────────────────┐
│ [☰] NetLab > Simulador > Lab 03                    [▶ Iniciar]    │
├───────────┬──────────────────────────────────┬──────────────────────┤
│           │                                  │                      │
│ DISPOSIT. │    TOPOLOGIA                     │  PROPRIEDADES        │
│           │                                  │                      │
│ ┌───────┐ │    ┌─────────────────┐           │  Dispositivo: PC-01  │
│ │ 💻 PC │ │    │   [Switch]      │           │  Tipo: PC            │
│ └───────┘ │    │    /    \       │           │                      │
│           │    │   /      \      │           │  ─── Interface ───   │
│ ┌───────┐ │    │ [PC-01] [PC-02] │           │  eth0                │
│ │🖥Server│ │    │                  │           │  IP: 192.168.10.50   │
│ └───────┘ │    └─────────────────┘           │  Mask: 255.255.255.0 │
│           │                                  │  GW: 192.168.10.1    │
│ ┌───────┐ │    ┌─────────────────┐           │  DNS: 8.8.8.8        │
│ │📡Switch│ │    │   [Router]      │           │  MAC: AA:BB:CC:DD..  │
│ └───────┘ │    │                 │           │  Status: 🟢 UP       │
│           │    └─────────────────┘           │                      │
│ ┌───────┐ │                                  │  [Salvar] [Cancelar]│
│ │📡Router│ │                                  │                      │
│ └───────┘ │                                  │                      │
│           │                                  │                      │
│ ───────── │ ──────────────────────────────── │ ──────────────────── │
│           │                                  │                      │
│ TERMINAL  │  Objetivo:                       │  PACOTES             │
│           │  Conecte PC-01 ao PC-02          │  ──────────          │
│ PC-01>    │  e faça ping.                    │                      │
│ ipconfig  │                                  │  📨 ICMP Req →       │
│           │  Dica: Verifique os IPs.         │  📨 ICMP Rep ←       │
│ PC-01>    │                                  │                      │
│ ping 19.. │                                  │  [Inspecionar]       │
│           │                                  │                      │
└───────────┴──────────────────────────────────┴──────────────────────┘
```

### Tela 3: Mapa de Aprendizado

```
┌─────────────────────────────────────────────────────────────────────┐
│ [☰] NetLab > Mapa de Aprendizado                                  │
├───────────┬─────────────────────────────────────────────────────────┤
│           │                                                         │
│           │                    REDES DE COMPUTADORES                │
│           │                           │                             │
│           │              ┌────────────┴────────────┐               │
│           │              │                         │               │
│           │         Fundamentos               Modelo OSI            │
│           │         ✅ 100%                   🔒 Bloqueado          │
│           │              │                         │               │
│           │              ▼                         ▼               │
│           │           Ethernet                   IPv4               │
│           │         🔒 Bloqueado             🔒 Bloqueado          │
│           │                                      │               │
│           │                                      ▼               │
│           │                                   Subnetting           │
│           │                                 🔒 Bloqueado          │
│           │                                      │               │
│           │                          ┌───────────┼───────────┐   │
│           │                          ▼           ▼           ▼   │
│           │                       Switching   Routing   Services  │
│           │                     🔒 Bloqueado 🔒 Bloqueado 🔒    │
│           │                                                         │
│           │  ─────────────────────────────────────────────────     │
│           │                                                         │
│           │  Fundamentos                                            │
│           │  ├── ✅ O que é uma rede                                │
│           │  ├── ✅ LAN / WAN                                      │
│           │  ├── ✅ Dispositivos de rede                            │
│           │  └── ✅ Topologias                                     │
│           │                                                         │
│           │  [Iniciar Próximo: Modelo OSI]                          │
│           │                                                         │
└───────────┴─────────────────────────────────────────────────────────┘
```

### Tela 4: Terminal (Zoom)

```
┌─────────────────────────────────────────────────────┐
│ Terminal — PC-01                         [📌] [─] [×]│
├─────────────────────────────────────────────────────┤
│                                                     │
│ Microsoft Windows [Versão simulada]                 │
│ (c) NetLab - Laboratório Virtual                    │
│                                                     │
│ PC-01> ipconfig                                     │
│                                                     │
│ Configuração IP da Ethernet eth0:                   │
│                                                     │
│    Endereço IPv4. . . . . . . . : 192.168.10.50    │
│    Máscara de Sub-rede . . . . . : 255.255.255.0   │
│    Gateway Padrão . . . . . . . : 192.168.10.1     │
│                                                     │
│ PC-01> ping 192.168.10.20                           │
│                                                     │
│ Disparando ping para 192.168.10.20:                 │
│                                                     │
│ Resposta de 192.168.10.20: bytes=32 tempo=1ms      │
│ Resposta de 192.168.10.20: bytes=32 tempo=1ms      │
│ Resposta de 192.168.10.20: bytes=32 tempo=1ms      │
│ Resposta de 192.168.10.20: bytes=32 tempo=1ms      │
│                                                     │
│ Estatísticas do Ping:                               │
│    Pacotes: Enviados = 4, Recebidos = 4,           │
│    Perdidos = 0 (0% de perda)                      │
│                                                     │
│ PC-01> arp -a                                       │
│                                                     │
│ Interface: 192.168.10.50                            │
│   Endereço Físico    Endereço Lógico               │
│   AA:BB:CC:DD:EE:02  192.168.10.20   dynamic       │
│   AA:BB:CC:DD:EE:01  192.168.10.1    dynamic       │
│                                                     │
│ PC-01> _                                            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tela 5: Inspecionar Pacote

```
┌─────────────────────────────────────────────────────────┐
│ Inspecionar Pacote                              [×]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ICMP Echo Request                                       │
│  PC-01 → PC-02                                          │
│                                                         │
│  ┌─── Ethernet II ────────────────────────────────┐    │
│  │ Source MAC:      AA:BB:CC:DD:EE:01             │    │
│  │ Destination MAC: AA:BB:CC:DD:EE:02             │    │
│  │ Type: 0x0800 (IPv4)                            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─── IPv4 ───────────────────────────────────────┐    │
│  │ Version:  4                                     │    │
│  │ Header:   20 bytes                              │    │
│  │ TTL:      128                                   │    │
│  │ Protocol: 1 (ICMP)                              │    │
│  │ Source:      192.168.10.50                      │    │
│  │ Destination: 192.168.10.20                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─── ICMP ───────────────────────────────────────┐    │
│  │ Type: 8 (Echo Request)                          │    │
│  │ Code: 0                                         │    │
│  │ Checksum: 0x1234                                │    │
│  │ Identifier: 0x0100                              │    │
│  │ Sequence: 1                                     │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─── Dados ──────────────────────────────────────┐    │
│  │ 48 65 6C 6C 6F 20 57 6F 72 6C 64              │    │
│  │ "Hello World"                                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Tela 6: Exercício

```
┌─────────────────────────────────────────────────────────┐
│ Lab 03: Sub-rede Diferente                     ⏱️ 10min │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CENÁRIO                                               │
│  ───────                                               │
│  O PC-01 não consegue fazer ping no PC-02.             │
│  Investigue e resolva o problema.                       │
│                                                         │
│  TOPOLOGIA                                             │
│  ─────────                                             │
│  ┌─────────┐      ┌─────────┐                          │
│  │  PC-01  │──────│  PC-02  │                          │
│  │ 192.168 │      │ 192.168 │                          │
│  │  .10.50 │      │  .20.50 │                          │
│  └─────────┘      └─────────┘                          │
│                                                         │
│  OBJETIVO                                              │
│  ────────                                              │
│  Faça o ping funcionar entre PC-01 e PC-02.            │
│                                                         │
│  DICAS                                                 │
│  ─────                                                 │
│  💡 [Dica 1] Verifique a configuração IP de ambos.     │
│  💡 [Dica 2] Compare as máscaras e endereços.          │
│  💡 [Dica 3] Eles estão na mesma sub-rede?             │
│  📖 [Ver Solução]                                      │
│                                                         │
│  TERMINAL                                              │
│  ────────                                              │
│  PC-01> ipconfig                                        │
│  ...                                                   │
│                                                         │
│  ✅ VALIDAR  │  🔄 REINICIAR  │  ⏭️ PRÓXIMO            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
