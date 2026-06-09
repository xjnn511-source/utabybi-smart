import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, FileText, Video, ArrowRight, Package, Mic } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Tables } from "@/integrations/supabase/types";
import { fetchUsage, type UsageCounters } from "@/lib/usage";

const planLabels: Record<string, string> = {
  elite: "باقة النخبة",
  leadership: "باقة الأعمال",
  office: "باقة المكتب الاحترافية",
};

const planQuotas: Record<string, { chars: number; services: number }> = {
  elite: { chars: 2000, services: 10 },
  leadership: { chars: 15000, services: 30 },
  office: { chars: 40000, services: 100 },
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Tables<"subscribers"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [usage, setUsage] = useState<UsageCounters>({ analyze_deed: 0, generate_text: 0 });

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: sub }, { data: prof }, { count }] = await Promise.all([
        supabase.from("subscribers").select("*").eq("user_id", user.id).eq("is_active", true).maybeSingle(),
        supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("deed_analyses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);

      setSubscription(sub);
      setProfile(prof);
      setAnalysisCount(count || 0);
      setUsage(await fetchUsage(user.id));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const quota = subscription ? planQuotas[subscription.plan] || { chars: 0, services: 0 } : { chars: 0, services: 0 };
  const usedServices = analysisCount;
  const servicesPercent = quota.services > 0 ? Math.min((usedServices / quota.services) * 100, 100) : 0;
  // Simulated char usage (would come from real tracking)
  const usedChars = 0;
  const charsPercent = quota.chars > 0 ? Math.min((usedChars / quota.chars) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-xs text-muted-foreground">مرحباً {profile?.full_name || "بك"} 👋</p>
        </div>
        <button onClick={() => navigate("/")} className="text-xs text-primary flex items-center gap-1 hover:underline">
          <ArrowRight className="w-3 h-3" />
          الرئيسية
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        {/* Subscription Status */}
        <div className="card-neon p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">حالة الاشتراك</h2>
              <p className="text-[10px] text-muted-foreground">تفاصيل باقتك الحالية</p>
            </div>
          </div>

          {subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="text-xs text-muted-foreground">الباقة</span>
                <span className="text-xs font-bold text-primary">{planLabels[subscription.plan] || subscription.plan}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="text-xs text-muted-foreground">السعر</span>
                <span className="text-xs font-bold text-foreground">{subscription.price_sar} ر.س/شهر</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                <span className="text-xs text-muted-foreground">الحالة</span>
                <span className={`text-xs font-bold ${subscription.is_active ? "text-green-600" : "text-destructive"}`}>
                  {subscription.is_active ? "فعّال ✓" : "منتهي"}
                </span>
              </div>
              {subscription.expires_at && (
                <div className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                  <span className="text-xs text-muted-foreground">ينتهي في</span>
                  <span className="text-xs font-bold text-foreground">
                    {new Date(subscription.expires_at).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground mb-3">لا يوجد اشتراك فعّال</p>
              <button onClick={() => navigate("/")} className="btn-neon px-6 py-2 text-xs">
                اختر باقة الآن
              </button>
            </div>
          )}
        </div>

        {/* Usage Tracker */}
        {subscription && (
          <div className="card-neon p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">📊 متتبع الاستخدام</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-muted-foreground">الخدمات المستخدمة</span>
                  <span className="text-[11px] font-bold text-foreground">{usedServices} / {quota.services}</span>
                </div>
                <Progress value={servicesPercent} className="h-2.5" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] text-muted-foreground">الأحرف المستخدمة (صوت عُتيبي ذكي)</span>
                  <span className="text-[11px] font-bold text-foreground">{usedChars.toLocaleString("ar-SA")} / {quota.chars.toLocaleString("ar-SA")}</span>
                </div>
                <Progress value={charsPercent} className="h-2.5" />
              </div>
            </div>
          </div>
        )}

        {/* Credits */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-neon p-3 text-center">
            <FileText className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-[9px] text-muted-foreground mb-1">إعلانات مصممة</p>
            <p className="text-xl font-bold text-foreground">
              {subscription ? quota.services : "0"}
            </p>
          </div>
          <div className="card-neon p-3 text-center">
            <Video className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-[9px] text-muted-foreground mb-1">معالجة الوسائط</p>
            <p className="text-xl font-bold text-foreground">
              {subscription?.plan === "office" ? "✓" : subscription?.plan === "leadership" ? "✓" : "—"}
            </p>
          </div>
          <div className="card-neon p-3 text-center">
            <Mic className="w-5 h-5 text-primary mx-auto mb-1.5" />
            <p className="text-[9px] text-muted-foreground mb-1">صوت عُتيبي ذكي</p>
            <p className="text-xl font-bold text-foreground">
              {subscription ? `${(quota.chars / 1000).toFixed(0)}k` : "—"}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
