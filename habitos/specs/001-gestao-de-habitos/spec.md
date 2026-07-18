# Especificação de Funcionalidade: Sistema de Gestão de Hábitos

**Feature Branch**: `001-gestao-de-habitos`

**Created**: 2026-07-18

**Status**: Draft

**Input**: Descrição do usuário: "Crie um sistema de gestão de hábitos, com autenticação de usuários. Comportamentos esperados: o usuário pode criar conta e fazer login (e-mail e senha); o usuário pode criar hábitos que ele queira praticar; o usuário pode, para cada dia da semana, marcar quais hábitos ele concluiu; o usuário deve conseguir visualizar uma dashboard com métricas de hábitos concluídos por dia."

## Clarifications

### Session 2026-07-18

- Q: Qual janela de tempo o dashboard deve exibir nas métricas de hábitos concluídos por dia? → A: Últimos 30 dias.
- Q: Ao remover um hábito, o que deve acontecer com as conclusões já registradas dele? → A: Manter histórico — a remoção arquiva (oculta) o hábito da lista, preservando as conclusões nas métricas.
- Q: Quais requisitos mínimos a senha deve atender no momento do cadastro? → A: Mínimo de 8 caracteres.
- Q: Como o sistema deve tratar a marcação de conclusão em uma data futura? → A: Bloquear datas futuras na interface e no servidor.
- Q: Que regras de validação o nome do hábito deve seguir? → A: Obrigatório, de 1 a 50 caracteres, único entre os hábitos ativos do usuário.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastro e Autenticação de Usuário (Priority: P1)

Uma pessoa acessa o sistema pela primeira vez, cria uma conta informando e-mail e senha e, em seguida, consegue entrar no sistema com essas credenciais. Ao retornar em outro momento, ela faz login e acessa somente os seus próprios dados.

**Why this priority**: Sem uma identidade autenticada não é possível associar hábitos e conclusões a um usuário específico. É a base sobre a qual todas as demais funcionalidades dependem, garantindo privacidade e isolamento dos dados entre pessoas diferentes.

**Independent Test**: Pode ser testada de forma independente criando uma conta nova, saindo do sistema e entrando novamente com as mesmas credenciais, confirmando que o acesso é concedido e que os dados exibidos pertencem exclusivamente àquele usuário.

**Acceptance Scenarios**:

1. **Given** um visitante sem conta, **When** ele informa um e-mail válido e uma senha que atende às regras mínimas e confirma o cadastro, **Then** a conta é criada e ele é autenticado no sistema.
2. **Given** um usuário já cadastrado, **When** ele informa o e-mail e a senha corretos, **Then** ele é autenticado e direcionado à sua área pessoal.
3. **Given** um visitante na tela de cadastro, **When** ele tenta usar um e-mail já cadastrado, **Then** o sistema impede a criação e informa que o e-mail já está em uso.
4. **Given** um usuário na tela de login, **When** ele informa credenciais incorretas, **Then** o acesso é negado e uma mensagem de erro é exibida sem revelar qual campo está incorreto.
5. **Given** um usuário autenticado, **When** ele escolhe sair, **Then** a sessão é encerrada e o acesso às áreas protegidas passa a exigir novo login.

---

### User Story 2 - Criação e Gestão de Hábitos (Priority: P2)

Um usuário autenticado cadastra os hábitos que deseja praticar (por exemplo, "beber água", "ler 10 páginas", "meditar"), podendo visualizar, editar e remover esses hábitos posteriormente.

**Why this priority**: Os hábitos são a entidade central do sistema. Sem a capacidade de criar hábitos, não há o que acompanhar. Entrega valor imediato ao permitir que o usuário organize suas intenções.

**Independent Test**: Pode ser testada de forma independente com um usuário autenticado criando um ou mais hábitos, conferindo que eles aparecem na sua lista, e então editando ou removendo um deles e confirmando o resultado.

**Acceptance Scenarios**:

1. **Given** um usuário autenticado, **When** ele cria um hábito com um nome válido, **Then** o hábito passa a constar na sua lista de hábitos.
2. **Given** um usuário com hábitos cadastrados, **When** ele acessa sua lista, **Then** vê todos os seus hábitos e nenhum hábito de outro usuário.
3. **Given** um hábito existente, **When** o usuário edita o nome do hábito, **Then** a alteração é persistida e refletida na lista.
4. **Given** um hábito existente, **When** o usuário remove o hábito, **Then** ele deixa de aparecer na lista.
5. **Given** um usuário criando um hábito, **When** ele deixa o nome em branco, **Then** o sistema impede a criação e solicita um nome válido.

---

