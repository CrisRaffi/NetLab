# Relatório de Redesign Visual — NetLab
*Direção de interface modernizada · avaliação por tela e ponto do sistema*

---

## 1. Diagnóstico do visual atual

O NetLab tem personalidade — dark navy, indigo, "glass" — mas o visual atual sofre de **excesso de estímulo**:

| Sintoma | Onde aparece | Efeito |
|---------|-------------|--------|
| `packet-flow` (linha animada varrendo o topo) em vários cards ao mesmo tempo | Dashboard (hero, "Nível", "Seus Laboratórios"), Comunidade, Lições | Sensação de "tudo pulsando"; nenhum card se destaca |
| Muitos acentos de cor simultâneos numa mesma tela | Dashboard (azul+ciano+roxo+verde+amarelo+vermelho em 1 viewport) | Sem hierarquia de importância |
| Glow (brilho) e gradientes em excesso | Hero do Dashboard, cards, avatares, botões | Parece "dashbord técnico", não um produto de aprendizado |
| Grid de pontos + orbs de luz no fundo | `Layout`, `LandingPage` | Ruído visual de fundo |
| Duas/três linguagens de card diferentes | `card-flair`, `.surface`, `bg-[--color-bg-card]` cru | Inconsistência de superfície |
| Contadores/pills/estatísticas espalhadas | Hero (4 pills) + Card Nível (3 números) + "Precisa revisar" (5 chips) | A home mostra ~14 micro-informações antes de qualquer ação |
| Anel SVG "GERAL" pequeno com fonte 7px | Hero do Dashboard | Baixa legibilidade e visual datado |

**Resumo:** a interface é **rica, porém ruidosa**. O caminho para modernizar não é trocar a cor — é **reduzir efeito, aumentar clareza e dar hierarquia**.

---

## 2. Direção visual proposta — "NetLab 2.0"

Três palavras-chave: **Claro · Calmo · Confiante**.

1. **Menos efeito, mais clareza.** Remover glows, gradientes e sweep animado dos elementos comuns. Reservar o "destaque" para 1 elemento por tela (o CTA principal).
2. **Tipografia é a hierarquia.** Corpo 14–15px, títulos 20–24px, uma escala única. Menos `font-mono` decorativo em texto utilitário.
3. **Cor com propósito.** Um acento primário (índigo `#6366F1`) para ações; um secundário (ciano) para links/realces; status (verde/amarelo/vermelho) **somente** para estados. Cores por módulo ficam restritas ao Mapa.
4. **Superfícies limpas.** Um único estilo de card (borda sutil + sombra suave). Sem linha de gradiente no topo de todo card.
5. **Motion calma.** Micro-interações curtas (150–200ms), elevação no hover, respeitando `prefers-reduced-motion`.

---

## 3. Sistema visual (tokens a atualizar)

### 3.1 Cor
| Token | Atual | Proposta |
|-------|-------|----------|
| `--color-bg-primary` | `#111a2c` | Subir levemente a luminância → `#121a2e` (menos "sujo", mais neutro) |
| `--color-bg-card` | `#182743` | `#1a2540` (superfície única, sem gradiente) |
| `--color-text-muted` | `#8094ad` | `#93a6bd` (contraste ≥ 4.5:1) |
| `--color-accent-cyan` | `#818cf8` | Usar apenas para links/realce (hoje é quase igual ao azul) |
| Glows | `glow-*`, `shadow-glow-*` | Remover do uso geral; manter 1–2 (logo, CTA principal) |
| Orbs de fundo | `glow-orb` | Reduzir opacidade em ~50% ou remover nas telas internas |

### 3.2 Tipografia
- Escala única: **11 / 12 / 14 / 16 / 20 / 24** (P0 já eliminou <11px).
- Corpo da home em **15px** (`text-[15px]`), descrições em 13–14px.
- `font-mono` apenas para IPs, comandos, PDUs, IDs — **não** para números de estatística.

### 3.3 Superfícies / raio / sombra
- Card: `background: #1a2540` + `border: rgba(43,61,94,.5)` + `box-shadow` suave único.
- Raio padrão de card: **16px** (hoje 12px). Controles: **10px**.
- Remover o `card-flair::before` (linha de gradiente) e o `packet-flow::after` (sweep animado) dos cards comuns — deixar `packet-flow` só em 1 card de destaque (ex.: "Continuar estudando").

### 3.4 Motion
- Manter `fadeInUp` (300ms) e hover elevado.
- Eliminar animações infinitas decorativas fora da Landing (hero).

---

## 4. Redesign da Home (`/dashboard`) — prioridade máxima

