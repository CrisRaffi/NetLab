# Relatório de UI/UX — NetLab
*Auditoria como Designer de Interfaces*

---

## 1. Diagnóstico geral

O NetLab tem ótimos fundamentos: visual dark coeso, bom uso de cor por semântica, feedback imediato nas atividades e um design system com tokens. O problema não é estética — é **densidade e orientação**. A plataforma empilha muita informação por tela, usa tipografia muito pequena e não guia o usuário iniciante sobre *por onde começar*.

**4 dores centrais que explicam o feedback de "complexidade":**
1. **Tipografia minúscula** — o sistema define classes de `8px` até `11px` e as usa massivamente (`.text-[9px]`, `.text-[10px]`). É a causa nº1 de cansaço e sensação de "amontoado".
2. **Navegação redundante e rotulada de forma confusa** — "Questionários" vive dentro do grupo "Laboratório"; "A Viagem do Pacote" é uma Matéria e já foi atalho na home; Mapa, Labs e Questionários se repetem em entradas diferentes.
3. **Sem uma trilha clara de primeiro uso** — o "Mapa de Aprendizado" (a trilha guiada) **não é clicável**: são chips de conceito que não levam a lugar nenhum. O usuário chega e não sabe o que tocar.
4. **Elementos "falsos"** — barra de busca do header que não busca, sino de notificações sempre vazio com bolinha de badge, botão de status que não faz nada, e o "Modo Prova" que é um placeholder navegável.

---

## 2. Arquitetura de informação & navegação

### Problemas
| # | Problema | Local | Severidade |
|---|----------|-------|-----------|
| 2.1 | Grupo "Laboratório" contém Questionários e Modo Prova — conceitos de avaliação, não de laboratório | `src/components/layout/Sidebar.tsx` | Alta |
| 2.2 | "A Viagem do Pacote" está em "Matérias" e era atalho no Dashboard — dupla identidade | Sidebar/Dashboard | Média |
| 2.3 | Nav do Mapa permanece mesmo após remover os atalhos da home | `src/components/layout/Sidebar.tsx` | Média |
| 2.4 | Mapa não é interativo (ver seção 4) | `src/pages/LearningMapPage.tsx` | **Crítica** |
| 2.5 | Busca do header é um input morto (sem handler) | `src/components/layout/Header.tsx` | **Crítica** |
| 2.6 | Menu tem 4 grupos + seção inferior — usuário precisa varrer 2 áreas para achar 1 coisa | `src/components/layout/Sidebar.tsx` | Alta |

### Recomendações
- **Reduza para 2 grupos + 1 rodapé:** `Aprender` (Mapa, Lições, Viagem do Pacote) e `Praticar` (Laboratórios, Lab Livre, Troubleshooting, Questionários). Conquistas/Config ficam no rodapé como está. Menos grupos = menos decisão.
- **Rótulos orientados à ação e à intenção:** em vez de "Matérias"/"Laboratório" (nomes de área), usar verbos que descrevem o que a pessoa faz: "Aprender", "Praticar", "Avaliar".
- **Implemente a busca de verdade (2.5)** — ela é a promessa de escape para o usuário perdido. Filtre páginas, conceitos, labs e comandos em um comando `/` (Ctrl+K), com atalhos de teclado.
- **Remova ou promova o "Modo Prova"** — ou saia da nav até existir, ou vire um card "Em breve" dentro de Questionários (sem rota própria).
- **Retire o destaque "Começar" do Laboratório Livre** — é o recurso mais avançado; destaque deve ser a *próxima ação recomendada*, não o item mais difícil.

---

## 3. Onboarding — o problema do "por onde começo?"

### Cenário atual do novo usuário
1. Landing → CTA → Cadastro → cai no **Dashboard**.
2. Dashboard mostra anel de progresso 0%, dica rápida, laboratórios, conquistas e "Precisa revisar" — **muitas zonas antes de qualquer orientação**.
3. "Começar agora" leva ao Mapa… que é **estático** (2.4). Dead end.

### Recomendações (foco em "primeira sessão")
- **Primeiro logon → "Checklist de boas-vindas" modal** com 3 passos concretos: *(1) Leia a lição "Modelo OSI", (2) Monte a primeira rede, (3) Faça um quiz.* Progresso disso some quando concluído.
- **Dashboard reformulado para 3 zonas, em ordem:** (1) *Continuar de onde parou* (big CTA único), (2) *Próxima etapa sugerida* (1 card, contextual), (3) *Seus números* (agrupado). Remova "Precisa revisar" para usuários sem histórico.
- **O Mapa precisa ser o "hub da trilha":** cada conceito deve abrir um drawer com *→ Lição, → Laboratório, → Quiz*, usando a mesma cor da semântica. A "trilha guiada" só existe se cada nó for um ponto de entrada.
- **Microcopy de orientação:** todo bloqueio (lab travado, conceito fechado) deve dizer *o que fazer para destravar* ("Complete *Gateway* para liberar este lab") — hoje o LabsPage só mostra "Bloqueado".

