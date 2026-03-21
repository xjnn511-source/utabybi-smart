import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, CreditCard, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const planLabels: Record<string, string> = {
  elite: "باقة النخبة",
  leadership: "باقة الأعمال",
  office: "باقة المكتب",
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [subscribers, setSubscribers] = useState<Tables<"subscribers">[]>([]);
  const [salesRecords, setSalesRecords] = useState<Tables<"sales_records">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);

      const [{ data: profs }, { data: subs }, { data: sales }] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("subscribers").select("*").order("created_at", { ascending: false }),
        supabase.from("sales_records").select("*").order("created_at", { ascending: false }),
      ]);

      setProfiles(profs || []);
      setSubscribers(subs || []);
      setSalesRecords(sales || []);
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Shield className="w-12 h-12 text-destructive" />
        <p className="text-foreground font-bold">غير مصرح لك بالدخول</p>
        <button onClick={() => navigate("/")} className="btn-neon px-6 py-2 text-xs">العودة للرئيسية</button>
      </div>
    );
  }

  const activeSubscribers = subscribers.filter((s) => s.is_active).length;
  const totalRevenue = salesRecords.reduce((sum, r) => sum + r.amount_sar, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">لوحة تحكم المدير 🛡️</h1>
          <p className="text-xs text-primary-foreground/70">إدارة المستخدمين والاشتراكات</p>
        </div>
        <button onClick={() => navigate("/")} className="text-xs text-primary-foreground/80 flex items-center gap-1 hover:text-primary-foreground">
          <ArrowRight className="w-3 h-3" />
          الرئيسية
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-neon p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{profiles.length}</p>
            <p className="text-[10px] text-muted-foreground">مستخدم</p>
          </div>
          <div className="card-neon p-4 text-center">
            <CreditCard className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{activeSubscribers}</p>
            <p className="text-[10px] text-muted-foreground">مشترك فعّال</p>
          </div>
          <div className="card-neon p-4 text-center">
            <Shield className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">إجمالي الإيرادات (ر.س)</p>
          </div>
        </div>

        {/* Users Table */}
        <div className="card-neon overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary">
            <h2 className="text-sm font-bold text-foreground">المستخدمون ({profiles.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">الاسم</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">البريد</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-3 py-2.5 text-foreground">{p.full_name || "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{p.email || "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{new Date(p.created_at).toLocaleDateString("ar-SA")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="card-neon overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary">
            <h2 className="text-sm font-bold text-foreground">الاشتراكات ({subscribers.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">الباقة</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">السعر</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">الحالة</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-3 py-2.5 text-foreground font-medium">{planLabels[s.plan] || s.plan}</td>
                    <td className="px-3 py-2.5 text-foreground">{s.price_sar} ر.س</td>
                    <td className="px-3 py-2.5">
                      {s.is_active ? (
                        <span className="flex items-center gap-1 text-green-600"><CheckCircle className="w-3 h-3" /> فعّال</span>
                      ) : (
                        <span className="flex items-center gap-1 text-destructive"><XCircle className="w-3 h-3" /> منتهي</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{new Date(s.created_at).toLocaleDateString("ar-SA")}</td>
                  </tr>
                ))}
                {subscribers.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">لا توجد اشتراكات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales */}
        <div className="card-neon overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary">
            <h2 className="text-sm font-bold text-foreground">سجل المبيعات ({salesRecords.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">الباقة</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">المبلغ</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">الصدقة</th>
                  <th className="px-3 py-2 text-right text-muted-foreground font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {salesRecords.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-3 py-2.5 text-foreground">{planLabels[r.plan] || r.plan}</td>
                    <td className="px-3 py-2.5 text-foreground">{r.amount_sar} ر.س</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{Number(r.charity_amount_sar)} ر.س</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{r.status}</td>
                  </tr>
                ))}
                {salesRecords.length === 0 && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">لا توجد مبيعات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <footer className="text-center pb-6 px-4 mt-8">
        <p className="text-[9px] text-muted-foreground">
          عُتيبي ذكي Ai 🤖 – لوحة تحكم المدير
        </p>
      </footer>
    </div>
  );
};

export default AdminDashboard;