### 4.1 Por que o visual atual não agrada
- Hero carregado: saudação + badge + texto + 2 botões + 4 pills + anel "GERAL" tudo na mesma linha.
- Anel com `GERAL` 7px parece "widget técnico" e não comunica próximo passo.
- Três zonas de números (pills, card Nível, dominados/quizzes/conquistas) repetem a mesma métrica.
- "Precisa revisar" mostra 5 chips coloridos de cara para quem começou agora.
- `packet-flow` e `card-flair` em vários cards → tudo parece em movimento.

### 4.2 Nova estrutura da home (topo → base)

**Zona 1 — Saudação + CTA principal (1 ação)**
- Esquerda: saudação grande (`Bom dia, Ana`), subtítulo de 1 linha, botão primário único "Continuar de onde parou".
- Direita: **card de "próxima etapa"** (miniatura do próximo lab/lição com tempo + XP) em destaque — substitui o anel.
- Remover as 4 pills do hero; mover para Zona 2 como tiles.

**Zona 2 — 4 KPIs limpos**
- Tiles únicos (Nível+XP, Labs, Quizzes, Conquistas/Horas) — **um só estilo**, sem cor por tile, número em 24px, sem `font-mono`.

**Zona 3 — "Continuar estudando"**
- 1 card grande: próximo laboratório com progresso, botão "Continuar"; ao lado, 2 atalhos silenciosos (Viagem do Pacote, Questionários) como `text-link`, não cards.

**Zona 4 — "Seus módulos"**
- Lista única de 6 barras de progresso (índigo; verde apenas ≥80%). Remover as cores por módulo aqui (ficam no Mapa).

**Zona 5 — "Seus laboratórios" + Conquistas**
- Manter, mas com visual de superfície único (sem `card-flair`/`packet-flow`).

**Zona 6 — "Precisa revisar"** → mover para o **fim** e só exibir quando houver histórico (remover para usuários novos).

### 4.3 Antes → Depois (resumo)
| Elemento | Antes | Depois |
|----------|-------|--------|
| Hero | 14 elementos + anel SVG | Saudação + 1 CTA + 1 card de próxima etapa |
| Anel "GERAL" | SVG 80px, fonte 7px | Removido (ou versão maior e limpa, sem texto micro) |
| Pills de estatística | 4 pills no hero | 4 tiles KPI em linha |
| Cards | `packet-flow` + `card-flair` | Superfície única, sem animação |
| "Precisa revisar" | 5 chips coloridos no topo | Seção discreta no fim, só com histórico |
| Sensação geral | "painel de monitoramento" | "produto de aprendizado focado" |

---

## 5. Avaliação por aba / tela

### 5.1 Sidebar
- **Hoje:** 3 grupos com rótulos de intenção (bom), texto 11–12px, item ativo com glow.
- **Modernizar:** remover glow/glow-dot do item ativo → usar fundo sutil + barra vertical de 2px; aumentar espaçamento vertical; ícones 16px; texto 13px; colapsar grupos com chevron mais discreto; logo sem brilho exagerado.

### 5.2 Header
- **Hoje:** busca central, sino (sem badge), perfil. Razoável.
- **Modernizar:** remover borda de gradiente no topo (`bg-gradient` de 1px); sino sem dropdown falso — esconder quando não há notificações; perfil mais compacto (só avatar + nome); foco visível mais nítido na busca.

### 5.3 Landing
- **Hoje:** hero bom, mas muito gradiente/glow e 6+ seções longas.
- **Modernizar:** reduzir glows do hero; cards de feature com superfície única e hover elevado (sem `landing-float` bobo demais); CTA com contraste; menos animação `particle`.

### 5.4 Mapa de Aprendizado
- **Hoje:** duas colunas (níveis + diagrama), conceitos clicáveis (P0), mas ainda visual denso com emojis (✅📘🔒) e chips minúsculos.
- **Modernizar:** substituir emojis por ícones SVG com cor; aumentar chips para 12px; dar "linha do tempo" vertical mais clara; o modal de ações com superfície única.

### 5.5 Laboratórios (Labs)
- **Hoje:** cards em grid com número, dificuldade, tempo, XP — funcional.
- **Modernizar:** número do lab sem box (tipo hierárquico "01"); dificuldade como tag discreta; botão de largura completa mais alto; hover com elevação sutil (já tem).

### 5.6 LabView (workspace do lab)
- **Hoje:** muito denso (instruções + canvas + painel de avaliação).
- **Modernizar:** abas claras (Instruções/Rede/Avaliação); painel de avaliação com superfície única; botões "Dicas/Solução" como pills reais; reduzir bordas duplas.

