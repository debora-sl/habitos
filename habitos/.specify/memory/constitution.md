<!--
Sync Impact Report
- Version change: [TEMPLATE] → 1.0.0 (initial ratification)
- Modified principles: n/a (first fill of template)
- Added sections:
  - I. Component-First UI (shadcn/ui Mandatory)
  - II. Data Access Isolation (No Prisma in Components)
  - III. Server Actions via next-safe-action
  - IV. TypeScript, Clean Code & DRY
  - V. Framework & Tooling Conventions
  - VI. Manual Verification Only (No Dev Server Checks)
  - Technology Stack
  - Governance
- Removed sections: none
- Templates requiring updates:
  - ✅ .specify/templates/plan-template.md (Constitution Check gate is generic, references this file — no edit needed)
  - ✅ .specify/templates/spec-template.md (technology-agnostic, no conflicting references)
  - ✅ .specify/templates/tasks-template.md (technology-agnostic, no conflicting references)
  - ⚠ .specify/templates/commands/*.md — directory does not exist in this project, nothing to sync
- Follow-up TODOs: none
-->

# Habitos Constitution

## Core Principles

### I. Component-First UI (shadcn/ui Mandatory)

The project MUST use shadcn/ui as its component library. Before writing any UI element
from scratch, the codebase MUST be checked for an existing shadcn/ui component that
satisfies the goal, and that component MUST be used instead. Shared wrappers defined in
`components/ui/page.tsx` MUST be used for page-level layout. Color values MUST come from
the theme tokens defined in `app/globals.css`; hard-coded Tailwind color utilities are
prohibited. Interactive primitives that ship built-in behavior (e.g. the `Sheet` close
control) MUST NOT be reimplemented manually.

**Rationale**: A single component source keeps the UI visually consistent, themeable
(light/dark), accessible, and prevents divergent, hand-rolled implementations of
functionality shadcn/ui already solves.

### II. Data Access Isolation (No Prisma in Components)

Components (Server or Client) MUST NOT import or call Prisma directly. All database
reads and writes MUST be exposed through functions defined in `@data`, following the
pattern established in `app/page.tsx`.

**Rationale**: Centralizing data access keeps persistence logic testable, reusable
across routes, and decoupled from presentation concerns.

### III. Server Actions via next-safe-action

All Server Actions MUST be implemented with `next-safe-action` and MUST live in the
`@actions` folder, using `@actions/create-booking.ts` as the structural base. Client
code MUST invoke Server Actions through the `useAction` hook. Every action that touches
user-scoped data MUST use `protectedActionClient` (`@lib/action-client.ts`) and MUST
explicitly validate authentication and authorization for the acting user before
performing the operation.

**Rationale**: A single, validated action pattern guarantees consistent input parsing,
error handling, and prevents unauthorized mutations from slipping through ad hoc
handlers.

### IV. TypeScript, Clean Code & DRY

All code MUST be written in TypeScript. Code MUST follow SOLID and Clean Code
principles: descriptive variable names (e.g. `isLoading`, `hasError`), no duplicated
logic (extract reusable functions/components instead), kebab-case file and folder
names, and `rem` units instead of `px` for measurements. Source files MUST NOT contain
comments.

**Rationale**: Consistent naming and structure keep the codebase maintainable without
relying on comments that drift out of sync with the code they describe.

### V. Framework & Tooling Conventions

Images MUST be rendered with the Next.js `Image` component. Icons MUST come from
`lucide-react`. ESLint errors MUST be fixed before work is considered done. Before
adding a `Footer`, the relevant `layout.tsx` files MUST be checked to confirm it is not
already rendered. Documentation, library, and API lookups MUST use the Context7 MCP;
semantic code retrieval and editing MUST use the Serena MCP.

**Rationale**: These conventions align the project with Next.js performance best
practices and prevent duplicated UI or stale, hallucinated documentation.

### VI. Manual Verification Only (No Dev Server Checks)

The package manager for this project is pnpm exclusively. Changes MUST NOT be verified
by running `npm run dev` (or starting any dev server as a verification step).
Verification relies on static analysis (TypeScript, ESLint) and manual/user review.

**Rationale**: Keeps agent-driven workflows fast and predictable, and avoids leaving
orphaned background dev-server processes running.

## Technology Stack

The project is built on pnpm, React 19, Next.js 16, Prisma 7 (schema at
`prisma/schema.prisma`), shadcn/ui, and Better Auth for authentication. Any change to
this stack is a governance-level decision and MUST be reflected in this constitution.

## Governance

This constitution supersedes all other conventions and prior guidance for this
repository. All plans, specs, and task lists MUST verify compliance with these
principles at their respective Constitution Check gates.

Amendments require: (1) the proposed change stated explicitly, (2) a version bump
following semantic versioning — MAJOR for backward-incompatible principle removals or
redefinitions, MINOR for new or materially expanded principles, PATCH for wording or
clarification fixes, and (3) propagation of the change to any dependent templates
(`plan-template.md`, `spec-template.md`, `tasks-template.md`) in the same change.

Complexity or deviation from a principle MUST be justified in the relevant plan's
Complexity Tracking section; unjustified deviations MUST be rejected during review.

**Version**: 1.0.0 | **Ratified**: 2026-07-14 | **Last Amended**: 2026-07-14
