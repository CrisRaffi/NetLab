# IMPLEMENTAÇÃO — MINIGAME INTERATIVO "A VIAGEM DO PACOTE"

Você está desenvolvendo uma plataforma de aprendizagem prática de Redes de Computadores.

Agora implemente um novo módulo educacional chamado:

# 🎮 A VIAGEM DO PACOTE

O objetivo desse módulo é ensinar as camadas de rede de forma **visual, interativa, lúdica e prática**, evitando que o aluno precise simplesmente decorar nomes e definições.

A experiência deve fazer o aluno compreender:

> "O que acontece com uma informação quando ela sai do meu computador e chega em outro computador?"

A filosofia principal deve ser:

> **Não memorize as camadas. Veja o que acontece com os dados.**

---

# 1. OBJETIVO PEDAGÓGICO

O módulo deve ensinar progressivamente:

- Modelo OSI
- Modelo TCP/IP
- encapsulamento
- desencapsulamento
- Ethernet
- MAC
- IP
- TCP
- UDP
- portas
- protocolos de aplicação
- bits
- transmissão física
- roteamento
- comunicação entre dispositivos
- relação entre camadas
- identificação de problemas por camada

O aluno deve aprender através de:

1. observar
2. interagir
3. errar
4. investigar
5. corrigir
6. visualizar o resultado
7. receber uma explicação curta
8. tentar novamente em um cenário diferente

Não transforme o módulo em um questionário tradicional.

---

# 2. CONCEITO PRINCIPAL

O módulo deve representar visualmente uma comunicação:

```text
┌──────────────┐
│      PC      │
│   CLIENTE    │
└──────┬───────┘
       │
       ▼
   ┌───────┐
   │ SWITCH│
   └───┬───┘
       │
       ▼
   ┌────────┐
   │ ROUTER │
   └───┬────┘
       │
       ▼
   ┌───────┐
   │ SERVER│
   └───────┘
```

O usuário envia uma informação:

> "Olá servidor!"

O sistema deve mostrar o que acontece com essa informação conforme ela desce pelas camadas.

---

# 3. EXPERIÊNCIA PRINCIPAL

O fluxo principal deve ser:

```text
APLICAÇÃO
    ↓
TRANSPORTE
    ↓
REDE
    ↓
ENLACE
    ↓
FÍSICA
    ↓
================
     REDE
================
    ↓
FÍSICA
    ↓
ENLACE
    ↓
REDE
    ↓
TRANSPORTE
    ↓
APLICAÇÃO
```

Representar visualmente o processo de:

## ENCAPSULAMENTO

```text
DADOS
  ↓
SEGMENTO
  ↓
PACOTE
  ↓
QUADRO
  ↓
BITS
```

E depois:

## DESENCAPSULAMENTO

```text
BITS
  ↓
QUADRO
  ↓
PACOTE
  ↓
SEGMENTO
  ↓
DADOS
```

Cada etapa deve ser animada.

---

# 4. MODELO OSI

O sistema deve apresentar as 7 camadas:

```text
7 — Aplicação
6 — Apresentação
5 — Sessão
4 — Transporte
3 — Rede
2 — Enlace de Dados
1 — Física
```

Cada camada deve possuir:

- número
- nome
- função
- exemplos
- unidade de dados
- dispositivos relacionados
- protocolos relacionados
- exemplos de problemas

Não apresentar tudo de uma vez.

As informações devem aparecer conforme o usuário interage.

---

# 5. MODELO TCP/IP

Criar também uma visualização do modelo TCP/IP.

Mostrar a relação:

```text
OSI                         TCP/IP

Aplicação ─────────────┐
Apresentação ──────────┼── Aplicação
Sessão ────────────────┘

Transporte ─────────────── Transporte

Rede ───────────────────── Internet

Enlace ────────────────┐
Física ────────────────┴── Acesso à Rede
```

Importante:

Não afirmar que os modelos são perfeitamente equivalentes.

O objetivo é mostrar a correspondência conceitual utilizada no estudo.

---

# 6. FASE 1 — MONTANDO O PACOTE

