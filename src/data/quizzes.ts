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
  {
    id: 'quiz-osi-tcpip',
    name: 'Modelo de Referência OSI e Arquitetura TCP/IP',
    description:
      'Questões sobre as 7 camadas do modelo OSI, a arquitetura TCP/IP em 4 camadas, o encapsulamento e as PDUs de cada camada.',
    topic: 'Camadas de Rede',
    questions: [
      {
        id: 'q1',
        statement:
          'O encapsulamento em um modelo de camadas ocorre quando:',
        alternatives: [
          {
            letter: 'A',
            text: 'A camada superior recebe os dados da camada inferior e retira o cabeçalho',
          },
          {
            letter: 'B',
            text: 'Uma camada conversa diretamente com a sua equivalente em outro computador',
          },
          {
            letter: 'C',
            text: 'A camada física converte os dados em sinais elétricos, luz ou ondas',
          },
          {
            letter: 'D',
            text: 'A camada inferior recebe, pela interface, os dados da camada superior, adicionando o próprio cabeçalho',
          },
          {
            letter: 'E',
            text: 'A camada de transporte divide a mensagem em pedaços chamados segmentos',
          },
        ],
        correctIndex: 3,
        explanation:
          'Encapsular é "empacotar": no envio, cada camada inferior recebe os dados da camada de cima (pela interface entre elas) e adiciona o SEU próprio cabeçalho, como quem embrulha uma caixa em outra. No destino acontece o contrário (desencapsulamento), com cada camada lendo e retirando o seu cabeçalho.',
      },
      {
        id: 'q2',
        statement:
          'O modelo OSI define uma arquitetura em camadas. Qual camada é responsável por garantir a comunicação confiável entre processos de origem e destino?',
        alternatives: [
          { letter: 'A', text: 'Transporte' },
          { letter: 'B', text: 'Rede' },
          { letter: 'C', text: 'Enlace' },
          { letter: 'D', text: 'Sessão' },
          { letter: 'E', text: 'Nenhuma das alternativas anteriores' },
        ],
        correctIndex: 0,
        explanation:
          'A camada de TRANSPORTE é a "empresa de entregas": ela divide os dados em segmentos e garante (com o TCP) que cada um chegue inteiro ao programa certo. Rede cuida do endereçamento IP, Enlace entrega no mesmo bairro e Sessão controla o diálogo entre aplicações.',
      },
      {
        id: 'q3',
        statement:
          'De acordo com a padronização do modelo OSI, é correto afirmar que:',
        alternatives: [
          {
            letter: 'A',
            text: 'A camada de enlace é responsável pelo roteamento entre redes diferentes',
          },
          {
            letter: 'B',
            text: 'A camada de sessão converte o formato dos dados para serem exibidos',
          },
          {
            letter: 'C',
            text: 'A camada de transporte adiciona os endereços MAC aos dados',
          },
          {
            letter: 'D',
            text: 'A camada inferior fornece serviços para a camada imediatamente superior',
          },
          {
            letter: 'E',
            text: 'A camada de aplicação transforma os dados em bits no meio físico',
          },
        ],
        correctIndex: 3,
        explanation:
          'A grande regra do modelo em camadas: cada camada usa os serviços da camada de baixo e oferece serviços para a de cima. O roteamento é da camada de REDE, a conversão de formato é da APRESENTAÇÃO, os endereços MAC são da camada de ENLACE e os bits são a FÍSICA.',
      },
      {
        id: 'q4',
        statement:
          'Em qual camada do modelo OSI trabalha um roteador (router)?',
        alternatives: [
          { letter: 'A', text: 'Física' },
          { letter: 'B', text: 'Enlace' },
          { letter: 'C', text: 'Rede' },
          { letter: 'D', text: 'Transporte' },
          { letter: 'E', text: 'Sessão' },
        ],
        correctIndex: 2,
        explanation:
          'O roteador é o "carteiro que escolhe a rota": ele lê o endereço IP (endereço lógico) e decide por qual caminho enviar o datagrama para outra rede. Por isso ele trabalha na camada de REDE. Já o switch, que entrega dentro do mesmo bairro usando o MAC, trabalha na camada de ENLACE.',
      },
      {
        id: 'q5',
        statement:
          'Na arquitetura TCP/IP, qual das opções relaciona, respectivamente, um protocolo da camada de Aplicação, um da camada de Transporte e um da camada de Internet?',
        alternatives: [
          { letter: 'A', text: 'HTTP, UDP e IP' },
          { letter: 'B', text: 'IP, TCP e HTTP' },
          { letter: 'C', text: 'TCP, IP e HTTP' },
          { letter: 'D', text: 'SMTP, IP e UDP' },
          { letter: 'E', text: 'Ethernet, HTTP e IP' },
        ],
        correctIndex: 0,
        explanation:
          'Na ordem certa (Aplicação → Transporte → Internet): HTTP (navegador), UDP (transporte rápido) e IP (endereçamento). Ethernet, apesar de muito usada, é da camada de ACESSO À REDE, e não da Internet.',
      },
      {
        id: 'q6',
        statement:
          'O modelo OSI pode ser considerado o "pai" da ideia de dividir a comunicação em camadas e, na sua padronização, definiu que:',
        alternatives: [
          {
            letter: 'A',
            text: 'A camada de enlace garante o encaminhamento de ponta a ponta entre redes',
          },
          {
            letter: 'B',
            text: 'A camada de apresentação é responsável por garantir a interoperabilidade dos sistemas',
          },
          {
            letter: 'C',
            text: 'A camada física controla o fluxo de dados entre os vizinhos de uma rede',
          },
          {
            letter: 'D',
            text: 'A camada de sessão encaminha os dados de nó a vizinho',
          },
          {
            letter: 'E',
            text: 'Todas as alternativas estão corretas',
          },
        ],
        correctIndex: 1,
        explanation:
          'A camada de APRESENTAÇÃO traduz e padroniza o formato dos dados (texto, imagem, vídeo, criptografia), permitindo que sistemas diferentes conversem — isso é interoperabilidade. O encaminhamento entre redes é da camada de REDE e o controle entre vizinhos é do ENLACE.',
      },
      {
        id: 'q7',
        statement:
          'A respeito das camadas do modelo OSI, é correto afirmar que:',
        alternatives: [
          {
            letter: 'A',
            text: 'Uma camada utiliza o serviço da camada inferior e oferece o seu serviço para a camada superior',
          },
          {
            letter: 'B',
            text: 'Uma camada utiliza o serviço da camada superior e oferece o seu serviço para a camada inferior',
          },
          {
            letter: 'C',
            text: 'Cada camada é totalmente independente e nunca se comunica com as outras',
          },
          {
            letter: 'D',
            text: 'A camada de apresentação é responsável pelo roteamento dos pacotes',
          },
          {
            letter: 'E',
            text: 'A camada de transporte trabalha com os endereços IP dos dispositivos',
          },
        ],
        correctIndex: 0,
        explanation:
          'No modelo de camadas, a comunicação é vertical: cada camada recebe o serviço da de baixo e presta o seu próprio serviço à de cima. A ideia de "camadas independentes" está errada — elas cooperam o tempo todo. Roteamento é da camada de REDE e endereços IP também.',
      },
      {
        id: 'q8',
        statement:
          'Qual camada do modelo OSI é responsável pelo endereçamento lógico (endereços IP) e pelo roteamento entre redes diferentes?',
        alternatives: [
          { letter: 'A', text: 'Física' },
          { letter: 'B', text: 'Enlace' },
          { letter: 'C', text: 'Rede' },
          { letter: 'D', text: 'Transporte' },
          { letter: 'E', text: 'Aplicação' },
        ],
        correctIndex: 2,
        explanation:
          'A camada de REDE usa o endereço IP (endereço lógico, que pode mudar de rede para rede) e decide a rota que o datagrama vai seguir até chegar ao destino. O endereço MAC da camada de ENLACE é físico (gravado de fábrica) e só importa dentro do mesmo bairro.',
      },
      {
        id: 'q9',
        statement:
          'No modelo de camadas, o processo no qual o emissor adiciona cabeçalhos à medida que os dados "descem" pelas camadas é chamado de:',
        alternatives: [
          { letter: 'A', text: 'Desencapsulamento' },
          { letter: 'B', text: 'Encapsulamento' },
          { letter: 'C', text: 'Multiplexação' },
          { letter: 'D', text: 'Fragmentação' },
          { letter: 'E', text: 'Roteamento' },
        ],
        correctIndex: 1,
        explanation:
          'ENCAPSULAMENTO é "empacotar": no envio, cada camada adiciona o seu cabeçalho. O DESENCAPSULAMENTO é o contrário: no recebimento, cada camada lê e remove o seu cabeçalho. Fragmentação é dividir os dados em pedaços, e roteamento é escolher o caminho.',
      },
      {
        id: 'q10',
        statement:
          'A arquitetura TCP/IP, que é a base real da Internet, é composta por quantas camadas?',
        alternatives: [
          { letter: 'A', text: '3 camadas' },
          { letter: 'B', text: '4 camadas' },
          { letter: 'C', text: '5 camadas' },
          { letter: 'D', text: '6 camadas' },
          { letter: 'E', text: '7 camadas' },
        ],
        correctIndex: 1,
        explanation:
          'O TCP/IP tem 4 camadas: Aplicação, Transporte, Internet e Acesso à Rede. Ele é mais enxuto que o OSI (7 camadas) porque junta as camadas 5, 6 e 7 em uma só (Aplicação) e as camadas 1 e 2 em uma só (Acesso à Rede).',
      },
    ],
  },
];

export function getQuizById(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}