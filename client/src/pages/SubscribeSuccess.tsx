import { useEffect, useState } from "react";
import { Link, useSearch } from "wouter";
import { CheckCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import logoImg from "@assets/flydentify_logo.png";

const s = {
  bg: "#071e25",
  amber: "#A67A3A",
  text: "#f5e6cc",
  faint: "rgba(214,197,176,0.5)",
  muted: "rgba(214,197,176,0.7)",
};

export default function SubscribeSuccess() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");
  const { refresh } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }
    (async () => {
      try {
        const res = await apiRequest("GET", `/api/stripe/confirm/${sessionId}`);
        if (res.ok) {
          await refresh();
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, [sessionId]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ backgroundColor: s.bg }}
    >
      <img src={logoImg} alt="Flydentify" className="mb-10 w-auto" style={{ maxWidth: "240px", height: "auto" }} />

      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin" style={{ color: s.amber }} />
          <p className="font-['Inter'] text-sm italic" style={{ color: s.muted }}>
            Confirming your subscription…
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="text-center max-w-sm">
          <CheckCircle size={40} className="mx-auto mb-4" style={{ color: "#9acd5a" }} />
          <h1 className="font-['Cormorant_Garamond'] text-3xl mb-3" style={{ color: s.text }}>
            You're in.
          </h1>
          <p className="font-['Inter'] text-sm italic leading-relaxed mb-8" style={{ color: s.muted }}>
            Welcome to Flydentify Pro. Every hatch, every river, every knot, unlocked.
          </p>
          <Link href="/finder">
            <button
              className="rounded-sm px-8 py-3 font-['Inter'] text-sm uppercase tracking-widest"
              style={{ backgroundColor: s.amber, color: "#fff" }}
            >
              Find My Fly
            </button>
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="text-center max-w-sm">
          <p className="font-['Cormorant_Garamond'] text-2xl mb-3" style={{ color: s.text }}>
            Something went wrong.
          </p>
          <p className="font-['Inter'] text-sm italic mb-6" style={{ color: s.muted }}>
            Your payment may have processed, please contact us if your account isn't unlocked.
          </p>
          <Link href="/">
            <button
              className="rounded-sm px-6 py-2.5 font-['Inter'] text-xs uppercase tracking-widest"
              style={{ border: "1px solid rgba(167,122,58,0.4)", color: s.amber }}
            >
              Return Home
            </button>
          </Link>
        </div>
      )}
    </div>
  );
}
