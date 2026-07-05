# ToriiPay · app

Next.js 14 (App Router) dApp: merchant dashboard + payer checkout for
ToriiPay, HashKey Chain's compliant cross-chain settlement rail.

## Stack

Next.js 14, TypeScript, Tailwind CSS, wagmi v2 / viem, ethers v6, and the
HSP SDK (`@hsp/sdk`, cloned from source -- see below).

## Local setup

```bash
npm install
cp .env.example .env.local     # fill in contract addresses + HSP sandbox keys
npm run dev                    # http://localhost:3000
```

### Wiring up the HSP SDK

The HSP SDK isn't published to npm for this hackathon; it ships as a repo
(`hsp-hackathon.hashkeymerchant.com/docs`, §04):

```bash
git clone https://github.com/project-hsp/hsp ../hsp-sdk
npm install ../hsp-sdk/packages/sdk ../hsp-sdk/packages/core
```

Then get a sandbox API key at `/register` and testnet USDC at `/faucet`, and
fill `NEXT_PUBLIC_HSP_COORDINATOR_URL` / `NEXT_PUBLIC_HSP_API_KEY` into
`.env.local`. All HSP calls in this app are isolated to `lib/hsp.ts`.

### Wiring up contracts

After deploying from the `contracts` repo, copy the addresses from
`contracts/deployments/hashkeyTestnet.json` into this repo's `.env.local` --
`lib/contracts.ts` reads them from `NEXT_PUBLIC_*` env vars so both repos
always point at the same deployment.

## Pages

| Route | Purpose |
|---|---|
| `/` | Merchant dashboard: connect wallet, view TrustScore, create invoices |
| `/pay/[invoiceId]` | Payer checkout: approve USDC, pay via HSP, watch the ToriiStatusGate fill in |

## Design notes

Palette: ink `#141414`, indigo `#1C2541`, vermillion `#C8452C`, paper stone
`#EDE8DD`, gold `#B08D57` (reserved for confirmed/trust-related state). Type:
Shippori Mincho (display) + IBM Plex Sans (body) + IBM Plex Mono (addresses,
amounts, hashes). The signature element is `components/ToriiStatusGate.tsx`
-- a torii gate whose two pillars fill in step by step as an invoice moves
from paid → HSP-confirmed, echoing HSP's own `required ⊆ satisfied` rule.
