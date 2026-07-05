/**
 * HSP integration for ToriiPay.
 *
 * The HSP SDK (`@hsp/sdk`) ships as a cloned repo for this hackathon, not an
 * npm package (see hsp-hackathon.hashkeymerchant.com/docs, §04 Quickstart).
 * To wire this up locally:
 *
 *   git clone https://github.com/project-hsp/hsp ../hsp-sdk
 *   npm install ../hsp-sdk/packages/sdk --save   (or add as an npm workspace)
 *
 * Until then this file exposes the same shape (`payInvoice`, `verifyPayment`)
 * as thin wrappers so the rest of the app can be built and typed against a
 * stable interface, with the real `@hsp/sdk` import isolated to one place.
 */

import type { Address } from "viem";

export interface HSPConfig {
  coordinatorUrl: string; // HSP_COORDINATOR_URL from the hackathon sandbox
  apiKey: string; // HSP_API_KEY -- get one at /register
  chain: "hashkey-testnet" | "hashkey"; // hashkey-testnet = chainId 133, sandbox default
}

export interface HSPPaymentHandle {
  paymentId: `0x${string}`; // == mandateHash
  awaitSettled: (opts?: { timeoutMs?: number }) => Promise<{
    status: "SETTLED" | "FAILED" | "EXPIRED" | "DISPUTED";
    lastDecision?: { ok: boolean; outcomeClass: string; errorCode?: string };
  }>;
}

export function getHspConfig(): HSPConfig {
  const coordinatorUrl = process.env.NEXT_PUBLIC_HSP_COORDINATOR_URL;
  const apiKey = process.env.NEXT_PUBLIC_HSP_API_KEY;
  if (!coordinatorUrl || !apiKey) {
    throw new Error(
      "Set NEXT_PUBLIC_HSP_COORDINATOR_URL and NEXT_PUBLIC_HSP_API_KEY (from " +
        "https://hsp-hackathon.hashkeymerchant.com/register) in .env.local"
    );
  }
  return { coordinatorUrl, apiKey, chain: "hashkey-testnet" };
}

/**
 * Pays a ToriiPay invoice through HSP: builds + signs the EIP-712 Mandate
 * with the connected wallet (eip1193 signer, so the private key never
 * leaves the browser wallet), registers it with the Coordinator, and
 * returns a handle to poll for settlement -- mirroring
 * `hsp.pay({ to, amount })` from the HSP quickstart, but with an
 * `eip1193` signer instead of a raw private key.
 */
export async function payInvoiceWithHsp(params: {
  merchant: Address;
  amountBaseUnits: bigint; // USDC has 6 decimals on the HSP sandbox chain
  provider: unknown; // window.ethereum (EIP-1193 provider) from the connected wallet
  address: Address;
  compliance?: ("kyc" | "sanctions")[]; // omit for the public evm-transfer path
}): Promise<HSPPaymentHandle> {
  const { HSPClient } = await import("@hsp/sdk");
  const { resolveChain } = await import("@hsp/core/chains/index");
  const config = getHspConfig();

  const chain = resolveChain(config.chain);
  const hsp = new HSPClient({
    coordinatorUrl: config.coordinatorUrl,
    apiKey: config.apiKey,
    signer: { kind: "eip1193", provider: params.provider, address: params.address },
    chain,
  });

  const handle = await hsp.pay({
    to: params.merchant,
    amount: params.amountBaseUnits,
    ...(params.compliance ? { profile: { compliance: params.compliance } } : {}),
  });

  return handle as unknown as HSPPaymentHandle;
}

/**
 * Independent, trustless verification of a payment -- pins the adapter
 * address from GET /chains (do this once, out of band, per the HSP trust
 * model) rather than trusting the Coordinator's own status field.
 */
export async function verifyPaymentIndependently(params: {
  mandate: unknown;
  receipt: unknown;
  attestations?: unknown[];
  pinnedAdapterAddress: Address;
}) {
  const { HSPVerifier } = await import("@hsp/sdk");
  const { resolveChain } = await import("@hsp/core/chains/index");
  const config = getHspConfig();

  const verifier = new HSPVerifier({
    chain: resolveChain(config.chain),
    adapterAddress: params.pinnedAdapterAddress,
  });

  return verifier.verify(params.mandate, params.receipt, params.attestations ?? []);
}
