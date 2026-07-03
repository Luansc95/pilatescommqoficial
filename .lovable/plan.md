
# Módulo Aulas — Fase 1 (MVP essencial)

Vamos entregar a base funcional do módulo. Turmas, execução ao vivo, dashboard com gráficos, relatórios PDF/Excel, recepcionista, calendário arrastável e comparativos de evolução ficam para fases seguintes (listadas no final).

## O que será entregue nesta fase

### 1. Navegação
- Novo item no menu lateral **📚 Aulas** com 4 sub-seções:
  - Exercícios
  - Planos de Aula
  - Aulas (individuais)
  - Agenda (semana)

### 2. Biblioteca de Exercícios (`/app/aulas/exercicios`)
- Lista com busca, filtro por categoria/grupo muscular/nível, e status ativo/inativo
- Formulário de cadastro/edição com:
  - Nome, código, categoria, grupo muscular, objetivo, nível, equipamento (lista fixa), duração, séries, repetições, descanso
  - Descrição, benefícios, contraindicações, cuidados, dicas
  - Upload de foto (bucket `exercise-media`) e link para vídeo externo
  - Tags e status
- Ações: duplicar, editar, arquivar (soft delete)

### 3. Planos de Aula (`/app/aulas/planos`)
- Lista com busca e filtro por objetivo/nível
- Editor de plano com 7 blocos fixos (Aquecimento → Mobilidade → Alongamento → Fortalecimento → Equilíbrio → Coordenação → Relaxamento)
- Adicionar exercícios da biblioteca a cada bloco; reordenar com setas ↑↓ (drag & drop fica para fase 2 para reduzir escopo)
- Para cada exercício no plano: séries, repetições, tempo, carga, observações
- Duplicar plano

### 4. Aulas Individuais (`/app/aulas/aulas`)
- Criar aula: aluno, professor, data, hora, duração, objetivo, intensidade, plano (opcional), observações
- Ao selecionar plano, exercícios são copiados para a aula (podem ser editados só para essa aula)
- Status: Agendada, Realizada, Faltou, Cancelada
- Ao marcar **Realizada**: cria automaticamente um registro em `evolutions` do aluno (aparece no prontuário) com plano executado, exercícios, tempo, intensidade, observações. Nunca sobrescreve registros anteriores.

### 5. Agenda semanal (`/app/aulas/agenda`)
- Visualização de semana (segunda a sábado), grid de horários
- Clique em slot vazio → criar aula; clique em aula existente → abrir/editar
- Filtro por professor e aluno
- Navegação semana anterior/próxima

### 6. Integração com prontuário
- Aba "Aulas" no prontuário do aluno mostrando histórico de aulas realizadas
- Registro automático em Evolução (já existente) ao finalizar cada aula

## Fora do escopo desta fase (fases seguintes)
- Turmas e aulas em grupo
- Modo de execução ao vivo (cronômetro, próximo/anterior)
- Dashboard com KPIs e gráficos
- Relatórios em PDF/Excel
- Calendário mensal arrastável
- Comparativo de evolução (gráficos peso/IMC/dor/flexibilidade)
- Papel Recepcionista
- Notificações e lembretes automáticos
- CRUD completo de Salas e Equipamentos (usaremos lista fixa)
- Cadastro de Equipamentos (biblioteca)
- Financeiro

## Detalhes técnicos

### Banco de dados (novas tabelas com RLS + GRANTs)
- `exercises` — biblioteca de exercícios (soft delete via `archived_at`)
- `lesson_plans` — planos reutilizáveis
- `lesson_plan_blocks` — blocos do plano (7 tipos por plano)
- `lesson_plan_items` — exercícios dentro de cada bloco (com séries/reps/tempo/carga/obs)
- `lessons` — aulas agendadas/realizadas (FK para aluno, professor, plano opcional)
- `lesson_items` — exercícios executados na aula (snapshot do plano, editável)
- Trigger/edge function: ao marcar `lessons.status='realizada'`, inserir linha em `evolutions` com resumo.

RLS: staff (admin+professor) tem acesso total; nada exposto ao anon.

### Storage
- Bucket privado `exercise-media` para fotos de exercícios (staff pode upload/read).

### Listas fixas
- `categorias`, `grupos_musculares`, `equipamentos`, `níveis`, `objetivos`, `intensidades` em `src/lib/appConstants.ts`.

### Frontend
- Novas páginas em `src/pages/app/aulas/`
- Componentes em `src/components/app/aulas/`
- Atualizar `AppLayout` sidebar com submenu expansível
- Atualizar `App.tsx` com as novas rotas
- Reutilizar padrões visuais existentes (cards arredondados, roxo, Inter)

## Ordem de implementação
1. Migração do banco + storage bucket
2. Constantes e listas fixas
3. Biblioteca de Exercícios (CRUD completo)
4. Planos de Aula (editor)
5. Aulas Individuais + integração com Evolução
6. Agenda semanal
7. Aba "Aulas" no prontuário do aluno
8. Atualização da sidebar

Aprovando este plano, começo pela migração do banco.
