import { useState, useEffect } from "react";

export function useOffline(): boolean {
  const [offline, setOffline] = useState<boolean>(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return offline;
}

export function useOfflineBanner(): { offline: boolean } {
  const offline = useOffline();
  return { offline };
}
