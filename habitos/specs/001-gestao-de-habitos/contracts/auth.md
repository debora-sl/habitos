# Contrato: Autenticação (Better Auth)

**Feature**: `001-gestao-de-habitos`

Better Auth expõe endpoints REST sob `/api/auth/*` através do handler em
`app/api/auth/[...all]/route.ts`. O cliente (`lib/auth-client.ts`) encapsula
esses endpoints. Abaixo, o contrato funcional relevante ao escopo.

---

## Endpoints (consumidos via `auth-client`)

- **Cadastro** — `signUp.email({ name, email, password })` (US1, FR-001)
  - Cria `User` + `Account` com hash de senha; autentica na sequência.
  - Falha se `email` já existir (FR-002) ou senha < mínimo (FR-003).
- **Login** — `signIn.email({ email, password })` (US1, FR-004)
  - Cria sessão em sucesso; erro genérico em credenciais inválidas sem revelar
    o campo incorreto (FR-005).
- **Logout** — `signOut()` (FR-006)
  - Encerra a sessão atual.
- **Sessão (servidor)** — `auth.api.getSession({ headers })`
  - Retorna a sessão/usuário ou `null`. Usado nos layouts protegidos (FR-007) e
    injetado no `ctx` do `protectedActionClient`.

## Configuração

- `emailAndPassword: { enabled: true, minPasswordLength: 8 }` (FR-003).
- `database: prismaAdapter(prisma, { provider: "sqlite" })`.
- Variáveis de ambiente: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `DATABASE_URL`.

## Proteção de rotas (FR-007)

- O `layout.tsx` do route group `(app)` chama `getSession` no servidor; se
  `null`, redireciona para `/login`. Nenhuma página de hábitos, semana ou
  dashboard renderiza sem sessão válida.
