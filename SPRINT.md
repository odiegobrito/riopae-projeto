# Sprint curta - RioPae Stock API

## Objetivo

Nesta sprint eu foquei em entregar uma API funcional, revisavel e simples de rodar. A meta foi cobrir o fluxo principal de estoque e solicitacao de compra sem fugir do escopo do desafio: produtos, movimentacoes, saldo com Redis, autenticacao/autorizacao, testes e documentacao.

## Historias de usuario

### 1. Produtos

Como operador, quero cadastrar e consultar produtos para manter o catalogo de estoque atualizado.

Criterios de aceite:

- Criar produto com nome, SKU e estoque minimo.
- Bloquear SKU duplicado.
- Bloquear estoque minimo negativo.
- Listar produtos com filtros por nome, SKU e active.
- Consultar produto por ID.
- Permitir ativacao/inativacao conforme permissao.

### 2. Movimentacoes de estoque

Como operador, quero registrar entradas e saidas para manter o saldo atualizado.

Criterios de aceite:

- Registrar `IN` e `OUT`.
- Quantidade deve ser maior que zero.
- Produto inexistente ou inativo nao pode receber movimentacao.
- Saida maior que saldo disponivel deve ser bloqueada.
- Toda movimentacao deve ficar historizada.
- Saida deve usar transacao.

### 3. Saldo com Redis

Como usuario autenticado, quero consultar rapidamente o saldo atual de um produto.

Criterios de aceite:

- Consultar saldo em `GET /products/:id/stock-balance`.
- Cachear o resultado no Redis com TTL.
- Invalidar cache quando houver nova movimentacao.
- Manter a API funcional se o Redis estiver indisponivel.

### 4. Solicitacao de compra

Como operador, quero solicitar compra de um produto para reposicao.

Criterios de aceite:

- Criar solicitacao como `PENDING`.
- Bloquear duplicidade `PENDING` para o mesmo produto.
- Aprovar somente solicitacoes `PENDING`.
- Reprovar somente solicitacoes `PENDING` e exigir motivo.
- Solicitacao aprovada ou reprovada nao pode ser alterada novamente.

### 5. Autenticacao e autorizacao

Como avaliador, quero validar a API com perfis diferentes.

Criterios de aceite:

- Login com JWT em `POST /auth/login`.
- Usuarios de teste via seed.
- `OPERATOR` cria/lista produtos, movimenta estoque e cria solicitacao.
- `MANAGER` faz tudo do operador e aprova/reprova solicitacoes.
- `ADMIN` tem acesso total.

## Checklist tecnico

- [x] Criei o projeto com NestJS + TypeScript.
- [x] Configurei Docker Compose com API, PostgreSQL e Redis.
- [x] Modelei o Prisma schema e gerei migrations.
- [x] Adicionei `.env.example` e `.gitignore`.
- [x] Criei seed de usuarios de teste.
- [x] Implementei o cadastro e a consulta de produtos.
- [x] Implementei movimentacoes de estoque.
- [x] Adicionei consulta de saldo com Redis, TTL e invalidacao.
- [x] Implementei solicitacoes de compra.
- [x] Adicionei JWT e guards por perfil.
- [x] Disponibilizei Swagger em `/docs`.
- [x] Documentei a entrega no README.
- [x] Criei testes automatizados acima do minimo obrigatorio.

## Riscos, pendencias e limitacoes

- Ainda nao criei uma suite de integracao real com banco e Redis em containers.
- As listagens ainda nao possuem paginacao.
- O tipo `ADJUSTMENT` esta no enum, mas eu mantive o fluxo principal somente com `IN` e `OUT`.
- Usei seed em vez de endpoint publico de cadastro de usuarios.
- A auditoria de aprovacao/reprovacao ainda pode evoluir com `approvedById` e `rejectedById`.
- Em um cenario de concorrencia muito alta, eu reforcaria a saida de estoque com locks especificos no PostgreSQL.

## Como eu dividiria com outro desenvolvedor

Se eu trabalhasse em dupla, dividiria assim:

Desenvolvedor A:

- Produtos.
- Movimentacoes.
- Saldo com Redis.
- Testes de estoque e cache.

Desenvolvedor B:

- Autenticacao/autorizacao.
- Solicitacoes de compra.
- Documentacao.
- Testes de permissao e fluxo de compra.

Revisao conjunta:

- Migrations e constraints.
- Regras de permissao.
- Estrategia de cache.
- Descricao do PR e pontos de code review.

## Plano de code review

No PR eu destacaria:

- o escopo funcional entregue;
- as decisoes tecnicas que tomei;
- como rodar localmente;
- como executar testes;
- riscos conhecidos;
- pontos que merecem revisao cuidadosa, principalmente permissoes, constraints e cache.

## Resumo que eu colocaria no PR

Eu abriria o PR como uma entrega fechada da sprint curta. Na descricao, deixaria claro que a API cobre produtos, movimentacoes de estoque, saldo com Redis, solicitacoes de compra, autenticacao com JWT, autorizacao por perfil, migrations, seed, Swagger e testes automatizados.

Tambem chamaria atencao para os pontos que eu gostaria que outro desenvolvedor revisasse com mais cuidado: regras de permissao, transacao na saida de estoque, invalidacao do cache Redis e constraints do banco.
