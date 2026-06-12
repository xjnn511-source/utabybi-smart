import { useRef, useState } from "react";
import { ShieldCheck, Copy, UploadCloud, Loader2, CheckCircle2, XCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useActivation, setActivated } from "@/hooks/useActivation";

const BENEFICIARY = "Otaibi Tech Solutions";
const IBAN = "SA3780000322608016224462";

const PLANS = [
  { name: "الرخصة التقنية الأساسية", price: 99 },
  { name: "نظام معالجة البيانات المتقدم", price: 299 },
  { name: "باقة الأنظمة الاحترافية", price: 499 },
];

type State = "idle" | "verifying" | "ok" | "fail";

const fileToBase64 = (f: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const result = typeof r.result === "string" ? r.result : "";
      const base64 = result.includes(",") ? result.split(",")[1] : "";
      if (!base64) reject(new Error("تعذّر قراءة الصورة"));
      else resolve(base64);
    };
    r.onerror = () => reject(new Error("تعذّر قراءة الصورة"));
    r.readAsDataURL(f);
  });

const PaymentActivation = () => {
  const unlocked = useActivation();
  const [state, setState] = useState<State>("idle");
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    // امسح القيمة مبكراً حتى يمكن إعادة رفع نفس الملف لاحقاً
    if (inputRef.current) inputRef.current.value = "";

    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "يرجى رفع صورة الإيصال فقط", variant: "destructive" });
      return;
    }

    setState("verifying");

    try {
      const base64 = await fileToBase64(f);

      const { data, error } = await supabase.functions.invoke("verify-receipt", {
        body: {
          imageBase64: base64,
          mimeType: f.type,
          expectedAmount: selectedPlan.price,
          planName: selectedPlan.name,
        },
      });

      if (error) throw new Error(error.message || "فشل الاتصال بخدمة التحقق");
      if (data?.error) throw new Error(String(data.error));

      if (data?.verified) {
        setActivated(true);
        setState("ok");
        toast({ title: "تم التفعيل بنجاح ✓", description: `تم تفعيل ${selectedPlan.name} وجميع الخدمات` });
        return;
      }

      setState("fail");
      const amountTxt = data?.amountMatch ? "مطابق" : `غير مطابق (${data?.paidAmount ?? "?"} ر.س)`;
      toast({
        title: "يرجى التأكد من صحة بيانات الإيصال",
        description: `الاسم: ${data?.nameMatch ? "مطابق" : "غير مطابق"} | الآيبان: ${
          data?.ibanMatch ? "مطابق" : "غير مطابق"
        } | المبلغ: ${amountTxt}`,
        variant: "destructive",
      });
    } catch (err) {
      setState("fail");
      const msg = err instanceof Error ? err.message : "حاول مرة أخرى";
      toast({ title: "فشل التحقق", description: msg, variant: "destructive" });
    }
  };

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      toast({ title: "تم نسخ الآيبان" });
    } catch {
      toast({ title: "تعذّر نسخ الآيبان", variant: "destructive" });
    }
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 glow-gold">
          <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">الدفع والتفعيل</h2>
          <p className="text-[10px] text-muted-foreground">اختر الباقة، حوّل المبلغ ثم ارفع الإيصال</p>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold ${
            unlocked
              ? "bg-green-500/15 text-green-400 border border-green-500/40"
              : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          {unlocked ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {unlocked ? "مُفعّل" : "مغلق"}
        </div>
      </div>

      {/* اختيار الباقة — يحدد المبلغ المطلوب مطابقته في الإيصال */}
      <div className="mb-4">
        <p className="text-[9px] text-muted-foreground mb-2">اختر الباقة المراد تفعيلها</p>
        <div className="grid grid-cols-3 gap-2">
          {PLANS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelectedPlan(p)}
              className={`rounded-lg border p-2 text-center transition-all ${
                selectedPlan.name === p.name
                  ? "border-primary bg-primary/10 glow-gold"
                  : "border-border bg-secondary/50 hover:border-primary/40"
              }`}
            >
              <span
                className={`block text-base font-bold ${
                  selectedPlan.name === p.name ? "text-primary" : "text-foreground"
                }`}
              >
                {p.price}
              </span>
              <span className="block text-[8px] text-muted-foreground leading-tight mt-0.5">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="bg-secondary/60 border border-border rounded-lg p-3">
          <p className="text-[9px] text-muted-foreground mb-1">المستفيد</p>
          <p className="text-xs font-bold text-foreground" dir="ltr">
            {BENEFICIARY}
          </p>
        </div>
        <div className="bg-secondary/60 border border-border rounded-lg p-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-muted-foreground mb-1">رقم الآيبان</p>
            <p className="text-xs font-bold text-primary truncate" dir="ltr">
              {IBAN}
            </p>
          </div>
          <button
            type="button"
            onClick={copyIban}
            className="h-8 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold flex items-center gap-1 hover:bg-primary/20"
          >
            <Copy className="w-3 h-3" />
            نسخ
          </button>
        </div>
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 flex items-center justify-between">
          <p className="text-[9px] text-muted-foreground">المبلغ المطلوب تحويله</p>
          <p className="text-sm font-bold text-primary" dir="ltr">
            {selectedPlan.price} SAR
          </p>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={state === "verifying"}
        className="w-full h-11 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {state === "verifying" ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            جاري التحقق من الإيصال...
          </>
        ) : state === "ok" ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            تم التفعيل
          </>
        ) : state === "fail" ? (
          <>
            <XCircle className="w-4 h-4" />
            أعد رفع الإيصال
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            ارفع إيصال التحويل
          </>
        )}
      </button>

      <p className="text-[9px] text-muted-foreground/70 text-center mt-3 leading-relaxed">
        يتم التحقق تلقائياً من اسم المستفيد ({BENEFICIARY})، رقم الآيبان، ومطابقة المبلغ مع الباقة المختارة عبر الذكاء
        الاصطناعي قبل تفعيل الخدمات.
      </p>
    </div>
  );
};

export default PaymentActivation;
