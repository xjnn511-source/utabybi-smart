import { useEffect, useState } from "react";

const KEY = "utaybi.activation.unlocked";
const EVT = "utaybi:activation-changed";

export const isActivated = (): boolean => {
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
};

export const setActivated = (v: boolean) => {
  try {
    if (v) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new Event(EVT));
};

export const useActivation = () => {
  const [unlocked, setUnlocked] = useState<boolean>(isActivated());
  useEffect(() => {
    const h = () => setUnlocked(isActivated());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return unlocked;
};
