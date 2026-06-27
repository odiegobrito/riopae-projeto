# RioPae Stock API

Eu desenvolvi esta API REST para simular um modulo simples de estoque e solicitacao de compra dentro de um ERP. A ideia foi entregar uma base pequena, mas organizada, com regras de negocio claras, autenticacao, cache com Redis, migrations e testes automatizados.

O dominio cobre cadastro de produtos, entradas e saidas de estoque, consulta de saldo, solicitacoes de compra e controle de permissao por perfil.

## Stack que usei

- Node.js + NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- JWT
- Swagger/OpenAPI
- Jest
- Docker Compose

## Requisitos de ambiente

- Node.js 20+
- Docker e Docker Compose
- npm

## Variaveis de ambiente

Eu deixei um `.env.example` no projeto para facilitar a configuracao local.

```bash
cp .env.example .env
```

Variaveis usadas:

| Variavel                  | Descricao                                   | Padrao local                                                             |
| ------------------------- | ------------------------------------------- | ------------------------------------------------------------------------ |
| `APP_NAME`                | Nome da aplicacao                           | `Riopae Stock API`                                                       |
| `DATABASE_URL`            | URL de conexao PostgreSQL usada pelo Prisma | `postgresql://riopae:postgres@localhost:5432/riopae_stock?schema=public` |
| `JWT_SECRET`              | Chave para assinar JWT                      | `riopae-secret-dev`                                                      |
| `JWT_EXPIRES_IN`          | Expiracao do JWT                            | `1d`                                                                     |
| `REDIS_HOST`              | Host do Redis                               | `localhost`                                                              |
| `REDIS_PORT`              | Porta do Redis                              | `6379`                                                                   |
| `STOCK_BALANCE_CACHE_TTL` | TTL do cache de saldo em segundos           | `60`                                                                     |

## Como rodar localmente

Primeiro instale as dependencias:

```bash
npm install
```

Depois suba PostgreSQL e Redis:

```bash
docker compose up -d postgres redis
```

Com o banco no ar, aplique as migrations e rode o seed:

```bash
npx.cmd prisma migrate deploy
npx.cmd prisma db seed
```

Por fim, inicie a API em modo desenvolvimento:

```bash
npm.cmd run start:dev
```

O Swagger fica disponivel em:

```text
http://localhost:3000/docs
```

## Como rodar com Docker Compose

Tambem deixei o projeto preparado para subir tudo com Docker Compose:

```bash
docker compose up --build
```

Em outro terminal, aplique migrations e seed dentro do container da API:

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

Depois disso, a API pode ser acessada em:

```text
http://localhost:3000/docs
```

## Prisma e migrations

Comandos que usei durante o desenvolvimento:

```bash
npx.cmd prisma validate
npx.cmd prisma generate
npx.cmd prisma migrate deploy
npx.cmd prisma studio
```

As migrations criam as tabelas principais do desafio:

- `users`
- `products`
- `stock_movements`
- `purchase_requests`

Na modelagem eu inclui chaves primarias, chaves estrangeiras, enums, indices, timestamps e constraints basicas, como SKU unico, quantidade positiva, estoque minimo nao negativo e solicitacao `PENDING` unica por produto.

## Testes

Para executar os testes:

```bash
npm.cmd test -- --runInBand
```

Para validar o build:

```bash
npm.cmd run build
```

A suite cobre os principais pontos obrigatorios:

- criar produto com SKU unico;
- bloquear SKU duplicado;
- calcular saldo de estoque;
- bloquear saida maior que saldo;
- bloquear aprovacao por usuario sem permissao;
- validar fluxo de solicitacao de compra;
- validar comportamento do cache de saldo.

## Usuarios de teste

Eu optei por seed de usuarios em vez de criar um endpoint publico de cadastro. Assim o avaliador consegue testar os perfis sem precisar montar dados manualmente.

| Email                   | Senha    | Perfil     |
| ----------------------- | -------- | ---------- |
| `operator@riopae.local` | `123456` | `OPERATOR` |
| `manager@riopae.local`  | `123456` | `MANAGER`  |
| `admin@riopae.local`    | `123456` | `ADMIN`    |

Login:

```http
POST /auth/login
```

Payload:

```json
{
  "email": "operator@riopae.local",
  "password": "123456"
}
```

No Swagger, clique em `Authorize` e informe:

```text
Bearer SEU_TOKEN
```

## Permissoes