Criar o primeiro minigame.

O sistema apresenta:

```text
Você deseja enviar:

"Olá servidor!"
```

O usuário precisa montar o processo de encapsulamento.

Na tela aparecem cartões:

```text
DADOS
TCP
IP
ETHERNET
BITS
```

O usuário deve colocar cada elemento na posição correta.

Porém, não fazer apenas:

> "acerte a ordem".

Ao colocar cada item, mostrar uma pequena animação explicando o que foi adicionado.

Exemplo:

```text
DADOS

"Olá servidor!"
```

Depois:

```text
TCP
┌────────────────────────┐
│ PORTA ORIGEM: 50000    │
│ PORTA DESTINO: 80      │
│ DADOS: "Olá servidor!" │
└────────────────────────┘
```

Depois:

```text
IP
┌─────────────────────────────┐
│ ORIGEM: 192.168.1.10        │
│ DESTINO: 192.168.1.20       │
│ TCP                         │
│ DADOS                       │
└─────────────────────────────┘
```

Depois:

```text
ETHERNET
┌──────────────────────────────────┐
│ MAC ORIGEM                       │
│ MAC DESTINO                      │
│ IPv4                             │
│ TCP                              │
│ DADOS                            │
└──────────────────────────────────┘
```

Finalmente:

```text
BITS

010101010101001010101010...
```

---

# 7. ANIMAÇÃO DE ENCAPSULAMENTO

Após o usuário montar corretamente, permitir clicar:

# 🚀 ENVIAR PACOTE

A interface deve executar uma animação:

```text
PC CLIENTE
     │
     │  DADOS
     ▼
     │
     │  TCP + DADOS
     ▼
     │
     │  IP + TCP + DADOS
     ▼
     │
     │  ETHERNET + IP + TCP + DADOS
     ▼
     │
     │  BITS
     ▼
   SWITCH
```

O pacote deve viajar visualmente pela topologia.

---

# 8. INSPEÇÃO DO PACOTE

Durante a viagem, o usuário deve poder clicar no pacote.

Abrir um painel:

```text
🔍 INSPEÇÃO DO PACOTE

Camada 4 — Transporte

Protocolo:
TCP

Porta origem:
51542

Porta destino:
80

Estado:
SYN
```

Outro clique:

```text
Camada 3 — Rede

Protocolo:
IPv4

IP origem:
192.168.1.10

IP destino:
192.168.1.20
```

Outro:

```text
Camada 2 — Enlace

Tecnologia:
Ethernet

MAC origem:
AA:BB:CC:11:22:33

MAC destino:
AA:BB:CC:44:55:66
```

Criar uma visualização semelhante a um analisador simplificado de pacotes.

---

# 9. MODO PASSO A PASSO

Criar controles:

```text
⏮ Reiniciar
▶ Executar
⏸ Pausar
⏭ Próxima etapa
🔄 Repetir
```

Também permitir velocidade:

```text
0.5x
1x
2x
4x
```

O usuário deve conseguir acompanhar cada etapa individualmente.

---

# 10. "O QUE ESTÁ ACONTECENDO?"

Durante a simulação, apresentar perguntas contextuais.

Exemplo:

```text
❓ O pacote acabou de receber um endereço IP.

Qual camada está trabalhando neste momento?
```

Opções:

```text
○ Aplicação
○ Transporte
● Rede
○ Enlace
```

Após responder:

### Se acertar:

Mostrar:

```text
✓ Correto!

A camada de Rede trabalha com endereçamento lógico,
como IPv4, e permite que os dispositivos saibam
para onde o pacote deve ser encaminhado.

IP é uma das principais tecnologias dessa camada.
```

### Se errar:

Não simplesmente informar:

> "Errado."

Mostrar uma pista:

```text
💡 DICA

Pense:

"Qual informação permite identificar a origem
e o destino lógico de um dispositivo?"

[ TENTAR NOVAMENTE ]
```

---

# 11. SISTEMA DE DICAS

Nunca entregar imediatamente a resposta.

Criar níveis:

### Dica 1

