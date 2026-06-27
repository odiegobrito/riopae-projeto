# Sprint curta - RioPae Stock API

## Objetivo

Entregar uma API funcional e revisavel para controle de estoque, cobrindo cadastro de produtos, movimentacoes, saldo com Redis, solicitacoes de compra, autenticacao/autorizacao, testes e documentacao de entrega.

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

- [x] Projeto NestJS + TypeScript.
- [x] Docker Compose com API, PostgreSQL e Redis.
- [x] Prisma schema e migrations.
- [x] `.env.example` e `.gitignore`.
- [x] Seed de usuarios.
- [x] CRUD parcial de produtos conforme requisito.
- [x] Movimentacoes de estoque.
- [x] Consulta de saldo com Redis, TTL e invalidacao.
- [x] Solicitacoes de compra.
- [x] JWT e guards por perfil.
- [x] Swagger em `/docs`.
- [x] README completo.
- [x] Testes automatizados acima do minimo obrigatorio.
- [ ] CI no GitHub Actions.

## Riscos, pendencias e limitacoes

- Ainda nao ha suite de integracao real com banco e Redis.
- Nao ha paginacao nas listagens.
- O tipo `ADJUSTMENT` esta no enum, mas o fluxo principal exposto aceita apenas `IN` e `OUT`.
- O projeto usa seed em vez de endpoint publico de cadastro de usuarios.
- A auditoria de aprovacao/reprovacao pode ser enriquecida com `approvedById` e `rejectedById`.
- O fluxo de concorrencia extrema de saida de estoque poderia ser reforcado com locks especificos no PostgreSQL.

## Divisao de trabalho com outro desenvolvedor

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

O PR deve destacar:

- escopo funcional entregue;
- decisoes tecnicas;
- como rodar localmente;
- como testar;
- riscos conhecidos;
- pontos que merecem revisao cuidadosa, especialmente permissoes, constraints e cache.
