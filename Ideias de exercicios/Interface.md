# REFINAMENTO VISUAL — NETLAB

Analise a interface atual do NetLab e faça um **refinamento visual completo**, mantendo 100% das funcionalidades existentes.

Use a imagem de referência fornecida nesta tarefa como **direção visual**.

## OBJETIVO

Transformar a interface atual em uma aplicação com aparência de:

> **laboratório profissional de redes + ferramenta de engenharia + dashboard moderno**

Manter o conceito atual, mas melhorar significativamente:

- hierarquia visual
- espaçamento
- legibilidade
- organização
- contraste
- consistência dos componentes
- aparência profissional
- experiência de uso

---

## DIREÇÃO VISUAL

Adotar:

- Dark Mode como padrão
- fundo azul/preto muito escuro
- azul elétrico como cor principal
- ciano para conexões/ações
- verde para estados positivos
- amarelo para atenção
- vermelho para erros
- roxo para alguns tipos de equipamento
- glassmorphism discreto
- bordas finas
- cantos levemente arredondados
- sombras sutis
- glow discreto
- ícones modernos e consistentes
- tipografia limpa
- microanimações suaves

Evitar exageros.

A interface deve parecer **profissional**, não um "tema gamer".

---

# ESTRUTURA PRINCIPAL

Organizar visualmente a aplicação em:

```text
┌──────────────────────────────────────────────────────────┐
│ HEADER                                                   │
├──────────────┬───────────────────────────────┬───────────┤
│              │                               │           │
│ SIDEBAR      │ ÁREA PRINCIPAL               │           │
│              │                               │ PROPRIED.│
│ Navegação    │ Topologia / Laboratório       │           │
│              │                               │           │
│ Progresso    │                               │           │
│              │                               │           │
├──────────────┴───────────────────────────────┴───────────┤
│ CONSOLE / PACOTES / EVENTOS                              │
└──────────────────────────────────────────────────────────┘
```

Não alterar a lógica da aplicação. Apenas melhorar a apresentação e organização.

---

# SIDEBAR

Melhorar a sidebar atual:

- separar navegação por categorias
- usar ícones consistentes
- destacar claramente item ativo
- melhorar espaçamento
- melhorar hierarquia
- manter progresso do aluno
- manter conquistas
- manter nível

Criar aparência semelhante a um software profissional de engenharia.

---

# HEADER

Melhorar o topo:

- busca global mais elegante
- status da aplicação
- usuário
- notificações
- ações principais
- espaçamento consistente

Destacar o título da página e seu contexto.

---

# LABORATÓRIO / CANVAS

Essa é a área mais importante.

Melhorar o canvas da topologia:

- grid mais discreto
- melhor contraste
- equipamentos maiores e mais legíveis
- conexões visualmente claras
- estados dos equipamentos
- seleção evidente
- hover
- animação de conexão quando necessário
- zoom
- pan
- minimapa

Os equipamentos devem parecer objetos reais de uma ferramenta de redes.

Exemplo:

```text
PC ───── SWITCH ───── ROUTER ───── SERVER
```

As conexões devem ser visualmente importantes.

Quando selecionado:

```text
┌─────────────┐
│    PC-01    │
│             │
│  🟢 ONLINE  │
└─────────────┘
```

---

# EQUIPAMENTOS

Padronizar todos os dispositivos:

- PC
- Notebook
- Servidor
- Switch
- Roteador
- Access Point
- Firewall
- Impressora
- Câmera IP
- Telefone IP
- Internet

Cada equipamento deve possuir:

- ícone
- nome
- tipo
- estado
- seleção
- hover

Não utilizar estilos visuais diferentes sem motivo.

---

# PAINEL DE PROPRIEDADES

Transformar o painel atual em um painel técnico mais organizado.

Organizar informações em seções:

```text
DISPOSITIVO

STATUS

REDE
IP
MÁSCARA
GATEWAY
DNS

SISTEMA
NOME
MAC

INTERFACES

PORTAS

AÇÕES
```

Usar cards internos e agrupamento visual.

Campos devem parecer campos de configuração de uma ferramenta real.

---

# CONSOLE / PACOTES / EVENTOS

Melhorar a área inferior.

Usar abas:

```text
Console
Pacotes
Eventos
```

Console com aparência de terminal profissional.

Pacotes devem futuramente permitir visualizar:

```text
Ethernet
IPv4
TCP/UDP
Dados
```

Eventos devem mostrar:

```text
16:01:22  PC-01 conectado ao SW-01
16:01:25  Pacote enviado
16:01:26  Router encaminhou pacote
```

---

# BOTÕES

Padronizar todos os botões.

Criar hierarquia:

**Primary**

- ação principal

**Secondary**

- ação normal

**Ghost**

- ações secundárias

**Danger**

- exclusão/remover

Evitar excesso de botões destacados.

---

# CORES DE STATUS

Usar semanticamente:

```text
🟢 Online / sucesso
🟡 Atenção
🔴 Erro
🔵 Informação
⚪ Inativo
```

Nunca depender somente da cor.

---

# MICROINTERAÇÕES

Adicionar apenas onde agregarem informação:

- hover
- seleção
- conexão
- envio de pacote
- alteração de estado
- sucesso
- erro
- abertura de painel

Animações rápidas e discretas.

---

# RESPONSIVIDADE

Corrigir problemas de:

- overflow
- elementos cortados
- textos espremidos
- painéis desproporcionais
- canvas pequeno

Priorizar desktop/notebook, pois é uma ferramenta de laboratório.

---

# REGRAS IMPORTANTES

**NÃO:**

- remover funcionalidades
- alterar lógica de negócio
- alterar comportamento existente sem necessidade
- recriar componentes já existentes
- instalar bibliotecas sem necessidade
- criar telas falsas
- substituir funcionalidades funcionais por mockups
- transformar a interface em um design excessivamente colorido

**FAÇA:**

- reutilize componentes existentes
- reutilize tokens/variáveis existentes
- mantenha a arquitetura
- mantenha as rotas
- mantenha o estado
- mantenha os dados
- mantenha todas as funcionalidades
- altere somente o necessário para o refinamento visual

---

# PRIORIDADE

Priorize nesta ordem:

1. Layout
2. Hierarquia visual
3. Espaçamento
4. Componentes
5. Canvas
6. Painel de propriedades
7. Sidebar
8. Console
9. Estados
10. Microanimações

---

# PROCESSO

Antes de alterar:

1. Inspecione a interface atual.
2. Identifique os componentes responsáveis por cada área.
3. Identifique o design system existente.
4. Reutilize o máximo possível.

Depois implemente diretamente o refinamento.

Não gere uma análise extensa.

Não descreva cada alteração em detalhes.

Ao finalizar, responda somente com:

```text
REFINAMENTO CONCLUÍDO

Alterações:
- Layout
- Sidebar
- Header
- Canvas
- Equipamentos
- Propriedades
- Console
- Estados visuais
- Responsividade

Funcionalidades existentes preservadas.
```

## REGRA DE TOKENS

Se encontrar algo que possa ser melhorado de várias formas, escolha a solução mais simples que mantenha o padrão visual.

**Não escreva longas explicações.**
**Não repita requisitos.**
**Não gere documentação desnecessária.**
**Não descreva código que você ainda vai escrever.**

Analise → implemente → teste → informe o resultado de forma curta.
