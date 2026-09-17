const TEXT_FONT = {
  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
} as const;

const MONO_FONT = {
  fontFamily: 'JetBrains Mono, ui-monospace, monospace',
} as const;

const TXT = '#E8EDF5';
const SEC = '#94A3B8';
const MUT = '#64748B';
const BOX = '#111A2C';
const BOX_ALT = '#0D1424';
const HDR = '#1C2538';
const BORDER = '#1E2D47';
const BORDER2 = '#273651';
const CYAN = '#818CF8';
const GREEN = '#10B981';

export function HandshakeDiagram() {
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

      {/* 2 SYN-ACK */}
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

      {/* 3 ACK */}
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

      {/* dados */}
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
    </svg>
  );
}

export function EncapsulationDiagram() {
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

      {boxes.map((b) => {
        const center = b.x + 80;
        return (
          <g key={b.label}>
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

      <line
        x1="154"
        y1="73"
        x2="172"
        y2="73"
        stroke={MUT}
        strokeWidth="1.5"
        markerEnd="url(#dgm-enc-mut)"
      />
      <line
        x1="318"
        y1="73"
        x2="332"
        y2="73"
        stroke={MUT}
        strokeWidth="1.5"
        markerEnd="url(#dgm-enc-mut)"
      />
      <line
        x1="478"
        y1="73"
        x2="486"
        y2="73"
        stroke={MUT}
        strokeWidth="1.5"
        markerEnd="url(#dgm-enc-mut)"
      />

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
    </svg>
  );
}

export function LayersDiagram() {
  const layers = [
    { name: 'Aplicação', pdu: 'Mensagem', y: 26 },
    { name: 'Transporte', pdu: 'Segmento', y: 64 },
    { name: 'Rede', pdu: 'Datagrama', y: 102 },
    { name: 'Enlace', pdu: 'Quadro', y: 140 },
    { name: 'Física', pdu: 'Bits', y: 178 },
  ];

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

      {layers.map((l) => (
        <g key={l.name}>
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
        </g>
      ))}

      <text x="320" y="220" textAnchor="middle" fontSize="10" fill={MUT}>
        cada camada “conversa” com a sua irmã no outro computador usando a mesma
        PDU
      </text>
    </svg>
  );
}

export function DnsDiagram() {
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
        1. “qual o IP de www.example.com?”
      </text>

      {/* resposta */}
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
        2. “é o 192.0.2.44”
      </text>

      {/* resultado */}
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
    </svg>
  );
}
