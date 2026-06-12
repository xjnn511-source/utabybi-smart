import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "utaybi.activation.unlocked";
const EVT = "utaybi:activation-changed";
const ADMIN_EMAIL = "xjnn511@gmail.com";

export const isActivated = (): boolean => {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
};

export const setActivated = (v: boolean) => {
  try {
    if (v) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {}
  try {
    window.dispatchEvent(new Event(EVT));
  } catch {}
};

/**
 * Function-lock activation hook.
 * - Returns true when the app is unlocked (valid receipt OR admin account).
 * - All async auth checks are fully guarded so they can never throw an
 *   UNHANDLED_PROMISE_REJECTION, even if the network/auth call fails.
 */
export const useActivation = (): boolean => {
  const [unlocked, setUnlocked] = useState<boolean>(isActivated());
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const syncUnlocked = () => {
      if (mounted) setUnlocked(isActivated());
    };

    const checkAdmin = (email?: string | null) => {
      if (!mounted) return;
      setIsAdmin(!!email && email.toLowerCase() === ADMIN_EMAIL);
    };

    window.addEventListener(EVT, syncUnlocked);
    window.addEventListener("storage", syncUnlocked);

    // فتح القفل تلقائياً لحساب المدير فقط — مع حماية كاملة ضد الأخطاء
    supabase.auth
      .getUser()
      .then(({ data }) => checkAdmin(data?.user?.email))
      .catch(() => checkAdmin(null));

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        checkAdmin(session?.user?.email);
      });
      subscription = data?.subscription ?? null;
    } catch {
      subscription = null;
    }

    return () => {
      mounted = false;
      window.removeEventListener(EVT, syncUnlocked);
      window.removeEventListener("storage", syncUnlocked);
      try {
        subscription?.unsubscribe();
      } catch {}
    };
  }, []);

  // المدير يتجاوز القفل دائماً، وبقية المستخدمين يحتاجون التفعيل بالإيصال
  return unlocked || isAdmin;
};