### User Story 3 - Marcação de Conclusão Diária (Priority: P3)

Um usuário autenticado, ao longo da semana, marca para cada dia quais hábitos concluiu, podendo também desmarcar caso tenha marcado por engano.

**Why this priority**: É a interação recorrente que gera o dado de acompanhamento. Depende da existência de hábitos (US2) e é o que alimenta as métricas do dashboard (US4).

**Independent Test**: Pode ser testada de forma independente com um usuário que possui hábitos, marcando a conclusão de um hábito em um dia específico, verificando que a marcação é registrada, e então desmarcando e confirmando a reversão.

**Acceptance Scenarios**:

1. **Given** um usuário com hábitos cadastrados, **When** ele marca um hábito como concluído em um determinado dia, **Then** essa conclusão é registrada e permanece após recarregar a página.
2. **Given** um hábito marcado como concluído em um dia, **When** o usuário desmarca essa conclusão, **Then** o registro daquele dia é removido.
3. **Given** uma visão da semana, **When** o usuário navega entre os dias da semana, **Then** ele vê quais hábitos estão concluídos em cada dia.
4. **Given** um hábito já concluído em um dia, **When** o usuário tenta marcá-lo novamente para o mesmo dia, **Then** o sistema mantém uma única conclusão para aquele hábito naquele dia.

---

### User Story 4 - Dashboard de Métricas (Priority: P4)

Um usuário autenticado acessa um dashboard que apresenta métricas de quantos hábitos foram concluídos por dia, permitindo acompanhar sua evolução ao longo do tempo.

**Why this priority**: Fornece a percepção de progresso e reforça a motivação. Depende dos dados gerados pela marcação de conclusões (US3), por isso é a última camada de valor.

**Independent Test**: Pode ser testada de forma independente com um usuário que possui conclusões registradas em diferentes dias, acessando o dashboard e confirmando que os números por dia refletem exatamente as conclusões marcadas.

**Acceptance Scenarios**:

1. **Given** um usuário com conclusões registradas em vários dias, **When** ele acessa o dashboard, **Then** vê a quantidade de hábitos concluídos por dia.
2. **Given** um usuário sem nenhuma conclusão registrada, **When** ele acessa o dashboard, **Then** vê uma indicação clara de ausência de dados em vez de valores incorretos.
3. **Given** um usuário no dashboard, **When** novas conclusões são marcadas, **Then** as métricas passam a refletir os dados atualizados na visualização seguinte.

---

### Edge Cases

- O que acontece quando um usuário tenta acessar o dashboard, a lista de hábitos ou a marcação de conclusões sem estar autenticado? O acesso deve ser bloqueado e o usuário direcionado ao login.
- O que acontece quando um hábito é removido após já possuir conclusões registradas? A remoção arquiva o hábito (ocultando-o da lista) e preserva as conclusões, que continuam sendo contabilizadas nas métricas históricas.
- Como o sistema trata a tentativa de marcar a conclusão de um hábito em uma data futura? A marcação é bloqueada na interface e rejeitada pelo servidor.
- Como o sistema se comporta quando um usuário possui muitos hábitos, garantindo que a visão semanal e o dashboard permaneçam legíveis?
- O que acontece se dois pedidos de marcação/desmarcação do mesmo hábito no mesmo dia chegarem quase simultaneamente? O resultado final deve ser consistente e sem duplicidade.
- Como o sistema trata senhas que não atendem ao requisito mínimo de segurança (mínimo de 8 caracteres) durante o cadastro? O cadastro é impedido e uma mensagem orienta o requisito.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que um visitante crie uma conta informando e-mail e senha.
- **FR-002**: O sistema MUST validar que o e-mail informado no cadastro tem formato válido e ainda não está associado a outra conta.
- **FR-003**: O sistema MUST exigir uma senha com no mínimo 8 caracteres no momento do cadastro.
- **FR-004**: O sistema MUST permitir que um usuário cadastrado se autentique com e-mail e senha.
- **FR-005**: O sistema MUST negar o acesso quando as credenciais informadas forem inválidas, sem revelar qual campo está incorreto.
- **FR-006**: O sistema MUST permitir que o usuário autenticado encerre sua sessão.
- **FR-007**: O sistema MUST restringir todas as áreas de hábitos, marcações e dashboard a usuários autenticados.
- **FR-008**: O sistema MUST garantir que cada usuário acesse somente os seus próprios hábitos e conclusões, sem visualizar dados de outros usuários.
- **FR-009**: O usuário MUST ser capaz de criar um hábito informando um nome descritivo.
- **FR-010**: O sistema MUST impedir a criação de um hábito cujo nome, após remover espaços nas extremidades, esteja vazio ou exceda 50 caracteres.
- **FR-011**: O usuário MUST ser capaz de visualizar a lista dos seus hábitos.
- **FR-012**: O usuário MUST ser capaz de editar um hábito existente.
- **FR-013**: O usuário MUST ser capaz de remover um hábito existente; a remoção MUST arquivar o hábito, ocultando-o da lista, e MUST preservar as conclusões já registradas para fins de métricas históricas.
- **FR-014**: O usuário MUST ser capaz de marcar um hábito como concluído em um dia específico.
- **FR-015**: O usuário MUST ser capaz de desmarcar a conclusão de um hábito em um dia específico.
- **FR-016**: O sistema MUST manter no máximo uma conclusão por hábito por dia, evitando registros duplicados.
- **FR-017**: O sistema MUST permitir que o usuário visualize, por dia da semana, quais hábitos estão concluídos.
- **FR-018**: O sistema MUST persistir hábitos e conclusões de modo que permaneçam disponíveis entre sessões e após recarregar a aplicação.
- **FR-019**: O sistema MUST apresentar um dashboard com a quantidade de hábitos concluídos por dia, considerando a janela dos últimos 30 dias.
- **FR-020**: O sistema MUST exibir uma indicação clara de ausência de dados no dashboard quando não houver conclusões registradas.
- **FR-021**: O sistema MUST impedir que um usuário possua dois hábitos ativos com o mesmo nome.
- **FR-022**: O sistema MUST bloquear a marcação de conclusão em datas futuras, tanto na interface quanto na validação do servidor.
- **FR-023**: O dashboard MUST contabilizar também as conclusões de hábitos arquivados nas métricas históricas.

