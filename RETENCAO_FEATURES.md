# Relatório de Features de Retenção — NetLab
*Como fazer novos usuários permanecerem e voltarem (perspectiva de Designer de Produto)*

---

## 1. Por que novos usuários abandonam

O NetLab já resolve o **primeiro contato** (landing clara, cadastro simples, checklist de boas-vindas). O problema está nos **momentos seguintes**: entre a 1ª e a 10ª sessão. Diagnóstico do comportamento típico:

| Momento | O que acontece hoje | Risco de abandono |
|---------|--------------------|-------------------|
| Sessão 1 | Usuário faz checklist, talvez o 1º lab | Médio — ainda não houve "aha" |
| Sessões 2–4 | Sem gatilho para voltar; progresso é pouco visível | **Alto** — sem hábito |
| Sessão 5+ | XP/conquistas existem, mas não há metas ou rituais | Médio — monotonia |
| Retorno após dias | Nada convida de volta (sem resumo, sem sequência) | **Alto** — perda do hábito |

**Diagnóstico central:** o produto é ótimo em **executar** tarefas, mas fraco em **motivar a próxima** — e a retenção se constrói exatamente na capacidade de responder *"o que eu faço agora?"* e *"por que eu volto amanhã?"*.

---

## 2. Princípios de retenção aplicados (o porquê de cada recomendação)

1. **Aha moment rápido** — a 1ª sessão deve produzir uma vitória concreta (1º ping funcionando) em poucos minutos.
2. **Loop de hábito** — gatilho → ação de 2–5 min → recompensa visível. Sem os três, não há hábito.
3. **Efeito "meta em vista"** (goal gradient) — barras quase cheias motivam mais do que barras pela metade.
4. **Aversão à perda** — sequência (streak) que "se perde" é um dos maiores motivadores de retorno.
5. **Recompensa variável** — nível, conquistas e XP imprevisíveis mantêm o interesse.
6. **Revisão espaçada** — o código **já calcula** `nextReview`/`dueForReview`; falta apenas expô-lo de forma irresistível.
7. **Prova social saudável** — comunidade e comparação leve aumentam compromisso, sem gerar ansiedade.

---

## 3. Features recomendadas (por alavanca de retenção)

### 3.1 Primeira vitória rápida ("Aha moment")
- **F1 · "Primeiro Ping em 90 segundos"** — um modo guiado que transforma o lab 01 em um passeio de 3 passos com animação e celebração ("Você acabou de enviar seu primeiro pacote! 🎉"). Meta: 1ª vitória em < 3 min.
- **F2 · Vinheta de celebração** — ao completar qualquer atividade, uma confirmação visual (não modal bloqueante) com XP, conquista e o **próximo passo sugerido**.

### 3.2 Ritual de retorno (hábito)
- **F3 · Meta diária** — barra "Meta de hoje" no topo do Dashboard (ex.: 20 XP ou 1 atividade). Simples, ajustável, com progresso ao vivo.
- **F4 · Sequência (streak) visível** — o app já tem conquista `streak-3`; torná-la um **componente permanente**: 🔥 N dias seguidos no Dashboard e no Header, com "volte amanhã para não perder a sequência".
- **F5 · Lembrete inteligente** — permissão para **notificação local** (ou e-mail quando logado) em horário escolhido: *"Sua sequência de 4 dias está em risco — 3 minutos bastam."*
- **F6 · Resumo semanal** — "Você estudou 1h20 em 5 dias, domou 2 conceitos e subiu de nível." Card de retorno na 1ª sessão de cada semana.

### 3.3 Progresso com meta em vista (goal gradient)
- **F7 · Meta de módulo clara** — cada módulo do Mapa mostra "X de Y conceitos dominados" com a **distância** para o próximo nível (não só %).
- **F8 · "Falta 1 para a conquista"** — indicadores tipo *"complete 1 lab para desbloquear X"* nos cards de Conquistas (já há tooltip; transformar em contador visível).

### 3.4 Revisão espaçada (o código já tem os dados)
- **F9 · "Revisar hoje" persistente** — um card fixo no Dashboard (não no fim da página) listando conceitos com `dueForReview`, com botão "Revisar agora" levando ao lab/quiz correspondente. Reforça o retorno com um **dever de casa pronto**.
- **F10 · Quiz diário** — 1 pergunta rápida por dia (com explicação), oferecida no Dashboard: custo 2 min, recompensa XP + sequência.

