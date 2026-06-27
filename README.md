# RioPae Stock API

API REST para controle de estoque da RioPae. O dominio cobre cadastro de produtos, movimentacoes de entrada e saida, consulta de saldo com cache Redis, solicitacoes de compra e autorizacao por perfil.

## Stack

- Node.js + NestJS
- TypeScript
- PostgreSQL
- Prisma ORM
- Redis
- JWT
- Swagger/OpenAPI
- Jest

## Requisitos de ambiente

- Node.js 20+
- Docker e Docker Compose
- npm

## Variaveis de ambiente

Copie o arquivo de exemplo:

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

Nao commite `.env`, tokens ou credenciais reais.

## Como rodar localmente

Instale as dependencias:

```bash
npm install
```

Suba PostgreSQL e Redis:

```bash
docker compose up -d postgres redis
```

Execute migrations e seed:

```bash
npx.cmd prisma migrate deploy
npx.cmd prisma db seed
```

Inicie a API em modo desenvolvimento:

```bash
npm.cmd run start:dev
```

Swagger:

```text
http://localhost:3000/docs
```

## Como rodar com Docker Compose

Suba todos os servicos:

```bash
docker compose up --build
```

Em outro terminal, aplique migrations e seed dentro do container da API:

```bash
docker compose exec api npx prisma migrate deploy
docker compose exec api npx prisma db seed
```

A API ficara disponivel em:

```text
http://localhost:3000/docs
```

## Migrations e Prisma

Validar schema:

```bash
npx.cmd prisma validate
```

Gerar client:

```bash
npx.cmd prisma generate
```

Aplicar migrations:

```bash
npx.cmd prisma migrate deploy
```

Abrir Prisma Studio:

```bash
npx.cmd prisma studio
```

## Testes

Executar testes automatizados:

```bash
npm.cmd test -- --runInBand
```

Build:

```bash
npm.cmd run build
```

A suite cobre, entre outros cenarios:

- criar produto com SKU unico;
- bloquear SKU duplicado;
- calcular saldo de estoque;
- bloquear saida maior que saldo;
- bloquear aprovacao por usuario sem permissao.

## Usuarios de teste

Os usuarios sao criados pelo seed:

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

Swagger/OpenAPI:

```text
GET /docs
```

Principais endpoints:

| Metodo | Rota                             | Descricao                                           |
| ------ | -------------------------------- | --------------------------------------------------- |
| POST   | `/auth/login`                    | Login JWT                                           |
| POST   | `/products`                      | Criar produto                                       |
| GET    | `/products`                      | Listar produtos com filtros `name`, `sku`, `active` |
| GET    | `/products/:id`                  | Buscar produto                                      |
| PATCH  | `/products/:id/activate`         | Ativar produto                                      |
| PATCH  | `/products/:id/inactivate`       | Inativar produto                                    |
| GET    | `/products/:id/stock-balance`    | Consultar saldo com cache Redis                     |
| POST   | `/stock-movements`               | Registrar entrada ou saida                          |
| POST   | `/purchase-requests`             | Criar solicitacao de compra                         |
| PATCH  | `/purchase-requests/:id/approve` | Aprovar solicitacao                                 |
| PATCH  | `/purchase-requests/:id/reject`  | Reprovar solicitacao com motivo                     |

## Arquitetura e modulos

```text
src/
  modules/
    auth/              JWT, login, decorators e guards de perfil
    products/          cadastro, listagem, campo active e saldo de produtos
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

O Nest separa controllers, services e DTOs por modulo. O Prisma concentra a persistencia relacional e o Redis e usado apenas como cache auxiliar.

## Redis, TTL e invalidacao

O endpoint `GET /products/:id/stock-balance` calcula o saldo a partir do historico de `stock_movements`.

Fluxo:

1. A API consulta a chave `stock-balance:{productId}` no Redis.
2. Se existir valor, retorna `source: "cache"`.
3. Se nao existir valor, busca as movimentacoes no PostgreSQL, calcula o saldo e grava no Redis.
4. O TTL vem de `STOCK_BALANCE_CACHE_TTL`; se nao configurado, usa `60` segundos.
5. Toda nova movimentacao remove a chave `stock-balance:{productId}` para forcar recalculo na proxima consulta.

Se o Redis estiver indisponivel, a API continua funcionando com PostgreSQL. Falhas de leitura, escrita ou invalidacao no Redis nao bloqueiam as operacoes principais.

## Banco de dados

As migrations criam:

- `users`
- `products`
- `stock_movements`
- `purchase_requests`

A modelagem inclui chaves primarias, chaves estrangeiras, enums, indices, timestamps e constraints basicas como SKU unico, quantidade positiva, estoque minimo nao negativo e solicitacao `PENDING` unica por produto.

## Decisoes tecnicas

- JWT simples com seed de usuarios para reduzir escopo e manter o fluxo testavel.
- Prisma 7 com driver adapter PostgreSQL.
- Redis tratado como cache auxiliar, nunca como fonte da verdade.
- Cache de saldo por invalidacao em nova movimentacao, evitando recalculo em leituras repetidas.
- Roles via decorators e guards para manter autorizacao declarativa nos controllers.
- `POST /auth/register` ficou fora do escopo; a entrega usa seed documentada.

## Pendencias e melhorias futuras

- Adicionar testes de integracao com PostgreSQL e Redis reais em containers.
- Adicionar paginacao em listagens.
- Melhorar auditoria de quem aprova/reprova solicitacoes.
- Trocar o usuario fallback de sistema por autenticacao obrigatoria em todos os fluxos internos.
- Adicionar pipeline CI no GitHub Actions.
- Refinar regra do tipo `ADJUSTMENT`, hoje mantido no enum mas nao exposto como fluxo principal.
