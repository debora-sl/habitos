# 📐 Plano de Melhorias de Design — Sistema de Hábitos

Este documento descreve o planejamento de melhorias visuais e de
responsividade da aplicação de gestão de hábitos.

## Decisões

- 🟢 **Cor de marca:** Verde / Esmeralda (transmite crescimento e progresso).
- 📱 **Navegação mobile:** Bottom navigation (barra fixa inferior).
- 🎨 **Schema:** pode evoluir para dar cor/ícone a cada hábito.
- **Ordem:** Fundação → Header/Auth → Dashboard → Grade Semanal → Hábitos.

## Diagnóstico atual

| Área | Situação atual | Oportunidade |
|------|----------------|--------------|
| **Paleta** | 100% escala de cinza, sem cor de marca | Cor primária + accents |
| **Dashboard** | Apenas 1 gráfico, muito vazio | Cards de métricas (KPIs), streaks |
| **Header/Nav** | Barra simples, sem marca; risco de quebra no mobile | Branding + menu responsivo |
| **Hábitos** | Cards planos, sem hierarquia visual | Ícones, cores por hábito, progresso |
| **Semana** | Tabela com scroll horizontal | Grid mais visual + layout mobile |
| **Auth** | Cards simples e centralizados | Branding, layout split opcional |
| **Dark mode** | Variáveis existem, mas sem toggle | Botão de tema |

---

## Fase 1 — Fundação visual ✅ (concluída)

**Objetivo:** dar identidade e servir de base para todo o resto.

- **`app/globals.css`** — `--primary`, `--ring`, `--accent` e `--chart-1..5`
  passam a usar uma escala **esmeralda** em `oklch` (light e dark). Correção
  do `--sidebar-primary` do dark mode (que tinha um azul residual do tema
  padrão do shadcn).
- **Tipografia** — fonte de heading **Lexend** via `next/font`, conectada em
  `--font-heading`; `PageTitle` passa a usar `font-heading` (igual ao
  `CardTitle`).
- **Dark mode** — `next-themes` conectado via `components/theme-provider.tsx`
  no `app/layout.tsx` (`attribute="class"`, `suppressHydrationWarning`). Novo
  `components/habitos/theme-toggle.tsx` (Claro / Escuro / Sistema) adicionado
  ao `AppNav`.
- **Metadata** — `lang="en"` → `lang="pt-BR"`; título/descrição reais no lugar
  de "Create Next App".

## Fase 2 — Header, Navegação & Auth ✅ (concluída)

- **Marca** no header (ícone + nome do app).
- **Mobile → Bottom navigation:** barra fixa inferior com os 3 itens
  (`Hábitos`, `Semana`, `Dashboard`) + ícones `lucide-react`, destacando a
  rota ativa. Desktop mantém a nav no topo.
- **Conta:** `Avatar` + `DropdownMenu` reunindo troca de tema e logout.
- **Auth (`login`/`sign-up`):** logo acima do card, layout **split** com
  `next/image` em telas grandes, botão de submit com **spinner** de loading.
- Ajustar `(app)/layout.tsx` para reservar espaço da bottom-nav no mobile.

**Componentes shadcn a adicionar:** `avatar`.

## Fase 3 — Dashboard com KPIs

- Linha de **cards de métricas** (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`):
  sequência atual 🔥, taxa de conclusão 30 dias (%), total de conclusões,
  hábitos ativos.
- Novas funções em **`@/data`** (Prisma nunca no componente — regra do
  projeto).
- `badge` para tendências; gráfico usa a cor da nova paleta.

**Componentes shadcn a adicionar:** `badge` (opcional: `progress`).

## Fase 4 — Grade Semanal responsiva

- **Desktop:** grade atual + destaque da coluna "hoje", checkboxes coloridos
  ao concluir.
- **Mobile:** substituir a tabela (que força scroll horizontal) por **cards
  por hábito**, com os 7 dias como pills (`toggle-group`).
- Navegação de semana com o intervalo de datas visível ao centro.

**Componentes shadcn a adicionar:** `toggle-group`, `tooltip`.

## Fase 5 — Hábitos + cor/ícone (evolução de schema)

- **`prisma/schema.prisma`:** adicionar `color` e `icon` ao modelo `Habit`
  (+ migration).
- **`habit-form.tsx`:** seleção de cor (da paleta do tema) e ícone.
- **`habit-list.tsx`:** cards com o ícone/cor, hover states, e **empty state**
  com ilustração (componente `empty` do shadcn).

**Componentes shadcn a adicionar:** `empty`, `tooltip`.

---

## Responsividade (transversal)

- Auditar todos os breakpoints (`sm`/`md`/`lg`), mobile-first.
- Padding do `Page` adaptativo (`p-4 sm:p-6`).
- Bottom-nav no mobile (Fase 2).
- Grade semanal em cards no mobile (Fase 4).
- Grids do dashboard colapsando para 1 coluna.
- Áreas de toque ≥ 44px (checkboxes / pills).

## Componentes shadcn a instalar (resumo)

`avatar`, `badge`, `empty`, `tooltip`, `toggle-group`, `progress` (opcional).
Dependência `next-themes` já está instalada.
