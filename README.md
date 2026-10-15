# Focus Tech — API de E-commerce

API REST para cadastro, autenticação, catálogo, carrinho e pedidos, construída para o desafio de backend da Focus Tech.

## Tecnologias e arquitetura

- Node.js, TypeScript 7, Express 5, Zod 4, Prisma 7 e PostgreSQL.
- JWT para autenticação e bcrypt para hash de senhas.
- Separação modular em rotas, controllers, services, repositories, schemas e middlewares.
- PostgreSQL foi escolhido por ser relacional e oferecer transações, constraints, locks de linha e `NUMERIC` para preservar integridade e valores monetários.

## Estrutura

```text
src/
  Middlewares/       autenticação, validação e erros
  config/            cliente Prisma e configuração JWT
  modules/           auth, users, products, carts, checkout, orders
  routes.ts          composição das rotas
prisma/              schema e migrations
tests/               testes de schemas e integração HTTP/concorrência
```

## Requisitos e configuração

Requer Node.js `20.19+`, `22.12+` ou `24+` (versões aceitas pelo Prisma Client instalado), npm e PostgreSQL. Copie `.env.example` para `.env` e informe as configurações locais:

```env
APP_PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=replace-with-a-random-secret-of-at-least-32-bytes
JWT_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=12
```

Não compartilhe `.env`. Ele é ignorado pelo Git. Instale e inicialize:

```bash
npm ci
npx prisma generate
npx prisma migrate deploy
npm run dev
```

O servidor usa `APP_PORT` (padrão `3000`). Antes de usar migrations em qualquer banco existente, faça backup e revise a seção de compatibilidade abaixo.

O modelo exige que categorias já existam. Antes de criar produtos, cadastre ao menos uma categoria no banco:

```sql
INSERT INTO categories (name, created_at, updated_at)
VALUES ('Eletrônicos', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

## Comandos

```bash
npm run typecheck
npm run build
TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce_test npm test
npx prisma validate
npx prisma generate
```

`npm test` executa testes de schemas e, quando `TEST_DATABASE_URL` aponta para um banco separado com `test` no nome, testes HTTP com Supertest e concorrência. A suíte recusa uma URL de teste igual a `DATABASE_URL`. Aplique primeiro as migrations nesse banco descartável com `DATABASE_URL="$TEST_DATABASE_URL" npx prisma migrate deploy`.

## Rotas

Todas as rotas usam o prefixo `/api`. Rotas protegidas requerem `Authorization: Bearer <accessToken>`.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/auth/register` | público | Cadastra usuário |
| POST | `/auth/login` | público | Emite JWT |
| GET | `/users/me` | JWT | Consulta o próprio usuário |
| GET | `/products?page=1&limit=10&search=notebook` | público | Lista produtos ativos |
| GET | `/products/:id` | público | Consulta produto ativo |
| POST | `/products` | JWT | Cria produto |
| PUT/PATCH | `/products/:id` | JWT | Atualiza produto |
| DELETE | `/products/:id` | JWT | Desativa produto (204) |
| GET | `/cart` | JWT | Consulta carrinho |
| POST | `/cart/items` | JWT | Adiciona item |
| PUT | `/cart/items/:productId` | JWT | Altera quantidade |
| DELETE | `/cart/items/:productId` | JWT | Remove item (204) |
| POST | `/checkout` | JWT | Cria pedido pago simulado |
| GET | `/orders` | JWT | Lista pedidos do usuário |

Cadastro: `POST /api/auth/register` com `{ "name": "Eduarda", "email": "eduarda@example.com", "password": "SenhaForte123!" }` retorna `201` sem a senha.

Login: `POST /api/auth/login` com e-mail e senha retorna `{ "accessToken": "…", "tokenType": "Bearer" }`. Credenciais inválidas retornam `401` genérico.

Produto requer `name`, `description`, `price`, `stock` (opcional, padrão 0) e `categoryId` inteiro positivo. O endpoint de listagem retorna `data` e `pagination` com `page`, `limit`, `total`, `totalPages` e flags de navegação.

O carrinho retorna `items` com `productId`, `name`, `quantity`, `unitPrice` e `subtotal`, mais `total`. Adicionar um produto existente soma as quantidades, sujeito ao estoque. Valores monetários são retornados como strings decimais.

## Regras de negócio e concorrência

- O cadastro cria um carrinho e armazena apenas hash bcrypt.
- Cada usuário tem um carrinho; a constraint única e a chave composta evitam carrinhos/itens duplicados.
- Produto removido é marcado inativo. Consultas públicas não retornam itens inativos e pedidos antigos preservam a referência ao produto.
- Checkout grava pedido, snapshots de preço, estoque e limpeza do carrinho dentro de uma transação. O estoque é decrementado por atualização condicional (`stock >= quantidade`), impedindo saldo negativo.
- A linha do carrinho é bloqueada durante adição, atualização e remoção; checkouts concorrentes do mesmo usuário aguardam e o segundo não consegue repetir itens já consumidos.
- Pedidos são filtrados pelo usuário derivado do JWT e ordenados do mais recente para o mais antigo.
- Erros seguem `{ "error": { "code": "...", "message": "..." } }`.

## Compatibilidade das migrations — atenção

O histórico legado não correspondeu ao schema atual: a migration inicial declara IDs `TEXT`, e a migration `20261006002442_ajuste_na_category` remove e recria `category_id` como inteiro, com aviso explícito de perda de dados. Foi adicionada uma migration posterior que converte os IDs textuais remanescentes com mapeamento de chaves e referências. As migrations antigas não foram editadas.

O histórico completo e a nova migration foram executados em um PostgreSQL 18 descartável. Também foram inseridos registros legados com IDs textuais e relações entre usuário, carrinho, produto e pedido antes da conversão; os IDs viraram inteiros e as relações, quantidades e snapshots de preço permaneceram íntegros. A recriação limpa via `prisma migrate deploy` também passou.

A validação cobre a nova conversão e a recriação limpa, não autoriza aplicá-la automaticamente em uma base existente. A migration histórica de categoria ainda pode perder dados ou falhar em uma base que já tivesse produtos quando foi executada. Em banco existente, confira `prisma migrate status`, faça backup e ensaie em uma cópia; não execute `migrate reset` ou `db push`.

## Erros

`400 VALIDATION_ERROR` para entradas inválidas, `401` para autenticação inválida, `404` para recursos ausentes, `409 EMAIL_ALREADY_EXISTS` para e-mail duplicado e `500 INTERNAL_ERROR` para falhas inesperadas. Erros internos não incluem stack trace na resposta.

## Estado de validação

Validados com `npm ci`, `npx prisma validate`, `npx prisma generate`, `npm run typecheck`, `npm run build` e `npm test` conectado a PostgreSQL descartável. A suíte executou 8 testes sem falhas; a conversão legada preservou as relações verificadas.