### 5.7 Lições
- **Hoje:** TOC lateral + seções em cards. Bom conteúdo.
- **Modernizar:** cards de seção sem `packet-flow`; título maior; diagramas com superfície limpa; CTA final com botão primário (não link).

### 5.8 Questionários
- **Hoje:** cards com topic tag, nome, descrição, meta, botão.
- **Modernizar:** card mais "convite" (largura maior do botão, hover elevado); tag de tema com cor única; "melhor nota" como linha discreta.

### 5.9 Viagem do Pacote
- **Hoje:** stepper + 4 cards em coluna + coluna lateral de camadas.
- **Modernizar:** reduzir `card-flair`; stepper com números em círculo; coluna lateral sticky com superfície única; remover `FASE 4` (já feito).

### 5.10 Troubleshooting
- **Hoje:** funcional, visual denso igual LabView.
- **Modernizar:** mesmo tratamento do LabView; badge "Quebrada" mais discreto; foco no botão "Rodar diagnóstico".

### 5.11 Simulador / Lab Livre
- **Hoje:** toolbar flutuante com muitos botões (Conectar, WiFi, Organizar, Grid, Novo, Exemplo...).
- **Modernizar:** agrupar ferramentas em 2 grupos (Rede / Editar); ícones + label sempre; menos anéis (`ring-inset-*`) coloridos; painel de propriedades (colapsado por padrão — P1) com superfície única.

### 5.12 Comunidade
- **Hoje:** chat + dúvidas, já razoável.
- **Modernizar:** balões de mensagem com raio maior e sem `gradient` no "minha mensagem" (usar cor sólida); tabs maiores; avatares com borda de anel sutil; toasts já integrados (P2).

### 5.13 Conquistas
- **Hoje:** grade de cards com emoji e lock.
- **Modernizar:** emoji → badge SVG; card de conquista com "raio" de destaque quando desbloqueada; lock com tooltip "como desbloquear".

### 5.14 Configurações
- **Hoje:** cards padrão, funcional.
- **Modernizar:** reduzir `card-flair`; separadores mais suaves; botão "Sair" mais discreto.

### 5.15 Auth (Login/Registro/Recuperação)
- **Hoje:** formulário central em card com botão `accent` (P1).
- **Modernizar:** deixar o card mais amplo (max-width 400px), campo de senha com reforço de força visual; foco de campo mais nítido; reduzir textos técnicos ("Firebase ainda não configurado") para aviso discreto.

---

## 6. Componentes (padronização visual)

1. **Botão primário:** único gradiente suave (indigo), `radius 10px`, altura mínima 40px, hover elevação. Secundário: superfície + borda.
2. **Card:** 1 estilo só (superfície única, `radius 16px`, sombra suave, hover borda indigo 35%).
3. **Input:** fundo `#131c33`, borda sutil, foco com anel indigo de 3px (já ok) — padronizar padding vertical 10px.
4. **Badge/tag:** raio pill, texto 11px, no máximo 1 cor de acento + tons de estado.
5. **Empty/Loading:** skeletons (P2) com shimmer sutil; empty states com ícone + 1 ação.
6. **Modal:** superfície única, `radius 16px`, sem `glass-strong` exagerado.

---

## 7. Plano de implementação (fases)

### Fase A — Fundação (baixo risco, alto impacto)
1. Aplicar novos tokens de superfície/cor (remover `card-flair`, `packet-flow` dos cards comuns; unificar card em 1 estilo).
2. Ajustar escala tipográfica final (corpo 15px na home, títulos 20–24px).
3. Reduzir glow/orbs.

### Fase B — Home (`/dashboard`)
4. Reconstruir o hero (saudação + 1 CTA + card "próxima etapa").
5. Pills → 4 KPI tiles; remover "Precisa revisar" para novos usuários.
6. Zonas 3–5 com a nova linguagem de card.

### Fase C — Navegação e telas de aprendizado
7. Sidebar (barra ativa, ícones 16px), Header (remover gradiente/sino condicional).
8. Mapa, Lições, Labs, Questionários com superfície nova + ícones no lugar de emojis.

### Fase D — Telas do simulador e polish
9. LabView/Troubleshooting/Simulador (agrupar ferramentas, superfície única).
10. Landing, Comunidade, Conquistas, Config, Auth.
11. Revisão de `prefers-reduced-motion` e foco visível.

---

## 8. Conclusão

O redesign não é sobre "trocar de tema" — é **disciplina visual**: uma superfície, um acento, uma tipografia e muito mais espaço. A **home** é o maior ganho e o menor risco: hoje ela é um painel de métricas; ela deve ser um **convite à próxima ação**. Feito isso, as demais telas seguem a mesma linguagem e o sistema passa a "respirar".