### 3.5 Social / comunidade (compromisso)
- **F11 · Perfil público leve** — página de perfil com nível, conquistas e "conceitos dominados" (sem ranking global agressivo).
- **F12 · Desafios entre amigos** — convide por link e compare "quem domina mais conceitos esta semana" (comparação opcional, opt-in).
- **F13 · Dúvidas com "marcar como resolvida"** — na Comunidade, quem postou pode marcar a dúvida como resolvida; gera **reconhecimento** para quem respondeu (badge "Mentor") e feedback de utilidade.
- **F14 · Conteúdo comunitário** — "quiz do aluno da semana" ou "lab criado pela comunidade" destacado na home (curadoria leve, moderação manual).

### 3.6 Planejamento / compromisso
- **F15 · "Plano de 7 dias"** — ao terminar o checklist de boas-vindas, oferecer um plano simples ("3 labs + 1 quiz + 1 revisão nesta semana") com checagem visual.
- **F16 · Lembrete de próxima revisão** — usar o `nextReview` já existente para o lembrete inteligente (F5) ser contextual, não genérico.

### 3.7 Pequenos ganhos ("quick wins")
- **F17 · Atalho "1 atividade por dia"** — botão no Dashboard que leva direto à próxima atividade recomendada (lab/quiz/revisão), sem decisão.
- **F18 · Modo "Pomodoro de rede"** — cronômetro de 15–25 min para prática livre no Simulador, com XP bônus ao concluir o bloco.

---

## 4. Ficha de prioridade (esforço × impacto)

| # | Feature | Impacto | Esforço | Fase |
|---|---------|---------|---------|------|
| F3 | Meta diária no Dashboard | ⭐⭐⭐⭐⭐ | Baixo | **P0** |
| F4 | Sequência (streak) visível | ⭐⭐⭐⭐⭐ | Médio | **P0** |
| F1 | Primeiro Ping em 90s (aha) | ⭐⭐⭐⭐⭐ | Médio | **P0** |
| F9 | "Revisar hoje" fixo no topo | ⭐⭐⭐⭐ | Baixo | **P0** |
| F7 | Meta de módulo com distância | ⭐⭐⭐⭐ | Baixo | P1 |
| F10 | Quiz diário | ⭐⭐⭐⭐ | Médio | P1 |
| F6 | Resumo semanal | ⭐⭐⭐⭐ | Médio | P1 |
| F8 | "Falta 1 para a conquista" | ⭐⭐⭐ | Baixo | P1 |
| F5 | Lembrete/notificação | ⭐⭐⭐⭐ | Alto | P1 |
| F2 | Vinheta de celebração | ⭐⭐⭐ | Baixo | P1 |
| F13 | Dúvida resolvida + badge Mentor | ⭐⭐⭐ | Médio | P2 |
| F17 | Atalho "1 atividade por dia" | ⭐⭐⭐ | Baixo | P2 |
| F15 | Plano de 7 dias | ⭐⭐⭐ | Médio | P2 |
| F18 | Pomodoro de rede | ⭐⭐ | Médio | P2 |
| F11/F12 | Perfil público / desafios | ⭐⭐⭐ | Alto | P2 |
| F14 | Conteúdo comunitário | ⭐⭐ | Alto | P2 |
| F16 | Lembrete contextual (com F5) | ⭐⭐⭐ | — | junto do F5 |

**P0 (fazer primeiro):** F3, F4, F1, F9 — quatro mudanças de baixo/médio esforço que atacam diretamente o loop de hábito e o "aha moment".

---

## 5. Métricas para medir retenção

- **North Star:** *sessões por usuário na 1ª semana* (ou "atividades concluídas na 1ª semana").
- **Funil de onboarding:** cadastro → checklist → 1º lab → 1º ping → 2ª sessão.
- **D1/D7/D30:** proporção de novos usuários que retornam no dia 1, dia 7 e dia 30.
- **Streak ativo:** % de usuários com ≥3 dias consecutivos.
- **Meta diária:** % de dias em que a meta foi cumprida (proxy de hábito).
- **"Revisar hoje":** taxa de clique e conclusão (valida F9).
- **Comunidade:** % de novos usuários que participam (leem/respondem) e sua D30 comparada aos que não participam.

---

## 6. Conclusão

O NetLab não precisa de mais conteúdo — precisa de **ritmo e motivo de retorno**. As features de maior retorno são as que **reduzem a decisão** ("o que eu faço agora?") e **criam um ritual diário** (meta, sequência, revisão do dia). Começar pelo P0 (meta diária + streak + primeiro ping rápido + revisar hoje no topo) é o caminho de maior impacto com menor esforço, e já usa dados que o produto **já calcula** (XP, `dueForReview`, conquistas).