Pergunta conceitual.

### Dica 2

Dar exemplo.

### Dica 3

Destacar visualmente a informação relevante.

### Dica 4

Eliminar alternativas incorretas.

### Dica 5

Mostrar a resposta com explicação.

Exemplo:

```text
💡 DICA 1

Essa camada trabalha com endereçamento lógico.

[Usar dica]
```

---

# 12. FASE 2 — DESENCAPSULAMENTO

Depois de aprender encapsulamento, inverter o desafio.

O servidor recebe:

```text
BITS
```

O usuário deve acompanhar:

```text
BITS
 ↓
QUADRO
 ↓
PACOTE
 ↓
SEGMENTO
 ↓
DADOS
```

A cada camada, o sistema deve mostrar o cabeçalho sendo removido.

Exemplo:

```text
ETHERNET

[ MAC DESTINO ]
[ MAC ORIGEM   ]
[ IP            ]
[ TCP           ]
[ DADOS         ]
```

Ao passar pela camada 2:

```text
[ IP            ]
[ TCP           ]
[ DADOS         ]
```

Ao passar pela camada 3:

```text
[ TCP           ]
[ DADOS         ]
```

Até chegar:

```text
"Olá servidor!"
```

---

# 13. FASE 3 — QUAL CAMADA ESTÁ COM PROBLEMA?

Criar um modo de troubleshooting.

O sistema monta uma rede:

```text
PC
 │
 ▼
SWITCH
 │
 ▼
ROUTER
 │
 ▼
SERVER
```

E introduz uma falha.

Exemplos:

### Problema 1

Cabo desconectado.

### Problema 2

Interface desativada.

### Problema 3

IP incorreto.

### Problema 4

Máscara incorreta.

### Problema 5

Gateway incorreto.

### Problema 6

Rota inexistente.

### Problema 7

Porta TCP bloqueada.

### Problema 8

DNS não resolve.

### Problema 9

Serviço HTTP indisponível.

### Problema 10

Problema de aplicação.

O usuário deve investigar.

---

# 14. MODO DETETIVE DE REDES 🕵️

Criar uma experiência chamada:

# DETETIVE DE REDES

Apresentar um incidente:

```text
🚨 INCIDENTE

O computador consegue acessar alguns dispositivos
da rede, mas não consegue acessar a Internet.

Investigue o problema.
```

O usuário recebe ferramentas:

```text
ipconfig
ping
tracert
arp
route
nslookup
netstat
```

As ferramentas podem ser inicialmente simuladas.

Exemplo:

```text
> ipconfig

IPv4 Address:
192.168.1.50

Subnet Mask:
255.255.255.0

Default Gateway:
192.168.2.1
```

O sistema pergunta:

```text
O que você percebeu?
```

Opções:

```text
○ IP incorreto
○ Máscara incorreta
● Gateway incompatível
○ DNS incorreto
```

Depois:

```text
Por que isso causa o problema?
```

O usuário deve escolher a explicação.

Isso é muito importante.

Não avaliar somente:

> "Você encontrou o erro?"

Avaliar também:

> "Você entendeu por que ele acontece?"

---

# 15. MODO "ARRUME A REDE"

Criar pequenos desafios visuais.

Exemplo:

```text
PC

IP:
192.168.10.25

Máscara:
255.255.255.0

Gateway:
192.168.20.1
```

O usuário precisa corrigir.

Permitir editar diretamente:

```text
IP:       [192.168.10.25]
Máscara:  [255.255.255.0]
Gateway:  [192.168.10.1]
```

Depois:

```text
[ TESTAR CONEXÃO ]
```

O sistema executa visualmente:

```text
PC
 ↓
Gateway
 ↓
Internet
```

Se funcionar:

```text
✓ CONEXÃO RESTABELECIDA
```

E explicar:

```text
O gateway precisa estar em uma rede alcançável
pelo computador.

O computador estava em:

192.168.10.0/24

Mas o gateway configurado estava em:

192.168.20.1
```

---

# 16. FASE 4 — ONDE O PACOTE PAROU?