| Perfil   | Permissoes                                                                               |
| -------- | ---------------------------------------------------------------------------------------- |
| OPERATOR | Criar/listar produtos, consultar saldo, movimentar estoque e criar solicitacao de compra |
| MANAGER  | Tudo do operador + aprovar/reprovar solicitacoes                                         |
| ADMIN    | Acesso total, incluindo ativar/inativar produtos                                         |

## Endpoints

A documentacao interativa esta no Swagger:

```text
GET /docs
```

Principais endpoints:

| Metodo | Rota                             | Descricao                                           |
| ------ | -------------------------------- | --------------------------------------------------- |
| POST   | `/auth/login`                    | Login JWT                                           |
| POST   | `/products`                      | Criar produto                                       |
| GET    | `/products`                      | Listar produtos com filtros `name`, `sku`, `active` ou `status` |
| GET    | `/products/:id`                  | Buscar produto                                      |
| PATCH  | `/products/:id/activate`         | Ativar produto                                      |
| PATCH  | `/products/:id/inactivate`       | Inativar produto                                    |
| GET    | `/products/:id/stock-balance`    | Consultar saldo com cache Redis                     |
| POST   | `/stock-movements`               | Registrar entrada ou saida                          |
| POST   | `/purchase-requests`             | Criar solicitacao de compra                         |
| PATCH  | `/purchase-requests/:id/approve` | Aprovar solicitacao                                 |
| PATCH  | `/purchase-requests/:id/reject`  | Reprovar solicitacao com motivo                     |

## Arquitetura e divisao dos modulos

Eu separei o projeto por modulos para deixar cada parte do dominio mais facil de revisar:

```text
src/
  modules/
    auth/              login JWT, decorators e guards de perfil
    products/          cadastro, listagem, ativacao e saldo de produtos
    stocks/            movimentacoes de estoque e invalidacao de cache
    purchase-requests/ solicitacoes de compra e fluxo approve/reject
    users/             base para evolucao de usuarios
  prisma/              PrismaModule e PrismaService
  shared/redis/        RedisService e RedisModule
prisma/
  schema.prisma
  migrations/
  seed.ts
```

Mantive controllers, services e DTOs separados. O Prisma ficou responsavel pela persistencia relacional e o Redis entrou apenas como cache auxiliar, sem virar fonte da verdade do saldo.

## Redis, TTL e invalidacao

No endpoint `GET /products/:id/stock-balance`, eu calculo o saldo a partir do historico de `stock_movements`.

O fluxo ficou assim:

1. A API consulta a chave `stock-balance:{productId}` no Redis.
2. Se existir valor em cache, retorno o saldo com `source: "cache"`.
3. Se nao existir cache, busco as movimentacoes no PostgreSQL, calculo o saldo e salvo no Redis.
4. O TTL vem de `STOCK_BALANCE_CACHE_TTL`; se nao for configurado, uso `60` segundos.
5. Quando uma nova movimentacao e registrada, removo a chave `stock-balance:{productId}` para forcar o recalculo na proxima consulta.

Se o Redis estiver indisponivel, a API continua funcionando com PostgreSQL. Eu tratei Redis como apoio de performance: falhas de leitura, escrita ou invalidacao no cache nao devem derrubar as operacoes principais.

## Decisoes tecnicas

- Usei JWT simples com seed de usuarios para manter o escopo controlado e facil de testar.
- Usei Prisma 7 com driver adapter PostgreSQL.
- Mantive Redis como cache auxiliar, nunca como fonte oficial do saldo.
- Escolhi invalidar o cache a cada nova movimentacao, porque isso evita devolver saldo antigo.
- Usei decorators e guards para deixar a autorizacao clara nos controllers.
- Mantive `POST /auth/register` fora do escopo, ja que o seed documentado atende ao requisito minimo.
- Inclui `PATCH /products/:id/activate` mesmo nao sendo obrigatorio, porque na pratica o usuario precisa conseguir reativar um produto inativado.

## O que eu melhoraria com mais tempo

- Criaria testes de integracao com PostgreSQL e Redis reais em containers.
- Adicionaria paginacao nas listagens.
- Melhoraria a auditoria de aprovacao/reprovacao com `approvedById` e `rejectedById`.
- Removeria o fallback de usuario de sistema depois que todos os fluxos estivessem obrigatoriamente autenticados.
- Criaria uma pipeline de CI no GitHub Actions.
- Refinaria o tipo `ADJUSTMENT`, que hoje esta no enum, mas nao entrou como fluxo principal.
