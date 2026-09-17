export interface QuizAlternative {
  letter: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  statement: string;
  alternatives: QuizAlternative[];
  correctIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  topic: string;
  questions: QuizQuestion[];
}

export const QUIZZES: Quiz[] = [
  {
    id: 'quiz-transporte-pdu',
    name: 'Camada de Transporte e PDUs',
    description:
      'Questões sobre os protocolos TCP/UDP, unidades de dados de protocolo (PDUs) em cada camada e o funcionamento da camada de transporte.',
    topic: 'Camadas de Rede',
    questions: [
      {
        id: 'q1',
        statement:
          'A camada de transporte carrega mensagens da camada de aplicação entre os lados do cliente e servidor de uma aplicação. Há dois protocolos de transporte na Internet: TCP e UDP.\n\nSão serviços oferecidos pelo protocolo TCP:\nI. Transferência de dados confiável.\nII. Serviço não orientado à conexão.\nIII. Fragmentação em segmentos.\n\nMarque a alternativa que possui todos os serviços corretos.',
        alternatives: [
          { letter: 'A', text: 'I, II' },
          { letter: 'B', text: 'I, II, III' },
          { letter: 'C', text: 'I, III' },
          { letter: 'D', text: 'I' },
          { letter: 'E', text: 'II' },
        ],
        correctIndex: 2,
        explanation:
          'Imagine o TCP como um entregador que liga para o destino, avisa que vai chegar e confirma cada entrega. Ele é "orientado à conexão": antes de enviar os dados, ele combina com o destino como vai entregar. Por isso o item II (não orientado à conexão) está errado — isso é coisa do UDP, que não faz combinação nenhuma. Os serviços certos do TCP são: entregar os dados com confirmação (item I) e cortar a mensagem em pedaços chamados segmentos (item III).',
      },
      {
        id: 'q2',
        statement:
          'Em cada camada, uma Unidade de Dados de Protocolo, ou PDU (Protocol Data Unit), possui um campo de cabeçalho e um campo de carga útil.\n\nDentre as opções a seguir, qual é o nome da PDU da camada de aplicação?',
        alternatives: [
          { letter: 'A', text: 'Quadro' },
          { letter: 'B', text: 'Célula' },
          { letter: 'C', text: 'Mensagem' },
          { letter: 'D', text: 'Segmento' },
          { letter: 'E', text: 'Rótulo' },
        ],
        correctIndex: 2,
        explanation:
          'Cada camada dá um nome diferente ao "pacote de dados" que manipula, igual cada setor de uma empresa chama o mesmo documento de um jeito. Na camada de aplicação (os programas: navegador, e-mail, WhatsApp), esse pacote se chama MENSAGEM. Nas outras camadas: transporte = segmento (TCP), rede = datagrama (IP) e enlace = quadro.',
      },
      {
        id: 'q3',
        statement:
          'A reflexão de energia eletromagnética ocorre em um meio de transmissão, que se propaga pelo espaço e carrega energia eletromagnética. A luz visível que vem de uma lâmpada em sua casa ou da estação de rádio são dois tipos de radiação eletromagnética.\n\nÉ um exemplo de meio eletromagnético utilizado em redes Wi-Fi?',
        alternatives: [
          { letter: 'A', text: 'Fibra ótica' },
          { letter: 'B', text: 'Cabo coaxial' },
          { letter: 'C', text: 'Cabo de par trançado' },
          { letter: 'D', text: 'Cabo USB' },
          { letter: 'E', text: 'Micro-ondas' },
        ],
        correctIndex: 4,
        explanation:
          'O Wi-Fi não usa fios: ele transmite por ONDAS no ar (do tipo micro-ondas, na faixa de 2.4 e 5 GHz — as mesmas ondas do forno micro-ondas, mas com bem menos potência). Na lista, só a opção "Micro-ondas" é um meio sem fio. Fibra e cabos são meios com fio, e cabo USB não é usado para rede.',
      },
      {
        id: 'q4',
        statement:
          'Um sistema de comunicação é um conjunto de entidades (ou partes) coordenadas, que concorrem para a realização de um determinado objetivo — algo, usualmente, que serve de suporte.\n\nQual é o termo relacionado ao conjunto de entidades participantes interligadas por um sistema de comunicação capaz de trocar informações e compartilhar recursos?',
        alternatives: [
          { letter: 'A', text: 'Unidade de processamento' },
          { letter: 'B', text: 'Redes de Computadores' },
          { letter: 'C', text: 'Fluxo de Dados' },
          { letter: 'D', text: 'Redes locais' },
          { letter: 'E', text: 'Elementos desconhecidos' },
        ],
        correctIndex: 1,
        explanation:
          'O termo é REDES DE COMPUTADORES: vários computadores e dispositivos ligados entre si para trocar informações e compartilhar recursos (como uma impressora em casa ou um arquivo no escritório). Cuidado: "redes locais" (LAN) é apenas um tipo de rede, não o nome geral que aparece na definição.',
      },
      {
        id: 'q5',
        statement:
          'Na Internet, as redes de computadores podem ser classificadas de várias formas, sempre com base em fundamentos confiáveis e validados.\n\nNa literatura formal, são elementos para a classificação de redes de computadores:\nI. Topologia\nII. Meio de transmissão\nIII. Arquitetura de rede\nIV. Protocolo\n\nMarque a alternativa que possui todos os elementos corretos.',
        alternatives: [
          { letter: 'A', text: 'I e II' },
          { letter: 'B', text: 'I, II e III' },
          { letter: 'C', text: 'II e III' },
          { letter: 'D', text: 'I, III e IV' },
          { letter: 'E', text: 'I, II, III e IV' },
        ],
        correctIndex: 4,
        explanation:
          'Para classificar uma rede, os estudiosos olham para 4 coisas: a topologia (como os equipamentos estão arrumados, tipo estrela ou anel), o meio de transmissão (com fio ou sem fio), a arquitetura (o papel de cada um, como cliente-servidor) e o protocolo (as regras da conversa). Os quatro elementos são importantes, então a resposta é I, II, III e IV.',
      },
      {
        id: 'q6',
        statement:
          'Em cada camada, uma Unidade de Dados de Protocolo, ou PDU (Protocol Data Unit), possui um campo de cabeçalho e um campo de carga útil.\n\nQual é o nome da PDU do protocolo TCP?',
        alternatives: [
          { letter: 'A', text: 'Quadro' },
          { letter: 'B', text: 'Célula' },
          { letter: 'C', text: 'Mensagem' },
          { letter: 'D', text: 'Rótulo' },
          { letter: 'E', text: 'Segmento' },
        ],
        correctIndex: 4,
        explanation:
          'O TCP recorta a mensagem em pedaços, e cada pedaço se chama SEGMENTO. É como cortar um texto grande em várias folhas: cada folha (segmento) recebe um cabeçalho com o número da página para serem montadas na ordem certa no destino.',
      },
      {
        id: 'q7',
        statement:
          'Em cada camada, uma Unidade de Dados de Protocolo, ou PDU (Protocol Data Unit), possui um campo de cabeçalho e um campo de carga útil.\n\nQual é o nome da PDU do protocolo IP?',
        alternatives: [
          { letter: 'A', text: 'Quadro' },
          { letter: 'B', text: 'Datagrama' },
          { letter: 'C', text: 'Mensagem' },
          { letter: 'D', text: 'Segmento' },
          { letter: 'E', text: 'Rótulo' },
        ],
        correctIndex: 1,
        explanation:
          'O IP trabalha na camada de rede e chama seu pacote de dados de DATAGRAMA. É o envelope que leva os endereços IP de quem envia e de quem recebe (é nele que aparece o famoso "192.168.1.1"). Atenção: o UDP também usa a palavra "datagrama", mas na camada de transporte.',
      },
      {
        id: 'q8',
        statement:
          'A camada de transporte carrega mensagens da camada de aplicação entre os lados do cliente e servidor de uma aplicação. Há dois protocolos de transporte na Internet: TCP e UDP.\n\nSão serviços oferecidos pelo protocolo TCP:\nI. Transferência de dados confiável.\nII. Serviço não orientado à conexão.\nIII. Fragmentação em segmentos.\n\nMarque a alternativa que possui todos os serviços corretos.',
        alternatives: [
          { letter: 'A', text: 'I, II' },
          { letter: 'B', text: 'I, II, III' },
          { letter: 'C', text: 'I, III' },
          { letter: 'D', text: 'I' },
          { letter: 'E', text: 'II' },
        ],
        correctIndex: 2,
        explanation:
          'O TCP é "orientado à conexão": ele combina com o destino antes de mandar os dados (um aperto de mão para acordar a conversa). Por isso o item II está errado — não ser orientado à conexão é característica do UDP. Os serviços certos do TCP são a entrega confiável com confirmação (I) e a divisão em segmentos (III).',
      },
      {
        id: 'q9',
        statement:
          'Em cada camada, uma Unidade de Dados de Protocolo, ou PDU (Protocol Data Unit), possui um campo de cabeçalho e um campo de carga útil.\n\nDentre as opções a seguir, qual é o nome da PDU da camada de enlace de dados?',
        alternatives: [
          { letter: 'A', text: 'Quadro' },
          { letter: 'B', text: 'Datagrama' },
          { letter: 'C', text: 'Mensagem' },
          { letter: 'D', text: 'Segmento' },
          { letter: 'E', text: 'Rótulo' },
        ],
        correctIndex: 0,
        explanation:
          'Na camada de enlace — a que conversa diretamente com o cabo ou o Wi-Fi — o pacote se chama QUADRO (frame em inglês). É o quadro que carrega os endereços MAC (o "RG" de fábrica da placa de rede) e um selo de conferência para saber se os dados chegaram inteiros.',
      },
      {
        id: 'q10',
        statement:
          'O conteúdo da Internet utiliza endereços como .edu, .gov, .com, .mil, .org, .net e .int para nomear sites, sendo mais fácil lembrar do que a identificação anterior, como o endereço IP 192.0.2.44.\n\nDentre as opções a seguir, qual é o nome do sistema que converte nomes de domínio legíveis por humanos (por exemplo, www.example.com) em endereços IP legíveis por máquina (por exemplo, 192.0.2.44)?',
        alternatives: [
          { letter: 'A', text: 'FTP' },
          { letter: 'B', text: 'SMTP' },
          { letter: 'C', text: 'Telnet' },
          { letter: 'D', text: 'DNS' },
          { letter: 'E', text: 'POP' },
        ],
        correctIndex: 3,
        explanation:
          'O DNS é a agenda de contatos da Internet. Você não decora o número dos seus amigos, arranja pelo nome ("Julia") — o DNS faz isso com os sites: você digita www.example.com e ele devolve o número IP 192.0.2.44. As outras opções têm outras funções: FTP transfere arquivos, SMTP e POP cuidam de e-mail, e Telnet acessa computadores à distância.',
      },
    ],
  },
];

export function getQuizById(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}