# h stack

- [htmx](https://htmx.org/)
- [hono](https://hono.dev/)
- [drizzle](https://orm.drizzle.team/)

Plug this with any JS runtime (`cloudflare workers`, `deno`, `bun`, ...), any database (`mysql`, `sqlite`, `postgre`) or cloud database (`d1`, `neon`, `turso`, ...).

This example uses:

- [cloudflare workers](https://developers.cloudflare.com/workers/)
- [cloudflare d1](https://developers.cloudflare.com/d1/)
- some [hyperscript](https://hyperscript.org/)
- [simple.css](https://simplecss.org/) (yes i'm lazy so no tailwind)

## demo

https://hstack.atmos4.workers.dev/

Each request is handled by `hono` on a `cloudflare worker`, fetches `d1` data with `drizzle` and returns html that `htmx` injects in the page surgically.

## run locally

First, create a Cloudflare account. Then:

- clone repo
- `npm install`
- create d1 database

```bash
npx wrangler d1 create <your-db-name>
```

copy the output and replace things in `wrangler.toml`.

- apply migrations to local db

```bash
npm run d1:local:apply
```

- run the server locally

```bash
npm run dev
```

## deploy

- apply migrations to d1

```bash
npm run d1:apply
```

- deploy

```bash
npm run deploy
```

and voila. as easy as that.

## migrations

- change stuff in `db/schema.ts`
- then run

```bash
npm run drizzle:generate
npm run d1:local:apply
```

this will generate a new migration and apply it. Rerun the `deploy` steps to ship it to production.

## more info

If you want to suppress d1 warnings, create a `.env` file based on `.env.example`

If you struggle to understand this example, the [official d1 tutorial](https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/) uses Hono too. It is very similar to what I have built and describes the steps to create your first d1 database very well.

The core of this stack is Hono + HTMX, hence the name. The rest of what I have used here can be replaced what something else.