Criar desafios onde o pacote literalmente para.

Exemplo:

```text
PC ─── SWITCH ─── ROUTER ─── SERVER
             ❌
```

O pacote não consegue avançar.

O usuário deve descobrir:

```text
Onde ocorreu a falha?
```

Possibilidades:

```text
Camada 1
Camada 2
Camada 3
Camada 4
Camada 7
```

Depois:

```text
Qual ferramenta você utilizaria?
```

Exemplo:

```text
ping
arp
ipconfig
tracert
nslookup
netstat
```

E finalmente:

```text
Qual hipótese você testaria?
```

Esse sistema deve ensinar o processo:

```text
SINTOMA
   ↓
HIPÓTESE
   ↓
TESTE
   ↓
RESULTADO
   ↓
INTERPRETAÇÃO
   ↓
CORREÇÃO
```

Esse fluxo deve ser uma das principais características pedagógicas do módulo.

---

# 17. REPRESENTAÇÃO VISUAL DAS CAMADAS

Criar uma coluna lateral mostrando:

```text
┌─────────────────────────┐
│ 7  APLICAÇÃO             │
├─────────────────────────┤
│ 6  APRESENTAÇÃO          │
├─────────────────────────┤
│ 5  SESSÃO                │
├─────────────────────────┤
│ 4  TRANSPORTE            │
├─────────────────────────┤
│ 3  REDE                  │
├─────────────────────────┤
│ 2  ENLACE                │
├─────────────────────────┤
│ 1  FÍSICA                │
└─────────────────────────┘
```

Durante a simulação, destacar a camada ativa.

Ao clicar em uma camada, mostrar:

- função
- exemplos
- protocolos
- PDU
- dispositivos
- problema típico
- exemplo real

---

# 18. PERSONIFICAÇÃO DAS CAMADAS

Opcionalmente criar personagens visuais discretos.

Exemplo:

```text
🧑‍💻 Aplicação
"Eu cuido da comunicação que o usuário utiliza."

🚚 Transporte
"Eu organizo a entrega entre aplicações."

🗺️ Rede
"Eu descubro para onde o pacote precisa ir."

📦 Enlace
"Eu entrego os dados dentro da rede local."

⚡ Física
"Eu transformo tudo em sinais/bits."
```

Não deixar infantil demais.

A estética deve parecer uma plataforma moderna de tecnologia.

---

# 19. DESIGN / UI

A interface deve seguir uma estética:

- dark mode
- moderna
- tecnológica
- glassmorphism moderado
- cards translúcidos
- bordas sutis
- animações suaves
- partículas discretas
- linhas representando conexões
- pacotes viajando pela rede
- microinterações
- feedback visual de sucesso/erro

Evitar:

- aparência infantil
- excesso de cores
- excesso de elementos
- interfaces parecidas com jogos infantis

A sensação deve ser:

> "Cisco Packet Tracer + jogo educativo + dashboard moderno."

---

# 20. ANIMAÇÕES

Priorizar animações que expliquem conceitos.

Exemplos:

### Pacote sendo criado

```text
DADOS
 ↓
TCP
 ↓
IP
 ↓
ETHERNET
```

### Pacote viajando

```text
●━━━━━━━━━━━━━━●
PC             SWITCH
```

### Roteamento

Mostrar o router analisando:

```text
Destino:

192.168.20.50

Tabela de rotas:

192.168.20.0/24
        ↓
     eth1
```

Depois encaminhar o pacote.

---

# 21. SISTEMA DE PONTUAÇÃO

Criar pontuação, mas não transformar velocidade na principal métrica.

Avaliar:

- respostas corretas
- número de tentativas
- uso de dicas
- capacidade de identificar a camada
- capacidade de escolher ferramenta
- capacidade de explicar o problema
- capacidade de corrigir a rede

Exemplo:

```text
🏆 RESULTADO

Problema resolvido!

Precisão:       92%
Investigação:   88%
Dicas usadas:   1
Tentativas:     2

XP: +150
```

Não penalizar excessivamente o erro.

O erro deve ser parte da aprendizagem.

