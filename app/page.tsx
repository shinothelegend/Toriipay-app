"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useReadContract, useWriteContract, useChainId } from "wagmi";
import { parseUnits, keccak256, toHex } from "viem";
import { CONTRACTS, gatewayAbi, registryAbi } from "@/lib/contracts";
import { ToriiStatusGate } from "@/components/ToriiStatusGate";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS] ?? CONTRACTS[133];

  const [amount, setAmount] = useState("25.00");
  const [crossChain, setCrossChain] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState<string | null>(null);

  const { data: merchantData } = useReadContract({
    address: contracts.merchantRegistry,
    abi: registryAbi,
    functionName: "merchants",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address) },
  });

  const { writeContractAsync, isPending } = useWriteContract();

  const trustScore = merchantData ? Number(merchantData[2]) : 0;
  const registered = merchantData ? merchantData[0] : false;

  async function handleCreateInvoice() {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 3600);
    const amountUnits = parseUnits(amount, 6); // USDC, 6 decimals
    const invoiceId = await writeContractAsync({
      address: contracts.gateway,
      abi: gatewayAbi,
      functionName: "createInvoice",
      args: [contracts.usdc, amountUnits, deadline, crossChain],
    });
    setLastInvoiceId(invoiceId);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16">
      <header className="flex items-center justify-between border-b border-ink/10 pb-6">
        <div>
          <h1 className="font-display text-3xl tracking-tight">鳥居 ToriiPay</h1>
          <p className="mt-1 text-sm text-ink/60">Merchant console -- HashKey Chain {chainId}</p>
        </div>
        {isConnected ? (
          <button
            onClick={() => disconnect()}
            className="focus-gate rounded-gate border border-ink/20 px-4 py-2 text-sm hover:bg-ink/5"
          >
            {address?.slice(0, 6)}...{address?.slice(-4)} · Disconnect
          </button>
        ) : (
          <div className="flex gap-2">
            {connectors.slice(0, 2).map((c) => (
              <button
                key={c.uid}
                onClick={() => connect({ connector: c })}
                className="focus-gate rounded-gate bg-vermillion px-4 py-2 text-sm text-stone hover:opacity-90"
              >
                Connect {c.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {isConnected && (
        <section className="grid grid-cols-2 gap-6 rounded-gate border border-ink/10 bg-white/40 p-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">Merchant status</p>
            <p className="mt-1 font-display text-xl">{registered ? "Registered" : "Not registered"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink/50">Trust score</p>
            <p className="mt-1 font-mono text-xl text-moss">{(trustScore / 100).toFixed(2)}%</p>
          </div>
        </section>
      )}

      <section className="rounded-gate border border-ink/10 bg-white/40 p-6">
        <h2 className="font-display text-xl">New invoice</h2>
        <p className="mt-1 text-sm text-ink/60">
          Settled through HSP -- the payer&apos;s own wallet moves the funds; nothing here custodies value.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Amount (USDC)
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="focus-gate rounded-gate border border-ink/20 px-3 py-2 font-mono"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={crossChain} onChange={(e) => setCrossChain(e.target.checked)} />
            Accept cross-chain payment via CCIP
          </label>

          <button
            onClick={handleCreateInvoice}
            disabled={!isConnected || isPending}
            className="focus-gate mt-2 w-fit rounded-gate bg-ink px-5 py-2.5 text-sm text-stone hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? "Creating..." : "Create invoice"}
          </button>
        </div>

        {lastInvoiceId && (
          <div className="mt-8 flex items-center gap-6 border-t border-ink/10 pt-6">
            <ToriiStatusGate status="Open" />
            <div>
              <p className="text-xs uppercase tracking-wide text-ink/50">Invoice created</p>
              <p className="font-mono text-sm break-all">{lastInvoiceId}</p>
              <a href={`/pay/${lastInvoiceId}`} className="mt-2 inline-block text-sm text-vermillion underline">
                Open payer checkout →
              </a>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
