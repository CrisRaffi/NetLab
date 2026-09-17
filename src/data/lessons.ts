export type DiagramType = 'layers' | 'encapsulation' | 'handshake' | 'dns';

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
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}