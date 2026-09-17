/**
 * TrialCountdownBanner — slim dismissible banner shown while trial is active.
 * Shows when there are 4 or fewer days remaining.
 * Dismissed state is kept in React state only (no localStorage per sandbox rules).
 */
import { useState } from "react";
import { X } from "lucide-react";
import { useAuth } from "@/lib/auth";

interface Props {
  onSubscribeClick: () => void;
}

export function TrialCountdownBanner({ onSubscribeClick }: Props) {
  const { isTrialing, daysLeftInTrial } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Only show when in trial with 4 or fewer days left
  if (!isTrialing || daysLeftInTrial === null || daysLeftInTrial > 4 || dismissed) {
    return null;
  }

  const urgency = daysLeftInTrial <= 1;
  const bg = urgency ? "#7c2d12" : "#0D1B33";
  const border = urgency ? "rgba(239,68,68,0.4)" : "rgba(160,118,58,0.3)";
  const accent = urgency ? "#f87171" : "#A67A3A";

  const message =
    daysLeftInTrial === 0
      ? "Your trial ends today."
      : daysLeftInTrial === 1
      ? "1 day left in your trial."
      : `${daysLeftInTrial} days left in your free trial.`;

  return (
    <div
      className="fixed top-0 inset-x-0 z-[100] flex items-center justify-between gap-3 px-4 py-2.5"
      style={{ backgroundColor: bg, borderBottom: `1px solid ${border}` }}
    >
      <p className="font-['Inter'] text-xs flex-1 text-center" style={{ color: "#f5e6cc" }}>
        {message}{" "}
        <button
          onClick={onSubscribeClick}
          className="underline font-semibold transition-opacity hover:opacity-80"
          style={{ color: accent }}
        >
          Subscribe to keep access.
        </button>
      </p>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 transition-opacity hover:opacity-60"
        style={{ color: "rgba(245,230,204,0.4)" }}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
