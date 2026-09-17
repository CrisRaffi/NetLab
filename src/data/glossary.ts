export interface GlossaryTerm {
  term: string;
  short: string;
  lay: string;
}

export interface GlossaryCategory {
  id: string;
  label: string;
  terms: GlossaryTerm[];
}

export const GLOSSARY: GlossaryCategory[] = [
  {
    id: 'fundamentos',
    label: 'Fundamentos',
    terms: [
      {
        term: 'IP',
        short: 'Endereço lógico que identifica um dispositivo na rede.',
        lay: 'É o "endereço de entrega" do equipamento. Como o número de uma casa na rua: sem ele, nada chega ao destino.',
      },
      {
        term: 'Máscara de sub-rede',
        short: 'Define qual parte do IP é a "rua" e qual é o "número da casa".',
        lay: 'Imagine o IP como "Rua 192.168.1, casa 10". A máscara (ex: 255.255.255.0) diz ao equipamento: "192.168.1 é a rua, 10 é a casa". Dispositivos na mesma rua se falam direto; os de outra rua precisam do porta-voz (gateway).',
      },
      {
        term: 'Gateway',
        short: 'Porta de saída para outras redes.',
        lay: 'É o "portão de saída do condomínio". O IP aqui é do roteador que leva o tráfego para fora da sua rede.',
      },
      {
        term: 'MAC',
        short: 'Endereço físico gravado na placa de rede.',
        lay: 'É a "identidade" da placa, como um número de série da porta da casa. O IP pode mudar, o MAC nasce com o equipamento e não muda.',
      },
      {
        term: 'DNS',
        short: 'Serviço que traduz nomes em IPs.',
        lay: 'É o "agenda telefônica" da Internet: você digita "gmail.com" e ele diz qual número (IP) discar.',
      },
      {
        term: 'Host',
        short: 'Qualquer equipamento que envia ou recebe dados.',
        lay: 'É qualquer "morador" da rede: PC, celular, servidor, impressora...',
      },
    ],
  },
  {
    id: 'dispositivos',
    label: 'Dispositivos',
    terms: [
      {
        term: 'Hub',
        short: 'Repetidor de camada 1: espalha o sinal para todas as portas.',
        lay: 'É como um corredor onde todo mundo grita o pacote de uma vez: todas as casas ouvem, mas só a dona do pacote pega. Ineficiente, mas simples.',
      },
      {
        term: 'Switch',
        short: 'Equipamento de camada 2 que entrega o quadro só para quem deve.',
        lay: 'É o "porteiro inteligente do prédio": ele aprende qual apartamento mora em cada porta e entrega o pacote na porta certa, sem incomodar os outros.',
      },
      {
        term: 'Roteador',
        short: 'Interliga redes diferentes (camada 3).',
        lay: 'É o "agente de viagens" entre bairros: sabe qual rua leva a qual bairro e despacha o pacote pelo caminho certo até outra rede.',
      },
      {
        term: 'Access Point (AP)',
        short: 'Estende a rede com conexão sem fio (WiFi).',
        lay: 'É a "antena do WiFi": pega a rede com fio e a transforma em sinal sem fio para celulares e notebooks.',
      },
      {
        term: 'Firewall',
        short: 'Filtra o que pode entrar e sair da rede.',
        lay: 'É o "segurança da portaria": deixa passar só o que está autorizado e bloqueia o suspeito.',
      },
      {
        term: 'Servidor',
        short: 'Equipamento que presta serviços (site, arquivos, DNS, e-mail).',
        lay: 'É a "loja do bairro": os clientes (hosts) vão até ele buscar produtos/serviços.',
      },
      {
        term: 'Nuvem / Provedor',
        short: 'Representa a Internet e a rede do seu provedor.',
        lay: 'É o "mundo lá fora": tudo o que fica do outro lado do portão (gateway).',
      },
    ],
  },
  {
    id: 'protocolos',
    label: 'Protocolos',
    terms: [
      {
        term: 'Ethernet',
        short: 'Padrão de rede com fio (cabo).',
        lay: 'É a "língua" que os equipamentos falam quando estão ligados por cabo.',
      },
      {
        term: 'WiFi',
        short: 'Padrão de rede sem fio (802.11).',
        lay: 'É a mesma "língua" da Ethernet, mas pelo ar — sem cabo, usando ondas de rádio.',
      },
      {
        term: 'ARP',
        short: 'Descobre o MAC a partir do IP.',
        lay: 'É quando alguém pergunta no corredor do condomínio: "Quem aqui é a casa 10? Me diz sua identidade (MAC) para eu te entregar o pacote."',
      },
      {
        term: 'ICMP / Ping',
        short: 'Comando que testa se um destino responde.',
        lay: 'É o "tem alguém em casa?" dinâmico: você bate na porta e espera o "estou aqui!" de volta.',
      },
      {
        term: 'TCP/UDP',
        short: 'Transporte de dados: confiável (TCP) ou rápido (UDP).',
        lay: 'TCP é carta registrada (entregue e confirmada); UDP é carta normal (jogada fora sem confirmação).',
      },
      {
        term: 'DHCP',
        short: 'Distribui IP automaticamente.',
        lay: 'É o "porteiro que dá o número da casa" assim que o morador chega — sem precisar escolher na mão.',
      },
      {
        term: 'Broadcast',
        short: 'Envio para todos ao mesmo tempo.',
        lay: 'É anunciar pelo "auto-falante do prédio": todo mundo ouve, só quem for afetado responde.',
      },
    ],
  },
  {
    id: 'conceitos',
    label: 'Conceitos',
    terms: [
      {
        term: 'Pacote / Quadro',
        short: 'Unidade de dados que viaja na rede (em camadas).',
        lay: 'É a "encomenda com envelope": dentro do quadro (envelope) vai o pacote (conteúdo). Cada camada cola um novo rótulo no envelope.',
      },
      {
        term: 'Flooding',
        short: 'Replicar o quadro para todas as portas (comportamento de hub).',
        lay: 'É enviar a mesma encomenda para todos os apartamentos de uma vez — só o destinatário abre.',
      },
      {
        term: 'Domínio de colisão',
        short: 'Trecho onde só um transmite por vez (hub).',
        lay: 'É um "corredor de mão única": se dois moradores falam ao mesmo tempo, dá confusão e precisa repetir.',
      },
      {
        term: 'Rota',
        short: 'Instrução de qual gateway usar para chegar a cada rede.',
        lay: 'É o "mapa do entregador": para ir ao bairro X, passe pelo portão Y.',
      },
      {
        term: 'TTL',
        short: 'Número máximo de saltos do pacote (evita loop).',
        lay: 'É o "limite de entregas na viagem": se o pacote não achar o destino em X saltos, é descartado para não ficar vagando para sempre.',
      },
      {
        term: 'Banda e latência',
        short: 'Banda é a "largura" do cano; latência é o "tempo" de viagem.',
        lay: 'Banda = quantos pacotes cabem de uma vez; latência = quanto tempo leva para chegar. Cano largo e rápido é o ideal.',
      },
      {
        term: 'VLAN',
        short: 'Segmentação lógica da rede.',
        lay: 'É dividir o mesmo prédio em "andares" lógicos: mesmo sendo um único patch de cabos, cada andar é uma rede separada.',
      },
    ],
  },
];