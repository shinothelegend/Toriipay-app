"use client";

/**
 * Renders invoice status as a torii gate whose two pillars fill in as
 * capabilities are satisfied -- a visual echo of HSP's own trust rule,
 * ACCEPT iff requiredCapabilities ⊆ satisfiedCapabilities. The left
 * pillar fills when the on-chain transfer lands; the right pillar fills
 * when the settlement relayer has independently verified the HSP receipt.
 * Both filled + the lintel lit = Settled.
 */
export function ToriiStatusGate({
  status,
}: {
  status: "Open" | "AwaitingHSPConfirmation" | "Settled" | "Disputed" | "Cancelled";
}) {
  const paid = status !== "Open";
  const confirmed = status === "Settled";
  const disputed = status === "Disputed";

  const pillarColor = (filled: boolean) => (disputed ? "#8B2E1F" : filled ? "#C8452C" : "#D8D2C3");
  const lintelColor = confirmed ? "#B08D57" : disputed ? "#8B2E1F" : "#D8D2C3";

  return (
    <div className="flex flex-col items-center gap-2" role="img" aria-label={`Invoice status: ${status}`}>
      <svg width="120" height="90" viewBox="0 0 120 90" fill="none">
        <rect x="8" y="18" width="104" height="10" rx="1" fill={lintelColor} />
        <rect x="4" y="30" width="112" height="6" rx="1" fill={lintelColor} opacity="0.6" />
        <rect x="20" y="36" width="14" height="48" rx="1" fill={pillarColor(paid)} />
        <rect x="86" y="36" width="14" height="48" rx="1" fill={pillarColor(confirmed)} />
      </svg>
      <span className="font-mono text-xs uppercase tracking-wide text-ink/70">{status}</span>
    </div>
  );
}
