# PROMPT-PATTERNS.md — Padrões de Trabalho

Este arquivo define padrões reutilizáveis para commands comuns no desenvolvimento da plataforma NetLab.

---

## 1. Criação de Funcionalidade

### Padrão

```
1. CONTEXTUALIZAR
   - O que existe hoje no código?
   - Qual é o gap?
   - Qual é o objetivo?

2. PLANEJAR
   - Quais arquivos serão criados/modificados?
   - Quais dependências são necessárias?
   - Qual é a interface (tipos, props, etc)?
   - Quais edge cases considerar?

3. IMPLEMENTAR
   - Criar tipos primeiro.
   - Implementar lógica.
   - Criar componente UI.
   - Conectar tudo.

4. VERIFICAR
   - Compilar.
   - Testar manualmente.
   - Verificar edge cases.

5. REPORTAR
   - O que foi feito.
   - O que precisa de atenção.
   - Próximos passos.
```

### Exemplo de Uso

```
"Adicionar funcionalidade de ping no simulador."

→ Seguir o padrão acima.
→ Começar explorando o código existente.
→ Planejar antes de implementar.
```

---

## 2. Correção de Bug

### Padrão

```
1. REPRODUZIR
   - Confirmar que o bug existe.
   - Identificar os passos para reproduzir.

2. DIAGNOSTICAR
   - Encontrar a causa raiz.
   - Identificar arquivos envolvidos.

3. CORRIGIR
   - Implementar correção mínima.
   - Não refactorar desnecessariamente.

4. VERIFICAR
   - Confirmar que o bug sumiu.
   - Verificar que não quebrou nada.

5. REPORTAR
   - Causa raiz.
   - Solução aplicada.
   - Impacto.
```

---

## 3. Refatoração

### Padrão

```
1. ENTENDER
   - O que o código atual faz?
   - Por que precisa ser refatorado?

2. PLANEJAR
   - Qual é a estrutura desejada?
   - Quais são os passos incrementais?

3. REFATORAR
   - Passo a passo.
   - Compilar entre cada passo.
   - NÃO alterar comportamento.

4. VERIFICAR
   - Compilar.
   - Testar comportamento idêntico.

5. REPORTAR
   - O que mudou.
   - Por que é melhor.
```

---

## 4. Criação de Exercício

### Padrão

```
1. DEFINIR
   - Conceito-alvo.
   - Dificuldade (1-5).
   - Categoria.
   - Pré-requisitos.

2. PROJETAR CENÁRIO
   - Topologia da rede.
   - Configurações dos dispositivos.
   - O que está errado (se for troubleshooting).

3. CRIAR DADOS
   - JSON estruturado do exercício.
   - Dicas progressivas (3 níveis).
   - Solução completa.

4. IMPLEMENTAR VALIDAÇÃO
   - Critérios de sucesso.
   - Verificação automática.
   - Feedback ao aluno.

5. TESTAR
   - Resolver o exercício como aluno.
   - Verificar dicas.
   - Verificar solução.
```

### Estrutura de Exercício

```typescript
interface Exercise {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  category: 'troubleshooting' | 'configuration' | 'design' | 'theory';
  concepts: string[];
  prerequisites: string[];
  scenario: {
    topology: Topology;
    devices: Device[];
    problem?: Problem;
  };
  objective: string;
  hints: Hint[];
  solution: Solution;
  validation: ValidationCriteria;
  xpReward: number;
}
```

---

## 5. Criação de Laboratório

### Padrão

```
1. DEFINIR OBJETIVO
   - O que o aluno vai aprender?
   - Qual é o resultado esperado?

2. PROJETAR TOPOLOGIA
   - Quais dispositivos?
   - Como conectados?
   - Quais configurações?

3. CRIAR PASSOS
   - Passo 1: Adicionar dispositivo X.
   - Passo 2: Conectar X ao Y.
   - Passo 3: Configurar IP.
   - Passo 4: Testar com ping.

4. IMPLEMENTAR VALIDAÇÃO
   - Verificar cada passo.
   - Verificar resultado final.

5. ADICIONAR DICAS
   - Dica para cada passo.
   - Solução geral.
```

---

## 6. Revisão de Arquitetura

### Padrão

```
1. AUDITAR
   - Listar todos os módulos.
   - Verificar dependências.
   - Identificar acoplamento.

2. ANALISAR
   -哪里 está bem? Onde está ruim?
   - Quais são os riscos?
   - O que pode ser melhorado?

3. PROPOSTA
   - Mudanças necessárias.
   - Prioridade.
   - Impacto.

4. IMPLEMENTAR
   - Passo a passo.
   - Manter compatibilidade.

5. VERIFICAR
   - Compilar.
   - Testar tudo.
```

---

## 7. Revisão de UX

### Padrão

```
1. OBSERVAR
   - Como está a interface atual?
   - O que confunde?
   - O que falta?

2. ANALISAR
   - Fluxo do usuário.
   - Pontos de fricção.
   - Oportunidades de melhoria.

3. PROPOR
   - Mudanças visuais.
   - Mudanças de interação.
   - Prioridade.

4. IMPLEMENTAR
   - Modificações.
   - Animações.
   - Feedback.

5. VALIDAR
   - Testar fluxo completo.
   - Verificar clareza.
```

---

## 8. Padrões de Código

### Componente React

```typescript
// ComponentName.tsx
// 1. Imports
// 2. Types/Interfaces
// 3. Constants
// 4. Helper functions
// 5. Component
// 6. Export
```

### Hook

```typescript
// useHookName.ts
// 1. Types
// 2. Implementation
// 3. Export
```

### Service/Engine

```typescript
// serviceName.ts
// 1. Types
// 2. Constants
// 3. Private functions
// 4. Public API
// 5. Export
```

### Store (Zustand)

```typescript
// storeName.ts
// 1. Types
// 2. Initial state
// 3. Actions
// 4. Store creation
// 5. Export
```

---

## 9. Padrões de commit

```
tipo(escopo): descrição

Tipos:
- feat: nova funcionalidade
- fix: correção de bug
- refactor: refatoração
- style: mudança de estilo
- docs: documentação
- test: testes
- chore: manutenção

Exemplos:
- feat(simulator): add device connection validation
- fix(terminal): command history navigation
- refactor(engine): extract ARP logic to module
```

---

## 10. Padrões de Emergência

### Quando algo quebrou

```
1. NÃO tentar consertar imediatamente.
2. Reverter para último estado funcional (se possível).
3. Analisar o que causou o problema.
4. Planejar correção.
5. Implementar correção.
6. Verificar.
```

### Quando não sabe resolver

```
1. PESQUISAR (web, docs, código existente).
2. Se não encontrar, SIMPLIFICAR o problema.
3. Se persistir, PERGUNTAR ao usuário.
4. NUNCA improvisar sem entender.
```
