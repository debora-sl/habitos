# Plano de Correção — Erro no Menu da Conta (`MenuGroupContext is missing`)

## 1. Descrição do erro

Ao clicar no ícone/avatar do nome no topo da tela, a aplicação lança um
**Runtime Error**:

```
Base UI: MenuGroupContext is missing. Menu group parts must be used
within <Menu.Group> or <Menu.RadioGroup>.

  at DropdownMenuLabel (components/ui/dropdown-menu.tsx:64:5)
  at AccountMenu (components/habitos/account-menu.tsx:66:9)
  at AppNav (components/habitos/app-nav.tsx:57:7)
  at AppLayout (app/(app)/layout.tsx:20:9)
```

## 2. Causa raiz

O componente `DropdownMenuLabel` (`components/ui/dropdown-menu.tsx:56`) é
implementado sobre o primitivo **`MenuPrimitive.GroupLabel`** do Base UI:

```tsx
function DropdownMenuLabel({ ... }) {
  return <MenuPrimitive.GroupLabel data-slot="dropdown-menu-label" ... />
}
```

No Base UI, `Menu.GroupLabel` depende do contexto `MenuGroupContext`, que é
fornecido **exclusivamente** por um `Menu.Group` (ou `Menu.RadioGroup`) pai.

Em `components/habitos/account-menu.tsx:66`, o `DropdownMenuLabel` (usado como
cabeçalho com nome + e-mail do usuário) está colocado **diretamente** dentro do
`DropdownMenuContent`, sem nenhum `DropdownMenuGroup` (`Menu.Group`) ao redor:

```tsx
<DropdownMenuContent align="end" className="w-56">
  <DropdownMenuLabel ...>        {/* ← sem Group pai → contexto ausente */}
    <span>{user.name}</span>
    <span>{user.email}</span>
  </DropdownMenuLabel>
  ...
</DropdownMenuContent>
```

Como não há `MenuGroupContext`, o Base UI lança o erro em tempo de execução.

> Observação: este é um comportamento novo/mais estrito do Base UI (usado pela
> versão atual do shadcn/ui neste projeto). No Radix UI antigo o `Label` podia
> ser usado solto, o que provavelmente explica o código atual.

## 3. Opções de correção

### Opção A — Envolver o rótulo em `DropdownMenuGroup` (recomendada)

Manter o `DropdownMenuLabel` semântico e apenas fornecer o contexto exigido,
envolvendo o cabeçalho do usuário em `DropdownMenuGroup` dentro do
`account-menu.tsx`.

- **Prós:** alteração mínima e localizada; preserva a semântica/acessibilidade
  do rótulo de grupo; não mexe no componente compartilhado de UI.
- **Contras:** exige lembrar de usar `Group` sempre que houver um `Label`.

Esboço (apenas ilustrativo — **não aplicar agora**):

```tsx
<DropdownMenuGroup>
  <DropdownMenuLabel className="flex flex-col gap-0.5 px-1.5 py-1">
    <span className="text-sm font-medium text-foreground">{user.name}</span>
    <span className="text-xs font-normal text-muted-foreground">
      {user.email}
    </span>
  </DropdownMenuLabel>
</DropdownMenuGroup>
```

Seria necessário importar `DropdownMenuGroup` (já exportado em
`components/ui/dropdown-menu.tsx:257`) no `account-menu.tsx`.

### Opção B — Tornar o `DropdownMenuLabel` independente de `Group`

Alterar o componente base para **não** usar `MenuPrimitive.GroupLabel`,
renderizando um elemento comum (ex.: `<div data-slot="dropdown-menu-label">`),
permitindo uso solto — como fazem versões recentes do shadcn/ui sobre Base UI.

- **Prós:** conserta o problema em todos os usos de uma vez; label passa a poder
  ser usado sem `Group`.
- **Contras:** altera um componente compartilhado de `components/ui`; perde o
  vínculo semântico entre label e grupo quando o `Group` de fato existir.

### Opção recomendada

**Opção A**, por ser a mais alinhada às regras do projeto (usar os componentes do
shadcn como estão, mudança mínima e sem reescrever componentes de `components/ui`).

## 4. Passos de implementação (Opção A)

1. Abrir `components/habitos/account-menu.tsx`.
2. Adicionar `DropdownMenuGroup` à lista de imports vinda de
   `@/components/ui/dropdown-menu`.
3. Envolver o bloco do `DropdownMenuLabel` (nome + e-mail) com
   `<DropdownMenuGroup>...</DropdownMenuGroup>`.
4. Manter o restante do menu inalterado (`DropdownMenuRadioGroup` já fornece seu
   próprio contexto e não é afetado).

## 5. Validação

- Confirmar que não há outros usos de `DropdownMenuLabel` fora de um
  `DropdownMenuGroup`/`DropdownMenuRadioGroup` no projeto (busca por
  `DropdownMenuLabel`). Atualmente o único uso é em `account-menu.tsx`.
- Rodar o lint do projeto e corrigir eventuais avisos (`pnpm lint`).
- Abrir a aplicação, clicar no avatar no topo e verificar que o menu abre sem o
  erro de runtime, exibindo nome, e-mail, opções de tema e o botão "Sair".

## 6. Arquivos impactados

- `components/habitos/account-menu.tsx` (única alteração na Opção A).
- (Opção B alternativa) `components/ui/dropdown-menu.tsx`.