---

## 4. Auditoria página a página

### Dashboard
- **Positivo:** hero bom, anel de progresso claro, stat pills compactos.
- **Críticas:** após remover os atalhos, ficou sem "portas de entrada" visíveis — a remoção foi correta para reduzir ruído, mas precisa ser substituída por *uma* recomendação contextual. "Dica rápida" com 10 dicas aleatórias em carrossel é bom conteúdo, mas compete por atenção.

### Mapa de Aprendizado
- **Crítico:** conteúdo não é clicável (2.4). A lateral esquerda (níveis) e o diagrama (OSI) são duas visões paralelas que não se conectam entre si nem a conteúdo.
- **Recomendação:** um só fluxo — lista de módulos clicáveis → drawer de ações; barra de progresso por módulo clicável para o lab correspondente.

### Laboratórios (Labs + LabView)
- **Bom:** bloqueio sequencial é claro, card mostra dificuldade/tempo/XP.
- **Críticas:**
  - O **LabView mistura 3 áreas na mesma tela**: instruções (topo), canvas (meio), avaliação/dicas/solução (painel). É o espaço mais denso do app. Sugestão: abas `Instruções · Rede · Avaliação` em vez de tudo visível, ou recolher instruções por padrão quando já visitado.
  - Botão "Dicas (0/3)" *parece* clicável para mostrar a lista, mas revela uma de cada vez sem indicar o que virá — usar contador de dicas restantes e animação.
  - "Solução" fica ao lado de "Dicas" e nunca pede confirmação (propensão a spoiler acidental). Pedir "Mostrar solução?" uma vez.

### Lições (LearnLesson)
- **Bom:** TOC lateral sticky, blocos variados, diagramas animados.
- **Críticas:** sem progresso de leitura (scroll), sem "marcar como lida", e a CTA final só aponta para `/questionarios` genérico — deveria apontar para o quiz *específico do tema*. Botão "Praticar no questionário" deveria usar o componente `Button` (consistência).

### Questionários
- **Bom:** explicação no erro, revisão do gabarito.
- **Críticas:** lista de quizes sem dificuldade/tempo/XP nos cards (info existe nos labs e não aqui); falta re-tentar com feedback de evolução da nota.

### Simulador / Lab Livre
- **Crítico:** densidade extrema — palette + canvas + propriedades (painel de 1.264 linhas!) + terminal + inspetor de pacotes + legenda + glossário + quiz de topologia + wizard, tudo simultâneo. Para um iniciante isso é opressivo.
- **Recomendações:**
  - **Workspace guiado:** abrir o Lab Livre com wizard ativo por padrão e painel de propriedades colapsado até o usuário selecionar um dispositivo.
  - **Ocultar avançado:** "Inspetor de pacotes", "Quiz de topologia" e "Legenda" agrupados em um painel "Ferramentas" recolhível.
  - **Descobribilidade dos atalhos:** mostrar dica "Ctrl+Z desfaz" no primeiro hover, e um help "?" que abre a lista de atalhos.
  - **Responsividade:** hoje é desktop-only (gate) — no mínimo explicar no *mobile* "abra no computador para montar redes", com ilustração, em vez de bloquear silencioso.

### Troubleshooting
- **Bom:** conceito divertido, diagnóstico automático.
- **Críticas:** mesmo problema de densidade do LabView; o botão do topo alterna *Solução* (não as instruções) — inconsistência de affordance com o LabView, onde o mesmo botão recolhe instruções.

### Viagem do Pacote
- **Bom:** stepper de 4 passos é o melhor padrão de progressão do app.
- **Críticas:** página muito longa (tudo em coluna); "FASE 4 · exercícios e pontuação" é jargão de dev — remover. Stepper não é clicável (não navega).

### Comunidade
- **Positivo:** boa base (chat + dúvidas, permissões claras).
- **Críticas:** exigir login para *publicar* mas mostrar "entre" com link genérico é ok, porém o input de senha/nome está ausente — falta **prova de identidade visual** (avatar por iniciais existe; bom). Sugerir listar dúvidas com tag de tema (OSI, IPv4…) alinhado aos conceitos do Mapa.

### Auth (Login/Registro)
- **Bom:** fluxo seguro, senha com política, recuperação.
- **Críticas:** o botão primário usa cor de destaque *azul* (aceitável), mas as telas não mostram o progresso do *pré-flight* (Firebase não configurado) com estado visual de erro de sistema — hoje é texto amarelo pequeno. Botões de CTA devem usar o componente `Button`.

---

## 5. Sistema visual & design tokens

