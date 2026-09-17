import { useOffline } from "@/hooks/useOffline";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const offline = useOffline();

  if (!offline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 px-4 py-2.5"
      style={{
        backgroundColor: "#A67A3A",
        color: "#071e25",
      }}
    >
      <WifiOff size={14} className="shrink-0" />
      <p className="font-['Inter'] text-sm font-medium">
        You're off the grid. Saved trips are still available below.
      </p>
    </div>
  );
}