### Key Entities *(include if feature involves data)*

- **Usuário**: Representa a pessoa que utiliza o sistema. Atributos principais: identificador único, e-mail (único), credencial de acesso e data de criação. É o proprietário de todos os hábitos e conclusões associados a ele.
- **Hábito**: Representa uma prática que o usuário deseja acompanhar. Atributos principais: identificador único, nome (de 1 a 50 caracteres, único entre os hábitos ativos do usuário), estado (ativo ou arquivado), referência ao usuário proprietário e data de criação. A remoção arquiva o hábito em vez de apagá-lo, preservando suas conclusões. Um usuário possui muitos hábitos.
- **Conclusão de Hábito**: Representa o registro de que um hábito foi concluído em um determinado dia. Atributos principais: referência ao hábito, dia a que se refere (não pode ser futuro) e data do registro. É única por combinação de hábito e dia. Um hábito possui muitas conclusões, uma por dia no máximo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um novo usuário consegue concluir o cadastro e entrar no sistema em menos de 2 minutos na primeira tentativa.
- **SC-002**: Um usuário autenticado consegue criar um novo hábito em até 30 segundos, sem instruções externas.
- **SC-003**: 95% das tentativas de marcar ou desmarcar a conclusão de um hábito refletem o resultado esperado na visão da semana sem necessidade de recarregar manualmente.
- **SC-004**: As métricas exibidas no dashboard correspondem, com 100% de precisão, ao total de conclusões efetivamente registradas por dia nos últimos 30 dias.
- **SC-005**: Nenhum usuário consegue visualizar ou alterar hábitos e conclusões pertencentes a outro usuário em 100% das tentativas.
- **SC-006**: 90% dos usuários conseguem, no primeiro acesso, entender no dashboard em qual dia concluíram mais hábitos sem ajuda adicional.

## Assumptions

- A autenticação utiliza exclusivamente e-mail e senha; provedores externos (login social, SSO) estão fora do escopo desta versão.
- Os hábitos são uma lista livre definida pelo usuário e podem ser marcados como concluídos em qualquer dia, sem agendamento fixo por dia da semana (não há hábitos vinculados a dias específicos nesta versão).
- A "semana" é apresentada com base no dia atual, permitindo ao usuário navegar e marcar conclusões dos dias correntes e passados; marcações em datas futuras são bloqueadas na interface e no servidor.
- O dashboard apresenta métricas de conclusões por dia considerando a janela dos últimos 30 dias; agregações mais avançadas (sequências, taxas de sucesso por hábito, comparativos entre semanas) estão fora do escopo desta versão.
- Cada usuário gerencia apenas seus próprios hábitos; não há compartilhamento, colaboração ou papéis administrativos nesta versão.
- Recuperação de senha e verificação de e-mail não fazem parte do escopo desta versão, embora possam ser adicionadas posteriormente.
- O acesso ocorre por meio de um navegador web; aplicativos móveis nativos estão fora do escopo desta versão.