---

# 22. SISTEMA DE PROGRESSÃO

Criar níveis:

```text
NÍVEL 1
Conhecendo as camadas

NÍVEL 2
Encapsulamento

NÍVEL 3
Desencapsulamento

NÍVEL 4
Identificando problemas

NÍVEL 5
Diagnóstico

NÍVEL 6
Sub-redes e endereçamento

NÍVEL 7
Switching

NÍVEL 8
Routing

NÍVEL 9
Serviços de rede

NÍVEL 10
Desafios reais
```

Liberar níveis progressivamente.

---

# 23. EXERCÍCIOS ADAPTATIVOS

O sistema deve acompanhar os erros do aluno.

Se o aluno erra frequentemente:

```text
Camada 2 — Enlace
```

o sistema deve apresentar novos exercícios relacionados à camada 2.

Exemplo:

```text
Você está tendo dificuldade em identificar
problemas relacionados ao enlace.

Vamos fazer um exercício mais simples.
```

Depois aumentar novamente a dificuldade.

---

# 24. REVISÃO ESPAÇADA

Registrar quais conceitos o aluno errou.

Exemplo:

```text
Você errou:

✓ Camada 1 — Física
✓ Camada 3 — Rede
⚠ Camada 4 — Transporte
⚠ Encapsulamento
```

Posteriormente apresentar exercícios de revisão.

---

# 25. BANCO DE EXERCÍCIOS

Não codificar todos os exercícios diretamente nos componentes.

Criar uma estrutura de dados.

Exemplo conceitual:

```json
{
  "id": "osi-001",
  "type": "identify_layer",
  "difficulty": 1,
  "title": "O pacote precisa de um endereço",
  "scenario": "O computador precisa descobrir para onde enviar os dados.",
  "options": ["Aplicação", "Transporte", "Rede", "Física"],
  "correctAnswer": "Rede",
  "hint": "...",
  "explanation": "...",
  "concepts": ["osi", "ipv4", "addressing"]
}
```

Criar uma arquitetura que permita adicionar novos exercícios sem alterar a lógica principal.

---

# 26. TIPOS DE EXERCÍCIO

O motor deve suportar pelo menos:

```text
identify_layer
order_layers
encapsulation
decapsulation
inspect_packet
find_failure
choose_tool
configure_ip
repair_network
routing
subnetting
multiple_choice
drag_drop
sequence
```

Arquitetar de forma extensível para novos tipos.

---

# 27. MOTOR DE SIMULAÇÃO

Criar uma camada independente para o motor da simulação.

Separar:

```text
UI
 ↓
Learning Engine
 ↓
Simulation Engine
 ↓
Network Model
```

O motor deve representar objetos como:

```text
Device
PC
Switch
Router
Server
AccessPoint
Firewall
Printer
Camera
```

E conexões:

```text
Ethernet
Wi-Fi
```

Mesmo que inicialmente somente PC, Switch, Router e Server sejam implementados.

---

# 28. MODELO DE PACOTE

Criar uma estrutura lógica para representar o pacote.

Conceitualmente:

```text
Packet
 ├── ApplicationData
 ├── TransportHeader
 ├── NetworkHeader
 ├── DataLinkHeader
 └── PhysicalRepresentation
```

Exemplo:

```text
Packet
{
    application:
    {
        protocol: "HTTP",
        data: "Olá servidor!"
    },

    transport:
    {
        protocol: "TCP",
        sourcePort: 51542,
        destinationPort: 80
    },

    network:
    {
        protocol: "IPv4",
        sourceIp: "192.168.1.10",
        destinationIp: "192.168.1.20"
    },

    dataLink:
    {
        protocol: "Ethernet",
        sourceMac: "...",
        destinationMac: "..."
    }
}
```

O modelo deve permitir futuramente adicionar:

- UDP
- ICMP
- DNS
- DHCP
- ARP
- IPv6
- VLAN
- NAT

---

# 29. MODO "CLIQUE PARA ENTENDER"

Em praticamente todos os elementos da simulação, permitir:

> "Clique para entender."

Exemplo:

Usuário clica em:

```text
192.168.1.20
```

Mostrar:

```text
IP DESTINO

Esse endereço identifica logicamente
o dispositivo que deve receber o pacote.

Ele pertence à camada de Rede.

Protocolo:
IPv4
```

Usuário clica em:

```text
80
```

Mostrar:

```text
PORTA 80

A porta identifica o serviço/aplicação
que deve receber os dados.

Camada:
Transporte

Normalmente associada ao HTTP.
```

---

# 30. MODO DESAFIO

Depois que o aluno dominar os exercícios básicos, criar:

# 🔥 DESAFIO RELÂMPAGO

Apresentar situações rápidas:

```text
❓ O cabo foi desconectado.

Qual camada?

[ responder ]
```

Depois:

```text
❓ O computador possui IP 192.168.1.50,
mas o gateway é 192.168.2.1.

Qual problema?

[ responder ]
```

Depois:

```text
❓ Ping por IP funciona,
mas ping pelo nome não funciona.

Onde investigar?

[ responder ]
```

Esse modo deve trabalhar raciocínio.

---

# 31. MODO "REDE REAL"

Criar cenários inspirados em problemas que um técnico de redes realmente encontra.

Exemplos:

### Cenário

```text
Computador conectado ao Wi-Fi,
mas não consegue acessar determinados serviços.
```

### Cenário

```text
Internet funciona por cabo,
mas não funciona pelo Wi-Fi.
```

### Cenário

```text
Ping funciona,
mas aplicação não conecta.
```

### Cenário

```text
Computador consegue acessar IP,
mas não consegue acessar domínio.
```

### Cenário

```text
Dois computadores possuem configurações aparentemente iguais,
mas apenas um consegue acessar o servidor.
```

O aluno deve investigar utilizando as ferramentas disponíveis.

---

# 32. FERRAMENTAS SIMULADAS

Criar inicialmente ferramentas educativas:

```text
ipconfig
ping
tracert
arp
route
nslookup
netstat
```

Exemplo:

```text
> ping 192.168.1.1

Pinging 192.168.1.1...

Reply from 192.168.1.1:
time=2ms

Reply from 192.168.1.1:
time=1ms
```

A saída deve ser determinada pelo estado da simulação.

Não criar apenas uma animação falsa desconectada do estado da rede.

---

# 33. EXPLICAÇÕES CONTEXTUAIS

Evitar textos gigantes.

Quando o aluno errar, explicar em 2 níveis:

### Explicação rápida

```text
O gateway está em outra rede.
Por isso o computador não consegue
usá-lo como saída para outras redes.
```

### Quero entender melhor

Abrir explicação detalhada:

```text
Um gateway padrão precisa ser alcançável
pela interface local.

Com /24:

192.168.10.25
```

pertence à rede:

```text
192.168.10.0/24
```

enquanto:

```text
192.168.20.1
```

pertence a:

```text
192.168.20.0/24
```

São redes diferentes.

````

---

# 34. OBJETIVO FINAL DO MÓDULO

Ao concluir o módulo, o aluno deve conseguir olhar para uma comunicação:

```text
PC → SWITCH → ROUTER → SERVER
````

e pensar:

```text
Aplicação
   ↓
Transporte
   ↓
IP
   ↓
Ethernet
   ↓
Bits
   ↓
REDE
   ↓
Bits
   ↓
Ethernet
   ↓
IP
   ↓
Transporte
   ↓
Aplicação
```

Mas principalmente deve conseguir perguntar:

> "Onde pode estar o problema?"

E então seguir:

```text
Sintoma
 ↓
Camada provável
 ↓
Hipótese
 ↓
Ferramenta
 ↓
Teste
 ↓
Resultado
 ↓
Diagnóstico
 ↓
Correção
```

Esse é o verdadeiro objetivo educacional.

---

# 35. INTEGRAÇÃO COM A PLATAFORMA

O módulo deve ser integrado à plataforma existente.

Adicionar ao menu:

```text
🎓 APRENDER

   ├── Trilha de Aprendizado
   ├── Conceitos
   └── 🎮 A Viagem do Pacote