### Problemas de maior impacto
| # | Problema | Evidência | Impacto |
|---|----------|-----------|---------|
| 5.1 | **Tipografia abaixo do acessível** — 8–11px é o padrão dominante | classes `.text-[8px/9px/10px/11px]` em toda a base | Crítico |
| 5.2 | Escala de tipo inexistente — textos de 8, 9, 10, 11, 12, 13, 14… sem hierarquia clara | `src/index.css` | Alto |
| 5.3 | Hex hardcoded ao lado de tokens (ex. `bg-[#0D1424]` vs `bg-[--color-bg-card]`) | vários componentes | Médio |
| 5.4 | **Radii inconsistentes** — 6, 8, 10, 12, 16, 20px misturados | `.rounded{,-md,-lg,-xl,-2xl}` | Médio |
| 5.5 | Sem `prefers-reduced-motion` — há animações infinitas (packetSweep, landingFloat, navGlowPulse) | `src/index.css` | Alto (acessibilidade) |

### Recomendações (sistema)
1. **Adote uma escala tipográfica de verdade:** `11/12/14/16/20/28` — **proibido** abaixo de 11px; corpo em 14px; rótulos densos (terminais, chips) em 11–12px. Essa única mudança reduz drasticamente a sensação de complexidade.
2. **Contraste:** `--color-text-muted (#8094AD)` sobre fundos escuros está no limite; suba para ~`#93A7BF` e use opacidade com moderação.
3. **Consolide tokens de superfície:** um único "card" (1 border + 1 bg + 1 shadow) usado em tudo; hoje há `card-flair`, `surface`, `.bg-[--color-bg-card]` e hex diretos.
4. **Unifique raios:** um `radius-lg = 12px` para cards e `radius-md = 8px` para controles (botões/inputs). Não mais de 2 valores.
5. **Motion:** adicione `@media (prefers-reduced-motion: reduce)` desligando as animações infinitas; mantenha transições de estado curtas (150ms, já ok).
6. **Erradique elementos "decorativos que distraem":** o `packet-flow::after` animando em *todo* card com a classe transmite "vivo demais" — reserve para o card em destaque da sessão (1 por tela).

---

## 6. Feedback, estados & consistência

- **Crie um sistema de Toast global** (sucesso/erro/info) para ações: "Laboratório validado ✓", "Dúvida publicada", "Falha ao salvar". Hoje os sucessos aparecem inline e os erros muitas vezes somem (Firestore engole).
- **Estados de carregamento:** todas as telas que leem dados (Comunidade, Dashboard) precisam de skeleton/loader — hoje é flash de vazio → conteúdo.
- **Empty states padronizados:** já existem bons (Conquistas, Comunidade) — replicar o padrão em Quizzes/Labs quando vazios, com ação de "como preencher".
- **Confirmação destrutiva consistente:** LabsPage e Community usam padrões diferentes de confirmação; padronizar em "modal de confirmação" com nível de severidade.
- **Botões/inputs:** substituir todos os CTAs customizados (`Login`, `Comunidade`, `LearnLesson`) pelo componente `Button`. Um componente, um visual, um hover state.

---

## 7. Acessibilidade (checklist rápido)

| Item | Status |
|------|--------|
| Contraste de texto corpo | ⚠️ `muted` no limite |
| Tamanho mínimo de toque (≥44px) | ❌ botões de 24–28px (trash, icon-buttons) |
| `aria-label` em botões de ícone | ✅ na maioria |
| Foco visível | ✅ `:focus-visible` global |
| `prefers-reduced-motion` | ❌ ausente |
| Navegação por teclado no simulador | ⚠️ atalhos existem, mas não há menu de ajuda |
| Alt-text em diagramas/imagens | ⚠️ parcial |

---

## 8. Roteiro priorizado (Roadmap)

### P0 — corrige a dor principal (Fazer em sequência)
1. **Escala tipográfica** — subir textos de 8–10px para ≥11px; corpo 14px. *(Impacto imediato enorme)*
2. **Busca real no header** — Ctrl+K / barra de busca funcional indexando páginas + conceitos + labs.
3. **Mapa clicável** — cada conceito abre ações (Lição → Lab → Quiz).
4. **Remover elementos mortos** — sino sem badge falsa, botão status, Modo Prova da nav.

### P1 — reduz complexidade percebida
5. **Reorganizar navegação** (2 grupos + rótulos por ação).
6. **Primeiro-logon: checklist de boas-vindas** (3 passos).
7. **Simulador: colapsar painéis avançados** por padrão + wizard ativo.
8. **Unificar botões/radii/estados** — consolidação visual.

### P2 — polimento
9. **Toast global + skeletons** em todas as telas com dados.
10. **Reduced-motion** e acessibilidade de foco/touch.
11. **Detalhes de conteúdo:** tags de tema nas dúvidas, "marcar lição como lida", meta (tempo/XP) nos cards de quiz, stepper clicável na Viagem do Pacote.
12. **Refrescar a Landing** (já citar Comunidade; remover "FASE 4").

---

## 9. Conclusão

O NetLab não precisa de redesign — precisa de **redução**: menos texto miúdo, menos grupos, menos painéis simultâneos, e transformar os "mapas/lista" em **portas de entrada clicáveis**. Os três movimentos de maior retorno são: **(1) tipografia legível, (2) Mapa interativo, (3) busca funcional** — juntos, eles transformam a percepção de "complexo" em "completo".