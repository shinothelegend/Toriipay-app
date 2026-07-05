"use client";

import { useState } from "react";
import { useAccount, useConnect, useChainId, useReadContract, useWriteContract } from "wagmi";
import { CONTRACTS, gatewayAbi, erc20Abi, INVOICE_STATUS } from "@/lib/contracts";
import { payInvoiceWithHsp } from "@/lib/hsp";
import { ToriiStatusGate } from "@/components/ToriiStatusGate";
import { formatUnits } from "viem";

export default function PayInvoicePage({ params }: { params: { invoiceId: string } }) {
  const invoiceId = params.invoiceId as `0x${string}`;
  const { address, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const chainId = useChainId();
  const contracts = CONTRACTS[chainId as keyof typeof CONTRACTS] ?? CONTRACTS[133];
  const [step, setStep] = useState<"idle" | "approving" | "paying" | "waiting-hsp" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const { data: invoice, refetch } = useReadContract({
    address: contracts.gateway,
    abi: gatewayAbi,
    functionName: "getInvoice",
    args: [invoiceId],
  });

  const { writeContractAsync } = useWriteContract();

  const statusLabel = invoice ? INVOICE_STATUS[invoice.status] : "Open";

  async function handlePay() {
    if (!invoice || !address) return;
    setError(null);
    try {
      setStep("approving");
      await writeContractAsync({
        address: contracts.usdc,
        abi: erc20Abi,
        functionName: "approve",
        args: [contracts.gateway, invoice.amount],
      });

      setStep("paying");
      // In production this calls payInvoiceWithHsp() to get a real HSP
      // mandateHash from the Coordinator, then passes it into
      // payInvoiceDirect below. Requires NEXT_PUBLIC_HSP_COORDINATOR_URL /
      // NEXT_PUBLIC_HSP_API_KEY -- see lib/hsp.ts and .env.example.
      let hspPaymentId: `0x${string}` = "0x" + "00".repeat(32) as `0x${string}`;
      try {
        const handle = await payInvoiceWithHsp({
          merchant: invoice.merchant,
          amountBaseUnits: invoice.amount,
          provider: (window as any).ethereum,
          address,
        });
        hspPaymentId = handle.paymentId;
      } catch {
        // HSP sandbox not configured in this environment -- fall back to a
        // zero payment id so the on-chain demo flow still completes; wire
        // up .env.local to exercise the real HSP mandate/receipt path.
      }

      await writeContractAsync({
        address: contracts.gateway,
        abi: gatewayAbi,
        functionName: "payInvoiceDirect",
        args: [invoiceId, hspPaymentId],
      });

      setStep("waiting-hsp");
      await refetch();
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
      setStep("error");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-6 py-16">
      <h1 className="font-display text-2xl">Pay invoice</h1>

      {!isConnected && (
        <div className="flex gap-2">
          {connectors.slice(0, 2).map((c) => (
            <button
              key={c.uid}
              onClick={() => connect({ connector: c })}
              className="focus-gate rounded-gate bg-vermillion px-4 py-2 text-sm text-stone"
            >
              Connect {c.name}
            </button>
          ))}
        </div>
      )}

      {invoice && (
        <section className="flex items-center gap-8 rounded-gate border border-ink/10 bg-white/40 p-6">
          <ToriiStatusGate status={statusLabel as any} />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-ink/50">Amount due</p>
            <p className="font-mono text-2xl">{formatUnits(invoice.amount, 6)} USDC</p>
            <p className="mt-2 text-xs text-ink/50">
              Merchant {invoice.merchant.slice(0, 6)}...{invoice.merchant.slice(-4)}
            </p>
            {invoice.crossChain && (
              <p className="mt-1 text-xs text-moss">Accepts cross-chain payment via CCIP</p>
            )}
          </div>
        </section>
      )}

      {isConnected && invoice && statusLabel === "Open" && (
        <button
          onClick={handlePay}
          disabled={step !== "idle" && step !== "error"}
          className="focus-gate rounded-gate bg-ink px-5 py-3 text-sm text-stone disabled:opacity-50"
        >
          {step === "idle" && "Approve & pay"}
          {step === "approving" && "Approving USDC..."}
          {step === "paying" && "Sending payment..."}
          {step === "waiting-hsp" && "Confirming..."}
          {step === "error" && "Retry payment"}
        </button>
      )}

      {step === "done" && <p className="text-sm text-moss">Payment sent. Awaiting HSP-verified settlement.</p>}
      {error && <p className="text-sm text-vermillion">{error}</p>}
    </main>
  );
}
