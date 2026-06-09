import { supabase } from "@/integrations/supabase/client";

export type UsageAction = "analyze_deed" | "generate_text";

/**
 * عدّاد استخدام مستقل — يزيد العداد للمستخدم الحالي دون التأثير على المحرر.
 * يفشل بصمت كي لا يعطّل أي عملية أساسية.
 */
export async function incrementUsage(action: UsageAction): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // @ts-expect-error - الدالة تُضاف للأنواع بعد التوليد
    await supabase.rpc("increment_usage", { _action: action });
  } catch {
    // تجاهل أخطاء العدّاد المستقل
  }
}

export interface UsageCounters {
  analyze_deed: number;
  generate_text: number;
}

export async function fetchUsage(userId: string): Promise<UsageCounters> {
  const { data } = await supabase
    .from("usage_counters" as never)
    .select("analyze_deed, generate_text")
    .eq("user_id", userId)
    .maybeSingle();
  const row = (data as { analyze_deed?: number; generate_text?: number } | null) || null;
  return {
    analyze_deed: row?.analyze_deed ?? 0,
    generate_text: row?.generate_text ?? 0,
  };
}
