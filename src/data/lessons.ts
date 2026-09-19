export type DiagramType =
  | 'layers'
  | 'encapsulation'
  | 'handshake'
  | 'dns'
  | 'osi-layers'
  | 'tcpip-layers'
  | 'osi-pipeline';

export type LessonBlock =
  | { kind: 'paragraph'; text: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'callout'; tone: 'tip' | 'warning' | 'info'; title: string; text: string }
  | { kind: 'analogy'; text: string }
  | { kind: 'table'; headers: string[]; rows: string[][] }
  | { kind: 'diagram'; type: DiagramType; caption?: string };

export interface LessonSection {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  sections: LessonSection[];
}

export const LESSONS: Lesson[] = [
  {
    id: 'transporte-pdu',
    title: 'Camada de Transporte e PDUs',
    subtitle:
      'Entenda, em linguagem simples, como os dados viajam entre os programas e o nome que cada camada dá ao seu pacote de dados.',
    sections: [
      {
        id: 'o-que-faz',
        title: 'O que faz a camada de transporte',
        blocks: [
          {
            kind: 'paragraph',
            text: 'A camada de transporte é a "transportadora de entregas" da Internet. Ela pega a mensagem que um programa quer enviar (seu navegador carregando uma página, por exemplo) e cuida para que essa mensagem chegue ao programa certo no outro computador. Na prática, são apenas dois protocolos que fazem esse serviço: o TCP e o UDP.',
          },
          {
            kind: 'analogy',
            text: 'Pense assim: a camada de aplicação é o vizinho que escreve uma carta, e a camada de transporte é a empresa de entregas que leva a carta. A empresa não se importa com o que está escrito — ela só garante que a carta chegue ao endereço certo.',
          },
          {
            kind: 'list',
            items: [
              'Endereça cada programa pelo número da porta (ex.: 80 = site, 443 = site seguro) — é como o número do apartamento no envelope.',
              'Recebe a mensagem da camada de aplicação e a repassa para baixo (rede) ou para cima (aplicação).',
              'Oferece serviços diferentes dependendo do protocolo: confiabilidade (TCP) ou velocidade (UDP).',
            ],
          },
        ],
      },
      {
        id: 'tcp',
        title: 'TCP: a entrega registrada',
        blocks: [
          {
            kind: 'paragraph',
            text: 'O TCP (Transmission Control Protocol) é o protocolo "cauteloso". Antes de enviar qualquer dado, ele conversa com o destino — é o famoso aperto de mão (three-way handshake) — para combinar que a conexão está pronta. Depois de enviar, ele confere se cada pedaço chegou. Se algo se perde, ele reenvia.',
          },
          {
            kind: 'analogy',
            text: 'TCP é como uma encomenda com rastreamento entregue em mãos: exigem assinatura, avisam o número de rastreio e, se o pacote sumir, o remetente envia outro.',
          },
          {
            kind: 'diagram',
            type: 'handshake',
            caption:
              'Antes de enviar qualquer dado, cliente e servidor fazem o “aperto de mão”: SYN → SYN-ACK → ACK. Só depois disso os segmentos começam a trafegar.',
          },
          {
            kind: 'list',
            items: [
              'Transferência confiável: cada pedaço é confirmado; se cair no caminho, é reenviado.',
              'Entrega em ordem: os pedaços são remontados na mesma ordem em que foram enviados.',
              'Orientado à conexão: estabelece a conexão (aperto de mão) antes de transmitir.',
              'Divide a mensagem em pedaços chamados segmentos.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Atenção: TCP NÃO é "não orientado à conexão"',
            text: 'Uma pegadinha comum é achar que o TCP não estabelece conexão. O oposto! Quem não faz conexão nenhuma é o UDP. No TCP, os dados só saem depois que o destino "fecha o trato" com o remetente.',
          },
        ],
      },
      {
        id: 'udp',
        title: 'UDP: o cartão-postal',
        blocks: [
          {
            kind: 'paragraph',
            text: 'O UDP (User Datagram Protocol) é o protocolo "apressado". Ele manda os dados sem combinar nada com o destino e sem conferir se chegaram. Em troca, é muito mais rápido — ideal para coisas em que um atraso é pior que um dado perdido.',
          },
          {
            kind: 'analogy',
            text: 'UDP é como jogar um cartão-postal na caixa de correio: você posta e pronto. Às vezes chega desordenado, às vezes se perde — mas é rápido e não exige entregador esperando assinatura.',
          },
          {
            kind: 'list',
            items: [
              'Não orientado à conexão: manda direto, sem aperto de mão.',
              'Sem confirmação: não reenvia dados perdidos.',
              'Mais rápido e com menos carga de controle.',
              'Muito usado em streaming, videoconferência, jogos online e consultas de DNS.',
            ],
          },
        ],
      },
      {
        id: 'comparacao',
        title: 'TCP × UDP na prática',
        blocks: [
          {
            kind: 'table',
            headers: ['Característica', 'TCP', 'UDP'],
            rows: [
              ['Orientado à conexão', 'Sim (aperto de mão)', 'Não'],
              ['Entrega confiável', 'Sim', 'Não'],
              ['Entrega em ordem', 'Sim', 'Não'],
              ['Pedaço de dados (PDU)', 'Segmento', 'Datagrama'],
              ['Quando usar', 'Páginas, e-mail, arquivos', 'Vídeos, voz, jogos, DNS'],
            ],
          },
        ],
      },
      {
        id: 'pdu',
        title: 'O que é uma PDU e os nomes de cada camada',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Pensando na hierarquia das camadas, cada uma recebe os dados da camada acima, coloca um cabeçalho (como um envelope com instruções) e repassa. Esse "pacote = cabeçalho + dados" se chama PDU (Protocol Data Unit). Cada camada dá um nome diferente ao seu PDU:',
          },
          {
            kind: 'diagram',
            type: 'layers',
            caption:
              'A camada de aplicação “fala” com a aplicação do outro computador usando Mensagens; a de transporte conversa em Segmentos; e assim por diante, nível a nível.',
          },
          {
            kind: 'table',
            headers: ['Camada', 'Nome da PDU'],
            rows: [
              ['Aplicação', 'Mensagem'],
              ['Transporte (TCP)', 'Segmento'],
              ['Transporte (UDP)', 'Datagrama'],
              ['Rede (IP)', 'Datagrama'],
              ['Enlace de dados', 'Quadro'],
              ['Física', 'Bits'],
            ],
          },
          {
            kind: 'analogy',
            text: 'É como uma boneca russa: cada camada coloca a PDU anterior dentro de um novo envelope com suas próprias instruções. Na chegada, as camadas vão abrindo os envelopes na ordem inversa até a aplicação receber a mensagem original.',
          },
          {
            kind: 'diagram',
            type: 'encapsulation',
            caption:
              'Ao descer as camadas, cada uma adiciona seu cabeçalho (a fatia marcada: TCP, IP, MAC) por fora do que veio de cima — primeiro a Mensagem, depois Segmento, Datagrama e Quadro, que é o que sai pelo cabo.',
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'Não confunda os nomes',
            text: 'TCP chama seu pedaço de SEGMENTO. UDP também usa a palavra DATAGRAMA, e o IP também. A camada de enlace chama o seu de QUADRO. Decore o nome da PDU de cada camada: Mensagem → Segmento → Datagrama → Quadro → Bits.',
          },
        ],
      },
      {
        id: 'dns',
        title: 'DNS: a agenda de contatos da Internet',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Computadores conversam por números (endereços IP), mas pessoas preferem nomes: é muito mais fácil lembrar "www.example.com" do que "192.0.2.44". O DNS (Domain Name System) é o sistema que faz essa conversão de nome para número.',
          },
          {
            kind: 'analogy',
            text: 'O DNS é a agenda de contatos do seu celular: você não decora o número da Julia, procura pelo nome. Quando digita um site, o DNS "busca na agenda" o número IP dele.',
          },
          {
            kind: 'diagram',
            type: 'dns',
            caption:
              'Fluxo do DNS: você pergunta o IP pelo nome (www.example.com) e o servidor responde com o endereço numérico (192.0.2.44).',
          },
          {
            kind: 'list',
            items: [
              'FTP: transfere arquivos entre computadores.',
              'SMTP: envia e-mails.',
              'POP: recebe e-mails.',
              'Telnet: acessa outro computador à distância por texto.',
              'DNS: converte nome de domínio em endereço IP.',
            ],
          },
        ],
      },
      {
        id: 'meios',
        title: 'O caminho dos dados: meios de transmissão',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Os dados podem trafegar por meios com fio (guiados) ou sem fio (eletromagnéticos, pelo ar). O Wi-Fi, por exemplo, usa ondas eletromagnéticas do tipo micro-ondas (faixas de 2.4 GHz e 5 GHz).',
          },
          {
            kind: 'analogy',
            text: 'Meio de transmissão é a "estrada" por onde viajam os dados: uma estrada de asfalto (cabo de par trançado), um túnel subterrâneo (fibra ótica) ou o ar (Wi-Fi).',
          },
          {
            kind: 'table',
            headers: ['Meio', 'Tipo', 'Onde é usado'],
            rows: [
              ['Par trançado', 'Com fio', 'Cabo de rede comum na tomada Ethernet'],
              ['Fibra ótica', 'Com fio (luz)', 'Conexões de internet rápida e longa distância'],
              ['Cabo coaxial', 'Com fio', 'Cabo de TV e internet antigo'],
              ['Micro-ondas', 'Sem fio', 'Wi-Fi, links de telecomunicação'],
            ],
          },
        ],
      },
      {
        id: 'classificacao',
        title: 'Como as redes são classificadas',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Para descrever e classificar uma rede de computadores, a literatura técnica usa quatro elementos. Todos eles importam:',
          },
          {
            kind: 'list',
            items: [
              'Topologia: o arranjo físico, como os equipamentos se conectam (estrela, anel, barramento).',
              'Meio de transmissão: com fio ou sem fio (cabo, fibra, Wi-Fi).',
              'Arquitetura de rede: o papel de cada participante (ex.: cliente-servidor).',
              'Protocolo: as regras da conversa entre os dispositivos.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'modelo-osi-tcpip',
    title: 'Modelo de Referência OSI e Arquitetura TCP/IP',
    subtitle:
      'Entenda, em linguagem simples, as 7 camadas do modelo OSI, a arquitetura TCP/IP em 4 camadas e como os dados viajam de um computador a outro.',
    sections: [
      {
        id: 'o-que-e-osi',
        title: 'O que é o modelo OSI',
        blocks: [
          {
            kind: 'paragraph',
            text: 'O modelo OSI (Open Systems Interconnection) é um "mapa" criado pela ISO em 1984 para ensinar e padronizar como dois computadores conversam. Ele divide toda a conversa em 7 andares (camadas), da aplicação até o cabo físico. Nenhum computador real segue as 7 camadas ao pé da letra, mas é a melhor forma de entender e projetar redes.',
          },
          {
            kind: 'analogy',
            text: 'Pense num prédio de 7 andares. Cada andar tem a sua função e só conversa com o andar de cima e o de baixo. Se você reformar o 2º andar, os outros continuam funcionando normalmente — é isso que as camadas fazem pelos sistemas de rede.',
          },
          {
            kind: 'diagram',
            type: 'osi-layers',
            caption: 'As 7 camadas do modelo OSI e um exemplo do dia a dia para cada uma. Clique em reproduzir para ver o pacote “descendo” as camadas.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Regras de ouro das camadas',
            text: 'Cada camada usa os serviços da camada de baixo e oferece serviços para a de cima. Assim, um problema em um andar pode ser corrigido sem quebrar os outros — é por isso que redes evoluem aos poucos.',
          },
        ],
      },
      {
        id: 'camadas-superiores',
        title: 'Camadas de Aplicação, Apresentação e Sessão',
        blocks: [
          {
            kind: 'paragraph',
            text: 'As três camadas de cima são as que o usuário "sente". Elas cuidam da conversa entre os programas, do formato dos dados e do controle da sessão.',
          },
          {
            kind: 'table',
            headers: ['Camada', 'Função', 'Exemplo do dia a dia'],
            rows: [
              ['Aplicação (7)', 'É o programa que você usa; define as regras da conversa', 'Navegador, e-mail, WhatsApp; protocolos HTTP, SMTP, DNS'],
              ['Apresentação (6)', 'Traduz, formata e compacta os dados (e faz criptografia)', 'Converte uma imagem para abrir no seu celular'],
              ['Sessão (5)', 'Abre, mantém e encerra o "diálogo" entre os programas', 'O login que mantém você conectado ao site'],
            ],
          },
          {
            kind: 'analogy',
            text: 'A camada de aplicação é a vitrine da loja (o que você vê), a apresentação é o tradutor que fala com o cliente estrangeiro (adapta o formato) e a sessão é o telefone: você disca, conversa e desliga quando termina — e se a ligação cair, redisca.',
          },
        ],
      },
      {
        id: 'camadas-inferiores',
        title: 'Camadas de Transporte, Rede, Enlace e Física',
        blocks: [
          {
            kind: 'paragraph',
            text: 'As quatro camadas de baixo são as que fazem o trabalho pesado: dividir os dados, encontrar o caminho e transformar tudo em sinais.',
          },
          {
            kind: 'table',
            headers: ['Camada', 'PDU', 'O que faz', 'Exemplo do dia a dia'],
            rows: [
              ['Transporte (4)', 'Segmento', 'Divide a mensagem e garante a entrega (TCP) ou entrega direto (UDP)', 'A empresa de entregas que confirma cada encomenda'],
              ['Rede (3)', 'Datagrama', 'Endereça com IP e escolhe o caminho entre redes', 'O carteiro que descobre a rota até outra cidade'],
              ['Enlace (2)', 'Quadro', 'Entrega dentro da mesma rede usando o endereço MAC', 'O entregador do bairro que sabe a casa exata'],
              ['Física (1)', 'Bits', 'Transforma os dados em sinais elétricos, luz ou ondas', 'A estrada: cabos, fibra ótica e Wi-Fi'],
            ],
          },
          {
            kind: 'analogy',
            text: 'Uma encomenda sua passa por etapas: o entregador do bairro (enlace) a leva até o centro de distribuição; o sistema de rotas (rede) escolhe a estrada para outra cidade; a transportadora (transporte) confirma que ela chegou; e a estrada em si (física) é por onde o caminhão anda.',
          },
        ],
      },
      {
        id: 'encapsulamento',
        title: 'Como os dados viajam: encapsulamento',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Quando um computador envia dados, a informação "desce" pelas camadas. Cada camada pega o pacote que recebeu da camada de cima, adiciona o seu próprio cabeçalho (um envelope com as informações dela) e passa para a camada de baixo. No destino, o processo é inverso: cada camada lê e remove o seu cabeçalho, subindo até a aplicação.',
          },
          {
            kind: 'diagram',
            type: 'osi-pipeline',
            caption: 'O pacote desce no emissor ganhando cabeçalhos (encapsulamento), atravessa o meio físico e sobe no receptor sendo "desempacotado" (desencapsulamento).',
          },
          {
            kind: 'analogy',
            text: 'É como a boneca russa: você embala um presente, coloca numa caixa, escreve o endereço e lacra com fita. Quem recebe vai desembalando camada por camada até chegar no presente. Cada camada da rede é uma "caixa" a mais.',
          },
          {
            kind: 'diagram',
            type: 'encapsulation',
            caption: 'Cada camada dá um nome ao pacote: Mensagem (aplicação), Segmento (transporte), Datagrama (rede) e Quadro (enlace).',
          },
          {
            kind: 'diagram',
            type: 'layers',
            caption: 'Cada camada "conversa" com a mesma camada no outro computador — as camadas pares falam a mesma língua.',
          },
          {
            kind: 'callout',
            tone: 'info',
            title: 'O conceito de PDU',
            text: 'PDU (Protocol Data Unit) é o nome que cada camada dá ao pacote. Decorar esses nomes cai direto em provas: Mensagem → Segmento → Datagrama → Quadro → Bits.',
          },
        ],
      },
      {
        id: 'tcp-ip',
        title: 'A arquitetura TCP/IP',
        blocks: [
          {
            kind: 'paragraph',
            text: 'O modelo OSI é ótimo para aprender, mas a Internet de verdade usa o modelo TCP/IP, criado nos anos 1970 para o projeto ARPANET. Ele é mais enxuto: tem apenas 4 camadas, porque junta as camadas que têm funções parecidas no OSI.',
          },
          {
            kind: 'diagram',
            type: 'tcpip-layers',
            caption: 'As 4 camadas do TCP/IP e a correspondência com o modelo OSI. As camadas 5, 6 e 7 do OSI viraram a camada de Aplicação; as camadas 1 e 2 viraram o Acesso à Rede.',
          },
          {
            kind: 'table',
            headers: ['TCP/IP', 'Equivale no OSI', 'Protocolos principais'],
            rows: [
              ['Aplicação', 'Camadas 7, 6 e 5', 'HTTP, SMTP, DNS, FTP'],
              ['Transporte', 'Camada 4', 'TCP e UDP'],
              ['Internet', 'Camada 3', 'IP, ICMP, ARP'],
              ['Acesso à Rede', 'Camadas 2 e 1', 'Ethernet, Wi-Fi, fibra'],
            ],
          },
          {
            kind: 'analogy',
            text: 'O modelo OSI é a planta do prédio (a teoria completa e organizada); o TCP/IP é o prédio já construído e funcionando (o que roda na Internet hoje). Estudar os dois é entender tanto o projeto quanto a prática.',
          },
        ],
      },
      {
        id: 'revisao',
        title: 'Revisão rápida e macetes',
        blocks: [
          {
            kind: 'paragraph',
            text: 'Para a prova, o essencial é saber: quantas camadas cada modelo tem, os nomes das camadas, a PDU de cada uma, um protocolo exemplo e a ordem. Guarde os nomes das camadas do OSI de baixo para cima: Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação.',
          },
          {
            kind: 'callout',
            tone: 'tip',
            title: 'Macete para memorizar',
            text: 'Lembre da frase: "FERNANDO Exige Redes Todo Sábado Até Amanhã". As iniciais são F-E-R-T-S-A-A, exatamente as 7 camadas do OSI de baixo para cima: Física, Enlace, Rede, Transporte, Sessão, Apresentação, Aplicação.',
          },
          {
            kind: 'list',
            items: [
              'OSI tem 7 camadas; TCP/IP tem 4 camadas.',
              'O TCP/IP une as camadas 5, 6 e 7 do OSI (Aplicação) e as camadas 1 e 2 (Acesso à Rede).',
              'PDUs em ordem: Mensagem, Segmento, Datagrama, Quadro, Bits.',
              'TCP é confiável e orientado à conexão; UDP é rápido e não confiável.',
              'Encapsulamento é adicionar cabeçalhos no envio; desencapsulamento é removê-los no recebimento.',
            ],
          },
          {
            kind: 'callout',
            tone: 'warning',
            title: 'Atenção às pegadinhas',
            text: 'Enlace não roteia entre redes — isso é função da camada de Rede. E "apresentação" cuida do formato dos dados, não da abertura da conexão (isso é a Sessão). Leia a pergunta com calma.',
          },
        ],
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}