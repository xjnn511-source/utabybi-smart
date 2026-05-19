import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, CreditCard, ArrowRight, CheckCircle, XCircle, FileImage, Clock } from "lucide-react";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

const planLabels: Record<string, string> = {
  elite: "باقة النخبة (99)",
  leadership: "باقة الأعمال (299)",
  office: "باقة المكتب (499)",
};

type UpgradeReq = {
  id: string;
  user_id: string;
  plan: string;
  amount_sar: number;
  receipt_url: string | null;
  sender_name: string | null;
  sender_phone: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [subscribers, setSubscribers] = useState<Tables<"subscribers">[]>([]);
  const [salesRecords, setSalesRecords] = useState<Tables<"sales_records">[]>([]);
  const [requests, setRequests] = useState<UpgradeReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = async () => {
    const [{ data: profs }, { data: subs }, { data: sales }, { data: reqs }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("subscribers").select("*").order("created_at", { ascending: false }),
      supabase.from("sales_records").select("*").order("created_at", { ascending: false }),
      supabase.from("upgrade_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setProfiles(profs || []);
    setSubscribers(subs || []);
    setSalesRecords(sales || []);
    setRequests((reqs as UpgradeReq[]) || []);
  };

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
      await refresh();
      setLoading(false);
    };
    load();
  }, []);

  const viewReceipt = async (path: string) => {
    const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
    else toast.error("تعذّر فتح الإيصال");
  };

  const activate = async (req: UpgradeReq) => {
    setBusyId(req.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);

      const charity = Math.round(req.amount_sar * 0.025);
      const net = req.amount_sar - charity;

      const { error: subErr } = await supabase.from("subscribers").insert({
        user_id: req.user_id,
        plan: req.plan as any,
        price_sar: req.amount_sar,
        is_active: true,
        expires_at: expires.toISOString(),
      });
      if (subErr) throw subErr;

      const { error: saleErr } = await supabase.from("sales_records").insert({
        user_id: req.user_id,
        plan: req.plan as any,
        amount_sar: req.amount_sar,
        charity_amount_sar: charity,
        net_amount_sar: net,
        payment_method: "bank_transfer",
        payment_ref: req.id,
        status: "completed",
      });
      if (saleErr) throw saleErr;

      const { error: updErr } = await supabase
        .from("upgrade_requests")
        .update({ status: "approved", reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq("id", req.id);
      if (updErr) throw updErr;

      toast.success("تم تفعيل الاشتراك");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "فشل التفعيل");
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (req: UpgradeReq) => {
    const note = prompt("سبب الرفض (اختياري):") || "";
    setBusyId(req.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("upgrade_requests")
        .update({ status: "rejected", admin_note: note, reviewed_at: new Date().toISOString(), reviewed_by: user?.id })
        .eq("id", req.id);
      if (error) throw error;
      toast.success("تم رفض الطلب");
      await refresh();
    } catch (e: any) {
      toast.error(e?.message || "فشل الرفض");
    } finally {
      setBusyId(null);
    }
  };

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
  const pendingReqs = requests.filter((r) => r.status === "pending");

  const userName = (uid: string) =>
    profiles.find((p) => p.user_id === uid)?.full_name ||
    profiles.find((p) => p.user_id === uid)?.email ||
    uid.slice(0, 8);

  return (
    <div dir="rtl" className="min-h-screen bg-background notranslate">
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
        <div className="grid grid-cols-4 gap-2">
          <Stat icon={Users} value={profiles.length} label="مستخدم" />
          <Stat icon={CreditCard} value={activeSubscribers} label="مشترك فعّال" />
          <Stat icon={Clock} value={pendingReqs.length} label="طلبات معلّقة" highlight={pendingReqs.length > 0} />
          <Stat icon={Shield} value={totalRevenue.toLocaleString()} label="إيرادات ر.س" />
        </div>

        {/* Pending Upgrade Requests */}
        <div className="card-neon overflow-hidden border-amber-500/30">
          <div className="px-4 py-3 border-b border-border bg-amber-500/10 flex justify-between items-center">
            <h2 className="text-sm font-bold text-foreground">طلبات التفعيل ({requests.length})</h2>
            {pendingReqs.length > 0 && (
              <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                {pendingReqs.length} معلّق
              </span>
            )}
          </div>
          <div className="divide-y divide-border">
            {requests.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-muted-foreground">لا توجد طلبات بعد</p>
            )}
            {requests.map((r) => (
              <div key={r.id} className="p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground">{userName(r.user_id)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {planLabels[r.plan] || r.plan} • {r.amount_sar} ر.س
                    </p>
                    {r.sender_name && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        المحوِّل: {r.sender_name} {r.sender_phone && `– ${r.sender_phone}`}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(r.created_at).toLocaleString("ar-SA")}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                <div className="flex flex-wrap gap-2">
                  {r.receipt_url && (
                    <button
                      onClick={() => viewReceipt(r.receipt_url!)}
                      className="text-[10px] bg-secondary border border-border hover:border-primary rounded-md px-3 py-1.5 flex items-center gap-1 text-foreground"
                    >
                      <FileImage className="w-3 h-3" /> عرض الإيصال
                    </button>
                  )}
                  {r.status === "pending" && (
                    <>
                      <button
                        disabled={busyId === r.id}
                        onClick={() => activate(r)}
                        className="text-[10px] bg-green-600 hover:bg-green-700 text-white rounded-md px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                      >
                        <CheckCircle className="w-3 h-3" /> تفعيل الحساب
                      </button>
                      <button
                        disabled={busyId === r.id}
                        onClick={() => reject(r)}
                        className="text-[10px] bg-destructive hover:bg-destructive/80 text-white rounded-md px-3 py-1.5 flex items-center gap-1 disabled:opacity-50"
                      >
                        <XCircle className="w-3 h-3" /> رفض
                      </button>
                    </>
                  )}
                </div>
                {r.admin_note && (
                  <p className="text-[10px] text-amber-500">ملاحظة: {r.admin_note}</p>
                )}
              </div>
            ))}
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
          عُتيبي ذكي 🤖 – لوحة تحكم المدير | الزكاة تُخرج خارج النظام
        </p>
      </footer>
    </div>
  );
};

const Stat = ({ icon: Icon, value, label, highlight }: { icon: any; value: any; label: string; highlight?: boolean }) => (
  <div className={`card-neon p-3 text-center ${highlight ? "border-amber-500/50" : ""}`}>
    <Icon className={`w-4 h-4 mx-auto mb-1 ${highlight ? "text-amber-500" : "text-primary"}`} />
    <p className="text-base font-bold text-foreground">{value}</p>
    <p className="text-[9px] text-muted-foreground">{label}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "approved") return <span className="text-[10px] text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> مفعّل</span>;
  if (status === "rejected") return <span className="text-[10px] text-destructive flex items-center gap-1"><XCircle className="w-3 h-3" /> مرفوض</span>;
  return <span className="text-[10px] text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3" /> معلّق</span>;
};

export default AdminDashboard;
