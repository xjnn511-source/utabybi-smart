import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Upload, Copy, CheckCircle, Building2, Clock, ShieldCheck } from "lucide-react";

const PLANS = [
  { id: "elite" as const, name: "الرخصة التقنية الأساسية", price: 99 },
  { id: "leadership" as const, name: "نظام معالجة البيانات المتقدم", price: 299 },
  { id: "office" as const, name: "باقة الأنظمة الاحترافية", price: 499 },
];

const BANK = {
  bankName: "مصرف الراجحي",
  beneficiary: "وصيلة عمار زايد العتيبي",
  iban: "SA5480000640608013529892",
  account: "640000010006083529892",
};

type UpgradeRow = {
  id: string;
  plan: string;
  amount_sar: number;
  status: string;
  created_at: string;
  admin_note: string | null;
};

const UpgradeRequest = () => {
  const navigate = useNavigate();
  const [planId, setPlanId] = useState<typeof PLANS[number]["id"]>("leadership");
  const [senderName, setSenderName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [myRequests, setMyRequests] = useState<UpgradeRow[]>([]);

  const plan = PLANS.find((p) => p.id === planId)!;

  const loadMine = async () => {
    const { data } = await supabase
      .from("upgrade_requests")
      .select("id, plan, amount_sar, status, created_at, admin_note")
      .order("created_at", { ascending: false });
    setMyRequests((data as UpgradeRow[]) || []);
  };

  useEffect(() => {
    loadMine();
  }, []);

  const copy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`تم نسخ ${label}`);
  };

  const submit = async () => {
    if (!agree) {
      toast.error("يجب الموافقة على الشروط");
      return;
    }
    if (!file) {
      toast.error("يجب رفع صورة إيصال التحويل");
      return;
    }
    if (!senderName.trim()) {
      toast.error("أدخل اسم المحوِّل كما في الإيصال");
      return;
    }
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("سجّل دخولك أولاً");
        navigate("/auth");
        return;
      }

      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("receipts")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("upgrade_requests").insert({
        user_id: user.id,
        plan: plan.id,
        amount_sar: plan.price,
        receipt_url: path,
        sender_name: senderName.trim(),
        sender_phone: senderPhone.trim() || null,
      });
      if (insErr) throw insErr;

      toast.success("تم استلام طلبك. سيتم تفعيل اشتراكك بعد التأكد من الحوالة.");
      setFile(null);
      setSenderName("");
      setSenderPhone("");
      setAgree(false);
      await loadMine();
    } catch (e: any) {
      toast.error(e?.message || "تعذّر إرسال الطلب");
    } finally {
      setSubmitting(false);
    }
  };

  const statusBadge = (s: string) => {
    if (s === "approved") return <span className="text-green-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> مفعّل</span>;
    if (s === "rejected") return <span className="text-destructive">مرفوض</span>;
    return <span className="text-amber-500 flex items-center gap-1"><Clock className="w-3 h-3" /> قيد المراجعة</span>;
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background notranslate">
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">تفعيل الاشتراك – تحويل بنكي</h1>
          <p className="text-xs text-muted-foreground">حوالة على حساب المنصة ومراجعة يدوية</p>
        </div>
        <button onClick={() => navigate("/")} className="text-xs text-primary flex items-center gap-1 hover:underline">
          <ArrowRight className="w-3 h-3" /> الرئيسية
        </button>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-5">
        {/* Plan picker */}
        <div className="card-neon p-4">
          <h2 className="text-sm font-bold text-foreground mb-3">اختر الباقة</h2>
          <div className="space-y-2">
            {PLANS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlanId(p.id)}
                className={`w-full p-3 rounded-lg border text-right flex justify-between items-center transition-all ${
                  planId === p.id ? "border-primary bg-primary/10" : "border-border bg-secondary/30"
                }`}
              >
                <span className="text-xs font-bold text-foreground">{p.name}</span>
                <span className="text-sm font-bold text-primary">{p.price} ر.س</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bank info */}
        <div className="card-neon p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">بيانات حساب المنصة</h2>
          </div>
          <div className="space-y-2 text-xs">
            <Row label="المصرف" value={BANK.bankName} onCopy={() => copy(BANK.bankName, "اسم المصرف")} />
            <Row label="اسم المستفيد" value={BANK.beneficiary} onCopy={() => copy(BANK.beneficiary, "اسم المستفيد")} />
            <Row label="رقم الآيبان" value={BANK.iban} onCopy={() => copy(BANK.iban, "الآيبان")} mono />
            <Row label="رقم الحساب" value={BANK.account} onCopy={() => copy(BANK.account, "رقم الحساب")} mono />
            <Row label="المبلغ" value={`${plan.price} ر.س`} onCopy={() => copy(String(plan.price), "المبلغ")} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
            حوّل المبلغ بالضبط ثم ارفع صورة الإيصال أدناه. التفعيل خلال 24 ساعة بعد التأكد من الحوالة.
          </p>
        </div>

        {/* Upload form */}
        <div className="card-neon p-4 space-y-3">
          <h2 className="text-sm font-bold text-foreground">رفع إيصال التحويل</h2>

          <input
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="اسم المحوِّل كما في الإيصال"
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground"
          />
          <input
            type="tel"
            value={senderPhone}
            onChange={(e) => setSenderPhone(e.target.value)}
            placeholder="رقم الجوال (اختياري)"
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-foreground"
          />

          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors bg-secondary/30">
            <Upload className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-[11px] text-muted-foreground">
              {file ? file.name : "اضغط لرفع صورة الإيصال (JPG/PNG/PDF)"}
            </span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </label>

          <label className="flex items-start gap-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              أوافق على <a href="/terms" className="text-primary underline">شروط الاستخدام</a> و
              <a href="/refund" className="text-primary underline mx-1">سياسة الاسترجاع</a>،
              وأقرّ بأن المنصة برمجية وأن الزكاة تُخرج خارج النظام.
            </span>
          </label>

          <button
            onClick={submit}
            disabled={submitting}
            className="btn-neon w-full py-3 text-xs disabled:opacity-50"
          >
            {submitting ? "جارٍ الإرسال..." : `إرسال طلب تفعيل ${plan.price} ر.س`}
          </button>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3 text-green-500" />
            بياناتك محمية. المراجعة يدوية بمعرفة الإدارة.
          </div>
        </div>

        {/* My requests */}
        {myRequests.length > 0 && (
          <div className="card-neon p-4">
            <h2 className="text-sm font-bold text-foreground mb-3">طلباتي السابقة</h2>
            <div className="space-y-2">
              {myRequests.map((r) => (
                <div key={r.id} className="bg-secondary/40 border border-border rounded-lg p-3 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-foreground">
                      {PLANS.find((p) => p.id === r.plan)?.name || r.plan} – {r.amount_sar} ر.س
                    </span>
                    {statusBadge(r.status)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleString("ar-SA")}
                  </p>
                  {r.admin_note && (
                    <p className="text-[10px] text-amber-500 mt-1">ملاحظة الإدارة: {r.admin_note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const Row = ({ label, value, onCopy, mono }: { label: string; value: string; onCopy: () => void; mono?: boolean }) => (
  <div className="flex items-center justify-between gap-2 bg-secondary/40 rounded-md px-3 py-2 border border-border">
    <span className="text-muted-foreground text-[10px]">{label}</span>
    <div className="flex items-center gap-2 flex-1 justify-end">
      <span className={`text-foreground font-semibold ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
      <button onClick={onCopy} className="text-primary hover:text-primary/80" aria-label="نسخ">
        <Copy className="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
);

export default UpgradeRequest;
