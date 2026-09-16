# MELHORIAS — NETLAB / SIMULADOR

Lista de ideias priorizadas para o simulador e o sistema. Ordenadas por impacto x esforço.

---

## 🔴 ALTO IMPACTO

- **Persistir estado do simulador** — salvar dispositivos/conexões/IPs (localStorage já existe p/ preview?); autosave + botão "Restaurar".
- **Colar (Ctrl+V) e duplicar dispositivo** — clonar nó + conexões com IPs novos.
- **Menu de contexto no canvas** — botão direito: renomear, duplicar, excluir, conectar, ver IPs.
- **Undo/Redo** (ctrl+z/ctrl+y) de ações (adicionar/mover/conectar/editar).
- **Validação de exercícios visual** — marcar em verde/vermelho o dispositivo/config certa direto no canvas (não só texto no console).
- **Dicas contextuais** — ao selecionar um nó, mostrar "o que fazer a seguir" (passo-a-passo adaptativo).

## 🟡 MÉDIO IMPACTO

- **Modo "passo a passo"** — wizard guiando montagem da rede (IP, cabos, teste) com checkpoint.
- **Status de link nos cabos** — cor verde/vermelha por conexão; alerta se interface sem IP.
- **Mini-map / zoom** — zoom mais suave (roda do mouse), centralizar no nó selecionado, minimapa quando rede grande.
- **Painel de diagnóstico rápido** — botão "Checar rede": lista IP duplicado, interface sem IP, cabo desconectado, rota ausente.
- **Exportar/importar topologia** — JSON download/upload (compartilhar labs).
- **Timeline de pacotes** — reproduzir captura/animação em pausa, frame a frame.
- **Simular falhas** — botão pra "derrubar" link/interface e aluno corrigir (já há faults para exercícios, expor no canvas).

## 🟢 QUALIDADE DE VIDA

- **Atalhos de teclado** — del (excluir), ctrl+d (duplicar), espaço (pausar anim), número (1-6 p/ inserir device).
- **Toolbar flutuante de status** — mini painel com IPs/portas do nó selecionado sem abrir painel cheio.
- **Renomear em linha** — dar nome ao device clicando no nome direto no canvas.
- **Busca no terminal** — histórico com "help" de comandos, autocomplete (tab).
- **Snap-to-grid** — alinhar nós; alinhamento automático da rede inteira (layout automático ao carregar exemplo).
- **Dark/light** — manter dark padrão, mas suportar tema claro (CSS vars já existem).
- **Toast/pilha de eventos** — notificações não-bloqueantes ao capturar pacote, erro de IP, sucesso de ping.
- **Acessibilidade** — tooltips (já feitos), focus outline, aria-labels nos botões do canvas.

## 🧩 NOVOS COMPONENTES

- `TopologyPreview` — miniatura da rede (SVG) em cards de relatório/exercício.
- `IpCalculator` — painel que calcula rede/broadcast/hosts a partir de IP+máscara (reusar `utils/ip`).
- `RouteTableVisualizer` — tabela de roteamento do core/roteador com status de cada rota.
- `ArpTablePanel` — tabela ARP do device selecionado (visual, além do comando).
- `PacketCaptureStrip` — linha do tempo de pacotes clicáveis (mini PacketInspector).
- `FaultBadge` — selo de falha injetada sobre o dispositivo (para exercícios de troubleshooting).
- `ChecklistGuide` — checklist interativo "Você já configurou X, Y, Z?" por lab.
- `CommandSuggestBox` — autocomplete de comandos com descrição (terminal).

## 🧪 PEDAGÓGICO

- **Exercícios gerados por cenário** — a partir da topologia montada, gerar perguntas ("Qual IP do gateway?").
- **Modo silencioso** — esconder comandos certos; aluno executa `ping/ip/arp` pra descobrir.
- **Relatório de sessão** — histórico de comandos + pacotes + erros do aluno exportável em texto.
- **Desafios com timer** — completar tarefa de rede em N minutos (score).