🧪 LABORATÓRIO

   ├── Simulador
   ├── Exercícios
   └── Desafios

🕵️ TROUBLESHOOTING

   └── Detetive de Redes
```

No dashboard, mostrar progresso:

```text
A VIAGEM DO PACOTE

████████████░░░░ 72%

Camadas:          7/7
Encapsulamento:   80%
Troubleshooting:  65%
Diagnóstico:      50%
```

---

# 36. ARQUITETURA

Não implementar tudo em um único componente.

Criar módulos separados.

Exemplo conceitual:

```text
src/
├── features/
│   └── packet-journey/
│       ├── components/
│       ├── engine/
│       ├── simulation/
│       ├── exercises/
│       ├── data/
│       ├── hooks/
│       ├── types/
│       └── pages/
│
├── core/
│   ├── learning/
│   ├── simulation/
│   └── scoring/
│
└── shared/
```

Adaptar a estrutura à arquitetura real do projeto.

Não criar estrutura paralela desnecessariamente.

---

# 37. REQUISITOS IMPORTANTES DE IMPLEMENTAÇÃO

Antes de alterar o projeto:

1. Analise a arquitetura atual.
2. Identifique framework e versões.
3. Identifique sistema de rotas.
4. Identifique sistema de componentes.
5. Identifique sistema de estado.
6. Identifique padrão visual existente.
7. Identifique como progresso dos usuários é armazenado.
8. Identifique como exercícios existentes são estruturados.
9. Reutilize componentes existentes sempre que possível.

Não reescrever partes existentes sem necessidade.

Não criar dependências novas se a funcionalidade puder ser implementada com as tecnologias já existentes.

---

# 38. RESPONSIVIDADE

O módulo deve funcionar em:

- desktop
- notebook
- tablet

A experiência principal deve ser otimizada para desktop, pois a simulação possui bastante informação visual.

---

# 39. ACESSIBILIDADE

Não utilizar apenas cores para comunicar:

- erro
- sucesso
- camada
- estado

Utilizar também:

- ícones
- textos
- labels
- estados visuais
- feedback textual

Permitir navegação básica por teclado.

---

# 40. REGRAS PEDAGÓGICAS

Estas regras são obrigatórias:

### REGRA 1

Não apresentar uma parede de texto antes do exercício.

### REGRA 2

Sempre que possível:

```text
AÇÃO → RESULTADO → EXPLICAÇÃO
```

e não:

```text
TEXTO → TEXTO → TEXTO → EXERCÍCIO
```

### REGRA 3

Erros devem gerar aprendizado.

### REGRA 4

As dicas devem ser progressivas.

### REGRA 5

O aluno deve entender o "porquê".

### REGRA 6

Priorizar raciocínio sobre memorização.

### REGRA 7

Relacionar conceitos abstratos a algo visual.

### REGRA 8

Sempre que possível, mostrar o conceito funcionando em uma rede.

---

# 41. NÃO CRIAR UM SIMULADOR FAKE

A simulação deve possuir estado.

Por exemplo:

Se o IP estiver errado:

```text
ping
```

deve falhar.

Se o IP for corrigido:

```text
ping
```

deve funcionar.

Se o gateway estiver errado:

```text
ping para rede local
```

pode funcionar enquanto:

```text
ping para outra rede
```

falha.

O objetivo é que o aluno consiga criar uma hipótese e testá-la.

---

# 42. IMPLEMENTAÇÃO EM FASES

Não implemente tudo de uma vez.

## FASE 0 — ANÁLISE

Analise o projeto atual.

Entregue:

- arquitetura encontrada
- tecnologias
- componentes reutilizáveis
- pontos de integração
- possíveis conflitos
- proposta técnica

NÃO IMPLEMENTE NADA ainda.

Aguarde minha aprovação.

---

## FASE 1 — EXPERIÊNCIA BASE

Implementar:

- rota do módulo
- tela inicial
- visual das camadas OSI
- PC
- Server
- Switch
- conexão visual
- mensagem
- fluxo básico

---

## FASE 2 — ENCAPSULAMENTO

Implementar:

- dados
- TCP
- IP
- Ethernet
- bits
- animações
- inspeção
- passo a passo

---

## FASE 3 — DESENCAPSULAMENTO

Implementar o fluxo inverso.

---

## FASE 4 — SISTEMA DE EXERCÍCIOS

Implementar:

- banco de exercícios
- tipos de exercício
- respostas
- dicas
- explicações
- pontuação

---

## FASE 5 — TROUBLESHOOTING

Implementar:

- falhas
- diagnóstico
- ferramentas
- hipóteses
- testes
- correção

---

## FASE 6 — DETETIVE DE REDES

Criar cenários completos de investigação.

---

## FASE 7 — ADAPTAÇÃO

Implementar:

- histórico
- progresso
- dificuldade adaptativa
- revisão
- XP
- conquistas

---

## FASE 8 — POLIMENTO

Realizar:

- animações
- microinterações
- acessibilidade
- responsividade
- performance
- testes
- UX
- tratamento de erros

---

# 43. TESTES

Criar testes para:

- encapsulamento
- desencapsulamento
- identificação de camadas
- cálculo/validação de rede
- estado dos dispositivos
- roteamento
- ferramentas simuladas
- pontuação
- progressão
- exercícios
- dicas

Também criar testes de integração para os principais fluxos.

---

# 44. CRITÉRIO DE SUCESSO

A implementação será considerada bem-sucedida quando um aluno iniciante conseguir:

1. entender visualmente o que é uma camada;
2. acompanhar um pacote atravessando a rede;
3. entender encapsulamento;
4. entender desencapsulamento;
5. relacionar TCP com portas;
6. relacionar IP com endereçamento;
7. relacionar Ethernet com MAC;
8. entender que os dados são transformados durante o caminho;
9. identificar uma camada provável quando existe uma falha;
10. escolher uma ferramenta para investigar;
11. interpretar o resultado;
12. corrigir problemas simples de rede.

---

# 45. PRINCÍPIO FINAL

Sempre que houver uma decisão entre:

> uma interface mais simples de implementar

e

> uma experiência que ajude o aluno a entender melhor o conceito,

priorize a segunda.

O objetivo desse projeto não é simplesmente criar um jogo.

O objetivo é criar uma forma diferente de aprender Redes de Computadores:

```text
VER
 ↓
