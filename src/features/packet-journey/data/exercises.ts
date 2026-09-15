export interface JourneyExercise {
  id: string;
  type: 'identify_layer' | 'multiple_choice';
  title: string;
  scenario: string;
  options: string[];
  correct: string;
  hints: string[];
  quick: string;
  deep: string;
  conceptId: string;
}

export const JOURNEY_EXERCISES: JourneyExercise[] = [
  {
    id: 'jex-ip-layer',
    type: 'identify_layer',
    title: 'Qual camada está trabalhando?',
    scenario: 'O pacote acabou de receber um endereço IP (192.168.1.20).',
    options: ['Aplicação', 'Transporte', 'Rede', 'Enlace'],
    correct: 'Rede',
    hints: [
      'Essa camada trabalha com endereçamento lógico.',
      'Pense no IP: ele identifica origem e destino de forma lógica.',
      'O cabeçalho recém-adicionado inclui IP de origem e de destino (192.168.1.10 e 192.168.1.20).',
      'Não é a camada das portas (Transporte) nem dos MACs (Enlace).',
      'IPv4 é a tecnologia principal da camada 3 — Rede.',
    ],
    quick: 'A camada de Rede trabalha com endereçamento lógico (IPv4) e decide para onde o pacote deve ir.',
    deep: 'Cada host tem um IP lógico que só importa para roteamento. A camada 3 adiciona esse endereço ao dado, permitindo que roteadores encaminhem o pacote pela rede até chegar na rede do destino.',
    conceptId: 'osi-model',
  },
  {
    id: 'jex-port-layer',
    type: 'identify_layer',
    title: 'Porta 80 — onde ela se encaixa?',
    scenario: 'A conexão usa a porta de destino 80 (HTTP).',
    options: ['Aplicação', 'Transporte', 'Rede', 'Física'],
    correct: 'Transporte',
    hints: [
      'Portas identificam aplicações dentro do mesmo host.',
      'A camada de Transporte entrega dados à aplicação certa usando portas.',
      'TCP e UDP usam portas para isso.',
      'Não é a camada de endereçamento (Rede) nem a de bits (Física).',
      'Transporte: TCP segura a porta origem 51542 → porta destino 80.',
    ],
    quick: 'Portas são usadas pela camada de Transporte para entregar os dados à aplicação correta.',
    deep: 'Um servidor pode ter vários serviços (HTTP:80, DNS:53). O cabeçalho TCP guarda a porta origem (cliente) e destino (serviço), permitindo saber quem deve receber o payload.',
    conceptId: 'tcp-ip-model',
  },
  {
    id: 'jex-mac-switch',
    type: 'identify_layer',
    title: 'O que o switch examina?',
    scenario: 'Um switch precisa saber para qual equipamento entregar o quadro.',
    options: ['Endereço IP', 'Endereço MAC', 'Porta TCP', 'Nome DNS'],
    correct: 'Endereço MAC',
    hints: [
      'O switch opera sem olhar IPs.',
      'Isso é um endereço físico, gravado no hardware da placa.',
      'Muito parecido com AA:BB:CC:04:05:06.',
      'Não é a porta (Transporte) nem o nome amigável (Aplicação/DNS).',
      'O switch encaminha o quadro pela porta de destino do MAC (camada 2 — Enlace).',
    ],
    quick: 'O switch entrega quadros na rede local usando o endereço MAC (camada de Enlace).',
    deep: 'No mesmo segmento L2, o remetente descobre o MAC de destino por ARP e monta o quadro. O switch aprende em qual porta cada MAC está e encaminha só para ela.',
    conceptId: 'mac-address',
  },
  {
    id: 'jex-cable-fisica',
    type: 'identify_layer',
    title: 'Cabo desconectado — primeira camada?',
    scenario: 'O cabo de rede foi desconectado.',
    options: ['Física', 'Enlace', 'Rede', 'Transporte'],
    correct: 'Física',
    hints: [
      'Essa camada cuida do meio de transmissão.',
      'O sinal nem chega a trafegar.',
      'Nenhum bit consegue cruzar um cabo solto.',
      'Sem sinal elétrico, nem quadros nem pacotes existem.',
      'A camada 1 (Física) que transforma dados em sinais.',
    ],
    quick: 'O problema está na camada Física: sem meio físico, nenhum bit trafega.',
    deep: 'Cabo desconectado, interface desligada ou porta sem link significa perda na camada 1. Nenhuma camada acima funciona porque os bits nunca deixam o equipamento.',
    conceptId: 'frames',
  },
  {
    id: 'jex-order-encap',
    type: 'multiple_choice',
    title: 'Ordem do encapsulamento',
    scenario: 'Monte a sequência correta do encapsulamento, do interior para o exterior.',
    options: [
      'Dados → TCP → IP → Ethernet → Bits',
      'Bits → TCP → IP → Dados → Ethernet',
      'Dados → IP → TCP → Bits → Ethernet',
      'Ethernet → IP → TCP → Dados → Bits',
    ],
    correct: 'Dados → TCP → IP → Ethernet → Bits',
    hints: [
      'A aplicação gera o dado puro.',
      'Depois vem o transporte (portas), depois a rede (IP).',
      'O quadro Ethernet envelopa tudo, e no fim viram bits.',
      'Não começa pelos bits e nem termina nos dados no envio.',
      'Depois de "Dados → TCP → IP", vem Ethernet e por fim Bits.',
    ],
    quick: 'Encapsular = envolver de dentro pra fora: Dados → TCP → IP → Ethernet → Bits.',
    deep: 'Cada camada adiciona seu cabeçalho ao dado da camada acima. Quando o roteador encaminha, ele remove e recria só o cabeçalho Ethernet (MACs locais) — o IP e o TCP permanecem intactos.',
    conceptId: 'encapsulation',
  },
  {
    id: 'jex-decap-first',
    type: 'multiple_choice',
    title: 'Primeiro cabeçalho removido',
    scenario: 'O pacote chega ao servidor cheio de cabeçalhos. Qual é o PRIMEIRO a ser removido?',
    options: ['Cabeçalho Ethernet', 'Cabeçalho IP', 'Cabeçalho TCP', 'Nenhum — só os dados'],
    correct: 'Cabeçalho Ethernet',
    hints: [
      'A remoção acontece de fora para dentro.',
      'O que foi adicionado por último no envio é lido primeiro.',
      'O último invólucro foi o quadro Ethernet.',
      'IP e TCP só serão lidos depois que o quadro for aberto.',
      'Bits → quadro Ethernet (removido) → restam IP + TCP + dados.',
    ],
    quick: 'Na desencapsulação, o primeiro cabeçalho removido é o Ethernet (o invólucro mais externo).',
    deep: 'O receptor lê os bits, reconstrói o quadro, confere o MAC destino, remove o cabeçalho Ethernet e entrega o pacote IP à camada de Rede.',
    conceptId: 'encapsulation',
  },
  {
    id: 'jex-gateway',
    type: 'identify_layer',
    title: 'Falar com outra rede',
    scenario: 'O PC quer enviar dados para uma rede diferente da sua.',
    options: ['Para o switch', 'Para o gateway padrão', 'Para o servidor DNS', 'Para todos ao mesmo tempo'],
    correct: 'Para o gateway padrão',
    hints: [
      'Destinos na mesma rede vão direto; destinos em outra rede…',
      'Alguém precisa conhecer o caminho para fora da rede local.',
      'É o endereço configurado como "Default Gateway".',
      'O switch só faz L2; quem roteia é o gateway.',
      'Tudo que não está na rede local é entregue ao gateway (ex.: 192.168.1.1).',
    ],
    quick: 'Para outra rede, o PC envia o pacote ao gateway padrão, que roteia até o destino.',
    deep: 'Primeiro o PC compara o IP destino com sua máscara. Se estiver noutra rede, ele entrega o quadro ao MAC do gateway; o gateway remove o quadro, roteia pelo IP e recria um novo quadro com o MAC do próximo salto.',
    conceptId: 'gateway',
  },
  {
    id: 'jex-dns',
    type: 'multiple_choice',
    title: 'Nome para IP',
    scenario: 'Você digita "www.exemplo.com" e o navegador precisa do endereço IP.',
    options: ['ARP', 'DNS', 'DHCP', 'Ping'],
    correct: 'DNS',
    hints: [
      'É um serviço que traduz nome de domínio em IP.',
      'Funciona como uma "agenda telefônica" da internet.',
      'Consulta normalmente vai para a porta 53.',
      'Não é o DHCP (configura IP) nem o ping (testa).',
      'DNS resolve www.exemplo.com → 93.184.216.34.',
    ],
    quick: 'O DNS traduz nomes de domínio em endereços IP (aplicação, porta 53).',
    deep: 'Se o ping por IP funciona mas o site não abre, o DNS é o suspeito: a conversão de nome para IP falhou. Verifique o servidor DNS configurado na interface.',
    conceptId: 'dns',
  },
];