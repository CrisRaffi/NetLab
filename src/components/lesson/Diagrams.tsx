const TEXT_FONT = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
} as const;

const MONO_FONT = {
  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
} as const;

const TXT = '#EEF2F9';
const SEC = '#A8B8CF';
const MUT = '#8094AD';
const BOX = '#182743';
const BOX_ALT = '#131C33';
const HDR = '#23314F';
const BORDER = '#2B3D5E';
const BORDER2 = '#354A6F';
const CYAN = '#818CF8';
const GREEN = '#10B981';

const REVEAL_DUR = 450;
const REVEAL = (ms: number) => ({
  animation: `diagramReveal ${REVEAL_DUR}ms ease-out both`,
  animationDelay: `${ms}ms`,
});

export type DiagramPlayProps = { playing?: boolean };

export function HandshakeDiagram({ playing }: DiagramPlayProps) {
  const reveal = (ms: number) => (playing ? REVEAL(ms) : undefined);

  return (
    <svg
      viewBox="0 0 640 230"
      className="w-full block"
      style={TEXT_FONT}
      role="img"
      aria-label="Aperto de mão TCP (three-way handshake)"
    >
      <defs>
        <marker
          id="dgm-hs-cy"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={CYAN} />
        </marker>
        <marker
          id="dgm-hs-gr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={GREEN} />
        </marker>
      </defs>

      <text x="8" y="18" fontSize="10" fill={MUT}>
        tempo ▼
      </text>

      {/* Cliente */}
      <g>
        <rect
          x="16"
          y="26"
          width="150"
          height="184"
          rx="12"
          fill={BOX}
          stroke={BORDER}
        />
        <text
          x="91"
          y="50"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={TXT}
        >
          Cliente
        </text>
        <text x="91" y="68" textAnchor="middle" fontSize="10" fill={MUT}>
          aplicação que
        </text>
        <text x="91" y="82" textAnchor="middle" fontSize="10" fill={MUT}>
          quer enviar dados
        </text>
      </g>

      {/* Servidor */}
      <g>
        <rect
          x="474"
          y="26"
          width="150"
          height="184"
          rx="12"
          fill={BOX}
          stroke={BORDER}
        />
        <text
          x="549"
          y="50"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={TXT}
        >
          Servidor
        </text>
        <text x="549" y="68" textAnchor="middle" fontSize="10" fill={MUT}>
          recebe a conexão
        </text>
      </g>

      {/* 1 SYN */}
      <g style={reveal(0)}>
        <line
          x1="166"
          y1="52"
          x2="468"
          y2="52"
          stroke={CYAN}
          strokeWidth="1.5"
          markerEnd="url(#dgm-hs-cy)"
        />
        <text x="320" y="46" textAnchor="middle" fontSize="10" fill={SEC}>
          1. SYN — “posso conversar?”
        </text>
      </g>

      {/* 2 SYN-ACK */}
      <g style={reveal(1500)}>
        <line
          x1="468"
          y1="98"
          x2="166"
          y2="98"
          stroke={CYAN}
          strokeWidth="1.5"
          markerEnd="url(#dgm-hs-cy)"
        />
        <text x="320" y="92" textAnchor="middle" fontSize="10" fill={SEC}>
          2. SYN-ACK — “pode sim, e você?”
        </text>
      </g>

      {/* 3 ACK */}
      <g style={reveal(3000)}>
        <line
          x1="166"
          y1="144"
          x2="468"
          y2="144"
          stroke={CYAN}
          strokeWidth="1.5"
          markerEnd="url(#dgm-hs-cy)"
        />
        <text x="320" y="138" textAnchor="middle" fontSize="10" fill={SEC}>
          3. ACK — “combinado!”
        </text>
      </g>

      {/* dados */}
      <g style={reveal(4500)}>
        <line
          x1="166"
          y1="190"
          x2="468"
          y2="190"
          stroke={GREEN}
          strokeWidth="1.5"
          strokeDasharray="6 4"
          markerEnd="url(#dgm-hs-gr)"
        />
        <text x="320" y="184" textAnchor="middle" fontSize="10" fill={GREEN}>
          4. a partir daqui, os dados (segmentos) fluem com confirmações
        </text>
      </g>
    </svg>
  );
}

