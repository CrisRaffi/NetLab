# AGENT.md — Regras de Governança do Projeto

## Visão Geral

Este arquivo contém as regras que governam o desenvolvimento da plataforma **NetLab** — Laboratório Virtual de Redes de Computadores.

---

## 1. Princípios de Arquitetura

### 1.1 Separação Clara de Responsabilidades

- **Frontend**: UI, renderização, interação do usuário, estado local.
- **Backend**: API REST, persistência, lógica de negócio, simulação avançada.
- **Network Engine**: Motor de simulação de rede isolado, testável independentemente.
- **Exercise Engine**: Motor de exercícios, validação, geração de cenários.

### 1.2 Modularidade

- Cada módulo deve ser independente e trocável.
- Nunca criar dependências circulares entre módulos.
- Módulos de simulação NUNCA devem depender de UI.

### 1.3 Evolução Gradual

- Arquitetura preparada para features futuras (PostgreSQL, WebSocket, IA).
- Não implementar features futuras agora, mas **não bloquear** sua adição posterior.

---

## 2. Princípios de Código

### 2.1 Estilo

- TypeScript strict mode em todo o projeto.
- Sem `any` — usar tipos adequados.
- Preferir composição sobre herança.
- Funções puras quando possível.
- Nomes descritivos em inglês (variáveis, funções, componentes).
- Nomes em português apenas no conteúdo pedagógico visível ao usuário.

### 2.2 Tamanho

- Arquivos máximos: ~300 linhas. Acima disso, decompor.
- Funções máximas: ~50 linhas. Acima disso, decompor.
- Componentes React máximos: ~200 linhas.

### 2.3 Qualidade

- Nunca implementar sem compilar/verificar.
- Corrigir erros antes de avançar.
- Manter o projeto sempre executável.
- Commit apenas quando explícito pelo usuário.

### 2.4 Dependências

- NÃO adicionar dependências sem necessidade justificada.
- Preferir soluções nativas quando possível.
- Documentar toda dependência adicionada.

---

## 3. Regras de UX

### 3.1 Design

- Dark mode como padrão.
- Estética profissional — NÃO infantil.
- Inspirado em ferramentas de TI (VS Code, Wireshark, GNS3).
- Clareza acima de beleza.
- Acessibilidade: contraste adequado, fontes legíveis.

### 3.2 Interatividade

- Toda ação do usuário deve ter feedback visual.
- Animações sutis, nunca excessivas.
- Estados visuais claros (conectado, desconectado, erro, sucesso).
- Sempre mostrar progresso quando aplicável.

### 3.3 Terminal

- Terminal virtual com aparência realista.
- Autocomplete simples.
- Histórico de comandos.
- Output formatado com cores.

---

## 4. Regras Pedagógicas

### 4.1 Filosofia Central

> "Aprenda porque precisa resolver um problema."

- NUNCA começar com teoria pura.
- SEMPRE começar com um problema prático.
- O aluno experimenta ANTES de receber explicação.
- Erros são oportunidades de aprendizado.

### 4.2 Sistema de Dicas

- Nunca entregar a resposta diretamente.
- Usar 3 níveis de dica antes da solução.
- Cada dica deve guiar o raciocínio, não dar a resposta.
- Solução completa só após as 3 dicas.

### 4.3 Explanations

- Linguagem simples e direta.
- Analogias do dia a dia quando possível.
- Visualizações sempre que aplicável.
- Evitar jargon desnecessário no início.
- Progressão: simples → técnico → avançado.

### 4.4 Progressão

- Conteúdo liberado progressivamente.
- Nunca pular etapas.
- Revisão espaçada automática.
- Identificação de dificuldades.

---

## 5. Regras de Segurança

### 5.1 Dados

- NUNCA expor dados sensíveis.
- NUNCA logar informações de teste em produção.
- Sanitizar todo input do usuário.
- Validação server-side sempre.

### 5.2 Código

- NUNCA commitar chaves, tokens ou senhas.
- Usar variáveis de ambiente para configurações sensíveis.
- Não executar código arbitrário do usuário.

---

## 6. Padrões de Desenvolvimento

### 6.1 Ordem de Trabalho

```
FUNCIONALIDADE
    ↓
ARQUITETURA
    ↓
IMPLEMENTAÇÃO
    ↓
TESTE
    ↓
VALIDAÇÃO
    ↓
PRÓXIMA FUNCIONALIDADE
```

### 6.2 Regra de Ouro

- NUNCA criar soluções improvisadas.
- Se não souber como resolver, PESQUISAR antes.
- Se a solução for complexa, SIMPLIFICAR.
- Manter o código limpo é mais importante que entregar rápido.

### 6.3 Teste

- Testar cada funcionalidade após implementar.
- Verificar compilação antes de avançar.
- Validar comportamento visual.
- Testar cenários de erro.

---

## 7. Estrutura de Entrega

### 7.1 Por Sessão

1. Entender o que foi pedido.
2. Analisar impacto no projeto.
3. Planejar a abordagem.
4. Implementar.
5. Verificar.
6. Reportar resultado.

### 7.2 Comunicação

- Ser conciso.
- Reportar problemas encontrados.
- Justificar decisões técnicas.
- Sugerir alternativas quando necessário.
