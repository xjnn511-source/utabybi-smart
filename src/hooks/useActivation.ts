import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "utaybi.activation.unlocked";
const EVT = "utaybi:activation-changed";
const ADMIN_EMAIL = "xjnn511@gmail.com";

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
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const h = () => setUnlocked(isActivated());
    window.addEventListener(EVT, h);
    window.addEventListener("storage", h);

    // فتح القفل تلقائياً لحساب المدير فقط
    const checkAdmin = (email?: string | null) => {
      setIsAdmin(!!email && email.toLowerCase() === ADMIN_EMAIL);
    };

    supabase.auth.getUser().then(({ data }) => checkAdmin(data.user?.email));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      checkAdmin(session?.user?.email);
    });

    return () => {
      window.removeEventListener(EVT, h);
      window.removeEventListener("storage", h);
      sub.subscription.unsubscribe();
    };
  }, []);

  // المدير يتجاوز القفل دائماً للاختبار، وبقية المستخدمين يحتاجون التفعيل بالإيصال
  return unlocked || isAdmin;
};