export function EncapsulationDiagram({ playing }: DiagramPlayProps) {
  const reveal = (ms: number) => (playing ? REVEAL(ms) : undefined);
  const boxes = [
    {
      x: 12,
      label: 'Mensagem',
      layer: 'camada de aplicação',
      header: null,
      headerLabel: '',
    },
    {
      x: 176,
      label: 'Segmento',
      layer: 'camada de transporte',
      header: 40,
      headerLabel: 'TCP',
    },
    {
      x: 336,
      label: 'Datagrama',
      layer: 'camada de rede',
      header: 40,
      headerLabel: 'IP',
    },
    {
      x: 490,
      label: 'Quadro',
      layer: 'camada de enlace',
      header: 40,
      headerLabel: 'MAC',
    },
  ] as const;

  return (
    <svg
      viewBox="0 0 640 150"
      className="w-full block"
      style={TEXT_FONT}
      role="img"
      aria-label="Encapsulamento: cada camada adiciona seu cabeçalho"
    >
      <defs>
        <marker
          id="dgm-enc-mut"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={MUT} />
        </marker>
      </defs>

      <text x="76" y="22" textAnchor="middle" fontSize="10" fill={MUT}>
        Aplicação
      </text>
      <text x="246" y="22" textAnchor="middle" fontSize="10" fill={MUT}>
        Transporte
      </text>
      <text x="406" y="22" textAnchor="middle" fontSize="10" fill={MUT}>
        Rede
      </text>
      <text x="559" y="22" textAnchor="middle" fontSize="10" fill={MUT}>
        Enlace
      </text>

      {boxes.map((b, i) => {
        const center = b.x + 80;
        const prevRight = i > 0 ? boxes[i - 1].x + 140 : 0;
        return (
          <g key={b.label} style={reveal(i * 1500)}>
            {i > 0 && (
              <line
                x1={prevRight + 2}
                y1="73"
                x2={b.x - 4}
                y2="73"
                stroke={MUT}
                strokeWidth="1.5"
                markerEnd="url(#dgm-enc-mut)"
              />
            )}
            <rect
              x={b.x}
              y="50"
              width="140"
              height="46"
              rx="8"
              fill={BOX_ALT}
              stroke={b.header ? BORDER2 : BORDER}
            />
            {b.header && (
              <g>
                <rect
                  x={b.x}
                  y="50"
                  width={b.header}
                  height="46"
                  rx="8"
                  fill={HDR}
                  stroke={BORDER2}
                />
                <text
                  x={b.x + b.header / 2}
                  y="78"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  fill={CYAN}
                  style={MONO_FONT}
                >
                  {b.headerLabel}
                </text>
              </g>
            )}
            <text
              x={center}
              y="78"
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill={TXT}
            >
              {b.label}
            </text>
            <text
              x={center}
              y="112"
              textAnchor="middle"
              fontSize="10"
              fill={MUT}
            >
              {b.layer}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LayersDiagram({ playing }: DiagramPlayProps) {
  const layers = [
    { name: 'Aplicação', pdu: 'Mensagem', y: 26 },
    { name: 'Transporte', pdu: 'Segmento', y: 64 },
    { name: 'Rede', pdu: 'Datagrama', y: 102 },
    { name: 'Enlace', pdu: 'Quadro', y: 140 },
    { name: 'Física', pdu: 'Bits', y: 178 },
  ];

  const reveal = (ms: number) => (playing ? REVEAL(ms) : undefined);

  return (
    <svg
      viewBox="0 0 640 224"
      className="w-full block"
      style={TEXT_FONT}
      role="img"
      aria-label="Camadas conversam entre si no mesmo nível"
    >
      <defs>
        <marker
          id="dgm-ly-cy"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={CYAN} />
        </marker>
      </defs>

      <text
        x="91"
        y="18"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill={TXT}
      >
        Computador A
      </text>
      <text
        x="549"
        y="18"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
        fill={TXT}
      >
        Computador B
      </text>

      {layers.map((l, i) => (
        <g key={l.name} style={reveal(i * 1200)}>
          {/* A */}
          <rect
            x="16"
            y={l.y}
            width="150"
            height="30"
            rx="7"
            fill={BOX}
            stroke={BORDER}
          />
          <text
            x="91"
            y={l.y + 19}
            textAnchor="middle"
            fontSize="11"
            fill={TXT}
          >
            {l.name}
          </text>
          {/* B */}
          <rect
            x="474"
            y={l.y}
            width="150"
            height="30"
            rx="7"
            fill={BOX}
            stroke={BORDER}
          />
          <text
            x="549"
            y={l.y + 19}
            textAnchor="middle"
            fontSize="11"
            fill={TXT}
          >
            {l.name}
          </text>
          {/* link */}
          <line
            x1="166"
            y1={l.y + 15}
            x2="470"
            y2={l.y + 15}
            stroke={CYAN}
            strokeWidth="1.2"
            markerEnd="url(#dgm-ly-cy)"
          />
          <text
            x="318"
            y={l.y + 11}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={CYAN}
            style={MONO_FONT}
          >
            {l.pdu}
          </text>
          {/* pacote viajando pelo enlace (só durante a animação) */}
          {playing && (
            <circle cx="166" cy={l.y + 15} r="2.5" fill={GREEN}>
              <animateMotion
                dur="1.1s"
                repeatCount="indefinite"
                path="M0 0 L304 0"
              />
            </circle>
          )}
        </g>
      ))}

      <text x="320" y="220" textAnchor="middle" fontSize="10" fill={MUT}>
        cada camada “conversa” com a sua irmã no outro computador usando a mesma
        PDU
      </text>
    </svg>
  );
}

export function DnsDiagram({ playing }: DiagramPlayProps) {
  const reveal = (ms: number) => (playing ? REVEAL(ms) : undefined);

  return (
    <svg
      viewBox="0 0 640 200"
      className="w-full block"
      style={TEXT_FONT}
      role="img"
      aria-label="DNS converte nome de domínio em endereço IP"
    >
      <defs>
        <marker
          id="dgm-dns-cy"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={CYAN} />
        </marker>
        <marker
          id="dgm-dns-gr"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10 z" fill={GREEN} />
        </marker>
      </defs>

      {/* Navegador */}
      <g>
        <rect
          x="24"
          y="58"
          width="150"
          height="80"
          rx="12"
          fill={BOX}
          stroke={BORDER}
        />
        <text
          x="99"
          y="86"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={TXT}
        >
          Seu navegador
        </text>
        <text x="99" y="104" textAnchor="middle" fontSize="10" fill={MUT}>
          digitou
        </text>
        <text
          x="99"
          y="120"
          textAnchor="middle"
          fontSize="10"
          fill={CYAN}
          style={MONO_FONT}
        >
          www.example.com
        </text>
      </g>

      {/* Servidor DNS */}
      <g>
        <rect
          x="466"
          y="58"
          width="150"
          height="80"
          rx="12"
          fill={BOX}
          stroke={BORDER}
        />
        <text
          x="541"
          y="86"
          textAnchor="middle"
          fontSize="12"
          fontWeight="700"
          fill={TXT}
        >
          Servidor DNS
        </text>
        <text x="541" y="104" textAnchor="middle" fontSize="10" fill={MUT}>
          a “agenda de contatos”
        </text>
        <text x="541" y="120" textAnchor="middle" fontSize="10" fill={MUT}>
          da Internet
        </text>
      </g>

      {/* pergunta */}
      <g style={reveal(0)}>
        <line
          x1="174"
          y1="78"
          x2="462"
          y2="78"
          stroke={CYAN}
          strokeWidth="1.5"
          markerEnd="url(#dgm-dns-cy)"
        />
        <text x="318" y="70" textAnchor="middle" fontSize="10" fill={SEC}>
          1. "qual o IP de www.example.com?"
        </text>
      </g>

      {/* resposta */}
      <g style={reveal(1500)}>
        <line
          x1="462"
          y1="118"
          x2="174"
          y2="118"
          stroke={GREEN}
          strokeWidth="1.5"
          markerEnd="url(#dgm-dns-gr)"
        />
        <text
          x="318"
          y="112"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          fill={GREEN}
          style={MONO_FONT}
        >
          2. "é o 192.0.2.44"
        </text>
      </g>

      {/* resultado */}
      <g style={reveal(3000)}>
        <rect
          x="180"
          y="156"
          width="280"
          height="28"
          rx="7"
          fill={BOX_ALT}
          stroke={BORDER2}
        />
        <text x="320" y="174" textAnchor="middle" fontSize="10" fill={SEC}>
          3. com o IP em mãos, o navegador já fala direto com o site
        </text>
      </g>
    </svg>
  );
}

const OSI_LAYERS = [
  {
    name: 'Aplicação',
    pdu: 'Mensagem',
    dia: 'navegador, e-mail e WhatsApp',
    y: 30,
    accent: CYAN,
  },
  {
    name: 'Apresentação',
    pdu: '—',
    dia: 'traduz imagem, vídeo e texto',
    y: 68,
    accent: '#A78BFA',
  },
  {
    name: 'Sessão',
    pdu: '—',
    dia: 'abre e mantém o diálogo',
    y: 106,
    accent: '#F59E0B',
  },
  {
    name: 'Transporte',
    pdu: 'Segmento',
    dia: 'a empresa de entregas',
    y: 144,
    accent: GREEN,
  },
  {
    name: 'Rede',
    pdu: 'Datagrama',
    dia: 'o carteiro que acha o caminho',
    y: 182,
    accent: '#38BDF8',
  },
  {
    name: 'Enlace',
    pdu: 'Quadro',
    dia: 'entrega no mesmo bairro',
    y: 220,
    accent: '#F43F5E',
  },
  {
    name: 'Física',
    pdu: 'Bits',
    dia: 'a estrada e o asfalto',
    y: 258,
    accent: '#94A3B8',
  },
] as const;

export function OsiLayersDiagram({ playing }: DiagramPlayProps) {
  const reveal = (ms: number) => (playing ? REVEAL(ms) : undefined);

  return (
    <svg
      viewBox="0 0 640 360"
      className="w-full block"
      style={TEXT_FONT}
      role="img"
      aria-label="As 7 camadas do modelo OSI com exemplos do dia a dia"
    >
      <text x="141" y="20" textAnchor="middle" fontSize="11" fontWeight="700" fill={TXT}>
        Modelo OSI — 7 camadas
      </text>

      {OSI_LAYERS.map((l, i) => (
        <g key={l.name} style={reveal(i * 700)}>
          <rect x="24" y={l.y} width="5" height="32" rx="2" fill={l.accent} />
          <rect
            x="29"
            y={l.y}
            width="225"
            height="32"
            rx="6"
            fill={BOX}
            stroke={BORDER}
          />
          <text
            x="141"
            y={l.y + 15}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={TXT}
          >
            {l.name}
          </text>
          <text
            x="141"
            y={l.y + 28}
            textAnchor="middle"
            fontSize="9"
            fill={l.accent}
            style={MONO_FONT}
          >
            PDU: {l.pdu}
          </text>

          <rect x="348" y={l.y + 8} width="8" height="8" rx="2" fill={l.accent} opacity="0.5" />
          <text
            x="362"
            y={l.y + 16}
            fontSize="11"
            fontWeight="700"
            fill={TXT}
          >
            {l.name}
          </text>
          <text x="362" y={l.y + 29} fontSize="10" fill={SEC}>
            {l.dia}
          </text>
        </g>
      ))}

      {playing && (
        <circle cx="141" cy="18" r="4" fill={GREEN}>
          <animateMotion
            dur="4.5s"
            repeatCount="indefinite"
            path="M 141 18 L 141 46 L 141 84 L 141 122 L 141 160 L 141 198 L 141 236 L 141 274 L 141 306"
          />
        </circle>
      )}

      <text x="320" y="344" textAnchor="middle" fontSize="10" fill={MUT}>
        o pacote de dados “desce” as camadas no envio, ganhando cabeçalhos
      </text>
    </svg>
  );
}

const TCPIP_LAYERS = [
  {
    name: 'Aplicação',
    protocols: 'HTTP, SMTP, DNS',
    osiChips: ['7', '6', '5'],
    osiLabel: 'camadas 5, 6 e 7',
    y: 30,
    accent: CYAN,
  },
  {
    name: 'Transporte',
    protocols: 'TCP, UDP',
    osiChips: ['4'],
    osiLabel: 'camada 4',
    y: 72,
    accent: GREEN,
  },
  {
    name: 'Internet',
    protocols: 'IP, ICMP, ARP',
    osiChips: ['3'],
    osiLabel: 'camada 3',
    y: 114,
    accent: '#38BDF8',
  },
  {
    name: 'Acesso à Rede',
    protocols: 'Ethernet, Wi-Fi, fibra',
    osiChips: ['2', '1'],
    osiLabel: 'camadas 1 e 2',
    y: 156,
    accent: '#F43F5E',
  },
] as const;

export function TcpIpDiagram({ playing }: DiagramPlayProps) {
  const reveal = (ms: number) => (playing ? REVEAL(ms) : undefined);

  return (
    <svg
      viewBox="0 0 640 320"
      className="w-full block"
      style={TEXT_FONT}
      role="img"
      aria-label="Arquitetura TCP/IP com 4 camadas e a correspondência com o modelo OSI"
    >
      <text x="141" y="18" textAnchor="middle" fontSize="11" fontWeight="700" fill={TXT}>
        Arquitetura TCP/IP — 4 camadas
      </text>
      <text x="495" y="18" textAnchor="middle" fontSize="10" fill={MUT} style={MONO_FONT}>
        OSI
      </text>

      {TCPIP_LAYERS.map((l, i) => (
        <g key={l.name} style={reveal(i * 800)}>
          <rect
            x="16"
            y={l.y}
            width="250"
            height="34"
            rx="7"
            fill={BOX}
            stroke={BORDER}
          />
          <rect x="16" y={l.y} width="5" height="34" rx="2" fill={l.accent} />
          <text
            x="34"
            y={l.y + 16}
            fontSize="12"
            fontWeight="700"
            fill={TXT}
          >
            {l.name}
          </text>
          <text
            x="34"
            y={l.y + 29}
            fontSize="9"
            fill={SEC}
            style={MONO_FONT}
          >
            {l.protocols}
          </text>

          <line
            x1="266"
            y1={l.y + 17}
            x2="474"
            y2={l.y + 17}
            stroke={l.accent}
            strokeWidth="1"
            strokeDasharray="4 3"
          />
          {l.osiChips.map((chip, ci) => (
            <g key={chip}>
              <rect
                x="480"
                y={l.y + 17 - ((l.osiChips.length - 1) * 10) / 2 + ci * 10}
                width="30"
                height="8"
                rx="2"
                fill={BOX_ALT}
                stroke={l.accent}
                opacity="0.85"
              />
              <text
                x="495"
                y={l.y + 23 - ((l.osiChips.length - 1) * 10) / 2 + ci * 10}
                textAnchor="middle"
                fontSize="7"
                fill={SEC}
                style={MONO_FONT}
              >
                {chip}
              </text>
            </g>
          ))}
          <text
            x="530"
            y={l.y + 21}
            fontSize="9"
            fill={l.accent}
            style={MONO_FONT}
          >
            {l.osiLabel}
          </text>
        </g>
      ))}

      {playing && (
        <circle cx="141" cy="12" r="4" fill={GREEN}>
          <animateMotion
            dur="3.2s"
            repeatCount="indefinite"
            path="M 141 12 L 141 47 L 141 89 L 141 131 L 141 173 L 141 200"
          />
        </circle>
      )}

      <rect x="16" y="210" width="608" height="76" rx="10" fill={BOX_ALT} stroke={BORDER} />
      <text x="320" y="232" textAnchor="middle" fontSize="11" fontWeight="700" fill={TXT}>
        Na prática, a Internet é TCP/IP:
      </text>
      <text x="320" y="252" textAnchor="middle" fontSize="10" fill={SEC}>
        as camadas 5, 6 e 7 do OSI viraram UMA: a Aplicação TCP/IP
      </text>
      <text x="320" y="268" textAnchor="middle" fontSize="10" fill={SEC}>
        e as camadas 1 e 2 viraram UMA: o Acesso à Rede
      </text>
    </svg>
  );
}

const PIPELINE_LEFT = ['Aplicação', 'Apresentação', 'Sessão', 'Transporte', 'Rede', 'Enlace', 'Física'];
const PIPELINE_YS = [32, 66, 100, 134, 168, 202, 236];

export function OsiPipelineDiagram({ playing }: DiagramPlayProps) {
  const reveal = (ms: number) => (playing ? REVEAL(ms) : undefined);
  const headerChip = (x: number, y: number, label: string, color: string, ms: number, anchor: 'start' | 'end') => (
    <g style={reveal(ms)}>
      <rect x={x} y={y - 9} width="150" height="18" rx="4" fill={BOX_ALT} stroke={BORDER2} />
      <circle cx={anchor === 'start' ? x + 12 : x + 138} cy={y} r="2.5" fill={color} />
      <text
        x={anchor === 'start' ? x + 22 : x + 128}
        y={y + 3}
        fontSize="9.5"
        fill={color}
        style={MONO_FONT}
        textAnchor={anchor}
      >
        {label}
      </text>
    </g>
  );

  return (
    <svg
      viewBox="0 0 640 360"
      className="w-full block"
      style={TEXT_FONT}
      role="img"
      aria-label="Trajeto dos dados pelo modelo OSI: encapsulamento no envio e desencapsulamento no recebimento"
    >
      <text x="95" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill={TXT}>
        Emissor (envio)
      </text>
      <text x="470" y="22" textAnchor="middle" fontSize="11" fontWeight="700" fill={TXT}>
        Receptor (recebimento)
      </text>

      {PIPELINE_YS.map((y, i) => (
        <g key={PIPELINE_LEFT[i]}>
          <rect x="20" y={y} width="150" height="28" rx="5" fill={BOX} stroke={BORDER} />
          <rect x="470" y={y} width="150" height="28" rx="5" fill={BOX} stroke={BORDER} />
          <text x="95" y={y + 18} textAnchor="middle" fontSize="9" fill={MUT}>
            {PIPELINE_LEFT[i]}
          </text>
          <text x="545" y={y + 18} textAnchor="middle" fontSize="9" fill={MUT}>
            {PIPELINE_LEFT[i]}
          </text>
        </g>
      ))}

      <line x1="170" y1="250" x2="470" y2="250" stroke={BORDER2} strokeWidth="2" strokeDasharray="6 4" />

      {playing && (
        <circle cx="95" cy="18" r="4.5" fill={GREEN}>
          <animateMotion
            dur="9s"
            repeatCount="1"
            fill="freeze"
            path="M 95 18 L 95 46 L 95 80 L 95 114 L 95 148 L 95 182 L 95 216 L 95 250 L 300 250 L 470 250 L 470 216 L 470 182 L 470 148 L 470 114 L 470 80 L 470 46 L 470 18"
          />
        </circle>
      )}

      {headerChip(190, 148, '+ adiciona TCP', CYAN, 1750, 'start')}
      {headerChip(190, 182, '+ adiciona IP', '#38BDF8', 2300, 'start')}
      {headerChip(190, 216, '+ adiciona MAC', '#F43F5E', 2900, 'start')}
      {headerChip(190, 250, 'vira bits', '#94A3B8', 3450, 'start')}
      {headerChip(430, 216, 'remove MAC', '#F43F5E', 5700, 'end')}
      {headerChip(430, 182, 'remove IP', '#38BDF8', 6250, 'end')}
      {headerChip(430, 148, 'remove TCP', CYAN, 6800, 'end')}
      {headerChip(430, 46, 'abre a mensagem', GREEN, 8500, 'end')}

      <text x="320" y="320" textAnchor="middle" fontSize="10" fill={MUT}>
        no envio cada camada EMPACOTA o pacote · o meio físico leva os bits ·
        no recebimento cada camada DESEMPACOTA
      </text>
      <text x="320" y="338" textAnchor="middle" fontSize="10" fill={MUT}>
        isso é o encapsulamento (e o desencapsulamento)!
      </text>
    </svg>
  );
}
