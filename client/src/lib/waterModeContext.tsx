import { createContext, useContext, useState, ReactNode } from "react";

type WaterMode = "fresh" | "salt";

interface WaterModeContextValue {
  waterMode: WaterMode;
  setWaterMode: (mode: WaterMode) => void;
}

const WaterModeContext = createContext<WaterModeContextValue>({
  waterMode: "fresh",
  setWaterMode: () => {},
});

// Cookie helpers — use __Host- prefix as required by the published sandbox
const COOKIE_NAME = "__Host-fmode";

function readCookie(): WaterMode {
  try {
    const match = document.cookie.match(new RegExp("(?:^|; )" + COOKIE_NAME + "=([^;]*)"));
    const val = match ? decodeURIComponent(match[1]) : null;
    if (val === "fresh" || val === "salt") return val;
  } catch {}
  return "fresh";
}

function writeCookie(mode: WaterMode) {
  try {
    document.cookie = `${COOKIE_NAME}=${mode}; path=/; max-age=31536000; SameSite=Strict; Secure`;
  } catch {}
}

export function WaterModeProvider({ children }: { children: ReactNode }) {
  const [waterMode, setWaterModeState] = useState<WaterMode>(() => readCookie());

  const setWaterMode = (mode: WaterMode) => {
    setWaterModeState(mode);
    writeCookie(mode);
  };

  return (
    <WaterModeContext.Provider value={{ waterMode, setWaterMode }}>
      {children}
    </WaterModeContext.Provider>
  );
}

export function useWaterMode() {
  return useContext(WaterModeContext);
}