INTERAGIR
 ↓
EXPERIMENTAR
 ↓
ERRAR
 ↓
INVESTIGAR
 ↓
ENTENDER
 ↓
CORRIGIR
 ↓
APLICAR
```

O aluno não deve terminar o módulo apenas sabendo dizer:

> "Camada 3 é Rede."

Ele deve terminar pensando:

> "Se o pacote não está chegando, eu preciso descobrir em que ponto ele parou e por quê."

Esse é o resultado educacional desejado.

---

# INSTRUÇÃO FINAL AO OPENCODE

Antes de começar qualquer implementação:

1. Leia o projeto inteiro o suficiente para entender sua arquitetura.
2. Procure arquivos `agent.md`, `initial.md`, `prompt-patterns.md` e demais documentos de regras existentes.
3. Respeite todas as regras existentes.
4. Analise como o projeto já organiza features, componentes, rotas, estado, dados e testes.
5. Execute a FASE 0.
6. Apresente a análise.
7. Apresente a arquitetura proposta.
8. Apresente os arquivos que serão criados/alterados.
9. NÃO implemente a FASE 1 ainda.
10. Aguarde aprovação explícita.

Depois da aprovação, execute cada fase de forma incremental.

Ao terminar cada fase:

- explique o que foi implementado;
- liste arquivos criados;
- liste arquivos modificados;
- explique decisões técnicas;
- informe testes executados;
- informe problemas encontrados;
- aguarde autorização para avançar quando necessário.

Não faça mudanças destrutivas.

Não reescreva funcionalidades existentes sem justificativa.

Priorize código limpo, modular, testável e extensível.
