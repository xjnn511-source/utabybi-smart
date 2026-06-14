import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const KEY = "utaybi.activation.unlocked";
const EVT = "utaybi:activation-changed";

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

export interface ActivationState {
  /** المستخدم مسجّل دخوله */
  isLoggedIn: boolean;
  /** المستخدم مدير (تم التحقق من قاعدة البيانات عبر has_role) */
  isAdmin: boolean;
  /** تم التحقق من الإيصال محلياً */
  receiptVerified: boolean;
  /** يُسمح باستخدام الأدوات: مدير، أو (مسجّل دخول + إيصال محقق) */
  unlocked: boolean;
  /** لا تزال الجلسة قيد التحميل */
  loading: boolean;
}

/**
 * نظام التفعيل المربوط بتسجيل الدخول:
 * - لا يُسمح بأي استخدام إلا بعد تسجيل الدخول.
 * - المدير (حسب جدول user_roles الآمن) يحصل على صلاحيات كاملة تلقائياً.
 * - بقية المستخدمين يحتاجون تسجيل دخول + إيصال محقق.
 * - جميع الاستدعاءات غير المتزامنة محمية ضد UNHANDLED_PROMISE_REJECTION.
 */
export const useActivationState = (): ActivationState => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [receiptVerified, setReceiptVerified] = useState<boolean>(isActivated());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const syncReceipt = () => {
      if (mounted) setReceiptVerified(isActivated());
    };
    window.addEventListener(EVT, syncReceipt);
    window.addEventListener("storage", syncReceipt);

    const verifyAdmin = async (userId?: string | null) => {
      if (!userId) {
        if (mounted) setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc("has_role", {
          _user_id: userId,
          _role: "admin",
        });
        if (mounted) setIsAdmin(!error && data === true);
      } catch {
        if (mounted) setIsAdmin(false);
      }
    };

    const applySession = async (session: { user?: { id?: string } } | null) => {
      const uid = session?.user?.id ?? null;
      if (mounted) setIsLoggedIn(!!uid);
      await verifyAdmin(uid);
      if (mounted) setLoading(false);
    };

    let subscription: { unsubscribe: () => void } | null = null;
    try {
      const { data } = supabase.auth.onAuthStateChange((_e, session) => {
        // تجنّب أي استدعاء async داخل الـ callback مباشرة
        setTimeout(() => {
          applySession(session).catch(() => {});
        }, 0);
      });
      subscription = data?.subscription ?? null;
    } catch {
      subscription = null;
    }

    supabase.auth
      .getSession()
      .then(({ data }) => applySession(data?.session ?? null))
      .catch(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      window.removeEventListener(EVT, syncReceipt);
      window.removeEventListener("storage", syncReceipt);
      try {
        subscription?.unsubscribe();
      } catch {}
    };
  }, []);

  const unlocked = isAdmin || (isLoggedIn && receiptVerified);

  return { isLoggedIn, isAdmin, receiptVerified, unlocked, loading };
};

/** توافق رجعي: يعيد قيمة منطقية واحدة (مسموح/غير مسموح). */
export const useActivation = (): boolean => useActivationState().unlocked;
