# Prontuário Digital — Fase 1

Sistema de gestão de alunos em `/app` protegido por login, mantendo a landing page pública intacta em `/`.

## O que fica nesta Fase 1
- Autenticação (Admin e Professor) + gestão de papéis
- Cadastro de alunos com foto
- Prontuário em abas: Dados, Anamnese, Avaliação Física, Objetivos, Evolução
- Geração de PDF profissional + botão Imprimir
- Compartilhar via WhatsApp / baixar PDF
- Auto-save por aba
- Histórico de evoluções (nunca sobrescreve)

## Fica para Fase 2 (avisado desde já)
- Mapa corporal clicável (dor por região)
- Silhueta postural com marcações
- Reavaliações com comparativo lado a lado
- Assinatura digital (canvas)
- Log de auditoria campo-a-campo
- Envio de PDF por e-mail (requer integração de e-mail)
- QR Code de validação
- Recepcionista como 3º papel

---

## Rotas

```text
/                    Landing page (pública, sem alterações)
/app/login           Login da equipe
/app                 Dashboard (lista de alunos)
/app/alunos/novo     Cadastro rápido
/app/alunos/:id      Prontuário completo com abas
/app/alunos/:id/pdf  Visualização otimizada para PDF/impressão
```

Landing page continua funcionando normalmente. Um link discreto "Área do Studio" no rodapé leva para `/app/login`.

---

## Estrutura do Banco (Lovable Cloud)

Tabelas em `public`:

- `profiles` — dados da equipe (nome, avatar), ligada a `auth.users`
- `user_roles` — papéis (`admin`, `professor`) em tabela separada com enum
- `students` — dados pessoais, matrícula, contatos, emergência, foto
- `student_objectives` — objetivos selecionados por aluno (many-to-many)
- `anamneses` — 1 por aluno (perguntas Sim/Não, doenças, alergias, medicamentos, médico)
- `physical_assessments` — várias por aluno (peso, altura, IMC, PA, FC, circunferências, escalas de mobilidade/flexibilidade/equilíbrio/força/resistência, dor genérica em texto)
- `evolutions` — várias por aluno (data, professor, descrição, exercícios, anexos)
- `evolution_attachments` — arquivos anexados às evoluções
- `terms_acceptances` — aceite dos 3 termos (LGPD, veracidade, riscos)

**Segurança**: RLS em todas as tabelas. Somente usuários autenticados com papel `admin` ou `professor` acessam. Função `has_role()` security-definer evita recursão.

**Storage**: bucket privado `student-files` para fotos de alunos e anexos de evolução.

---

## Interface do Prontuário

Layout de abas no topo com barra de progresso mostrando % preenchido:

```text
[Dados] [Anamnese] [Avaliação] [Objetivos] [Evolução] [PDF]
```

- **Auto-save**: cada campo salva após 800ms de inatividade (debounce), com indicador "Salvando…" / "Salvo ✓"
- **Cálculos automáticos**: idade a partir da data de nascimento, IMC a partir de peso/altura
- **Busca rápida** no topo do prontuário (Ctrl+F customizado dentro dos campos)
- **Última atualização**: rodapé mostra "Atualizado por [Nome] em [data/hora]"

Design segue a identidade atual (roxo #9333EA, Inter, cantos arredondados).

---

## Geração de PDF

Usando `@react-pdf/renderer` (renderização client-side, sem edge function):

- Cabeçalho: logo, nome do studio, endereço (Rua Paulo de Frontin, 129 — Loja 03, Centro, Barra do Piraí — RJ), WhatsApp, data de emissão, nº do prontuário, foto do aluno
- Corpo: Dados Pessoais → Objetivos → Anamnese → Avaliação Física → Evoluções
- Rodapé: "Página X de Y", data de geração, nome do profissional que gerou

Botões na aba PDF:
- **Baixar PDF** (download direto)
- **Imprimir** (`window.print()` com CSS `@media print` limpo)
- **Compartilhar no WhatsApp** (abre WhatsApp Web com link do PDF — o PDF precisa estar hospedado; nesta fase geramos localmente e usamos o botão para enviar mensagem convidando o aluno)

---

## Autenticação

- Login por e-mail/senha (auto-confirm ligado para pular verificação de e-mail nesta fase)
- Signup **fechado**: novos usuários da equipe são criados pelo Admin dentro do sistema (`/app/equipe`)
- Primeiro Admin: **você (Myllena)** faz o primeiro signup normalmente, e eu executo um comando no banco para te promover a `admin`. Depois disso, o signup público fica bloqueado.

Proteção de rota: componente `<RequireAuth>` envolve tudo em `/app/*`.

---

## Fluxo de trabalho para você

1. Aprovar este plano
2. Eu configuro banco, auth e todas as telas
3. Você faz signup em `/app/login` com seu e-mail
4. Eu te promovo a Admin
5. Você cria os professores pela tela de equipe
6. Começa a usar

---

## Estimativa de escopo

Isto é um sistema de médio porte. A implementação vai gerar bastante código (auth, ~9 tabelas, 5 abas do prontuário, PDF, storage, RLS). Se algo não sair 100% na primeira, ajustamos em iterações subsequentes.