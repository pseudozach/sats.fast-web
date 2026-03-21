# sats.fast website

Minimalistic website for [sats.fast](https://github.com/pseudozach/sats.fast) — your personal Bitcoin financial agent.

## Features

- **Landing page** with one-command install CTA
- **Username registration** — claim `yourname@sats.fast`
- **Lightning Address resolution** (LUD-16) at `/.well-known/lnurlp/:username`
- **LNURL-pay invoices** (LUD-06) via Spark SDK at `/lnurl/payreq/:username`
- **Liquid address resolution** at `/.well-known/liquid/:username`
- **Liquid payment requests** at `/liquid/payreq/:username`
- **Auto-migration** — database tables are created automatically on first request
- **Auto-wallet** — Spark gateway mnemonic is generated and stored on first run

## Tech Stack

- **Next.js 15** (App Router) — deployed to Vercel
- **Supabase** — PostgreSQL for user storage
- **@buildonspark/spark-sdk** — Lightning invoice generation
- **Tailwind CSS** — styling

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd sats.fast-website
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:
- `SUPABASE_URL` — your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — your Supabase service role key
- `DOMAIN` — `sats.fast` (or your custom domain)
- `SPARK_MNEMONIC` — *(optional)* leave blank to auto-generate on first run
- `SPARK_NETWORK` — `MAINNET` or `REGTEST`

That's it. No database migrations to run — tables are created automatically on the first API call.
The Spark gateway wallet mnemonic is auto-generated and stored in Supabase on first run.

### 3. Run locally

```bash
pnpm dev
```

## Vercel Deployment

1. Push to GitHub
2. Import in Vercel
3. Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `DOMAIN` as environment variables
4. Deploy — everything else is automatic

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/.well-known/lnurlp/:username` | GET | LUD-16 Lightning Address discovery |
| `/lnurl/payreq/:username?amount=<msat>` | GET | LUD-06 invoice generation |
| `/.well-known/liquid/:username` | GET | Liquid address discovery |
| `/liquid/payreq/:username` | GET | Liquid payment request |
| `/api/register` | POST | Register username + addresses |

## How Lightning Address Resolution Works

1. Wallet sees `bob@sats.fast`
2. Wallet fetches `https://sats.fast/.well-known/lnurlp/bob`
3. Response includes callback URL
4. Wallet calls callback with amount → gets a Lightning invoice
5. Invoice is created via Spark SDK, routed to Bob's Spark public key
6. Payment goes directly to Bob's self-custodial wallet

## License

MIT
