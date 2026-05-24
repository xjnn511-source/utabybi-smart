import { useRef, useState } from "react";
import { ShieldCheck, Copy, UploadCloud, Loader2, CheckCircle2, XCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useActivation, setActivated } from "@/hooks/useActivation";

const BENEFICIARY = "Otaibi Tech Solutions";
const IBAN = "SA3780000322608016224462";

type State = "idle" | "verifying" | "ok" | "fail";

const PaymentActivation = () => {
  const unlocked = useActivation();
  const [state, setState] = useState<State>("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res((r.result as string).split(",")[1]);
      r.onerror = rej;
      r.readAsDataURL(f);
    });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast({ title: "يرجى رفع صورة الإيصال فقط", variant: "destructive" });
      return;
    }
    setState("verifying");
    try {
      const base64 = await fileToBase64(f);
      const { data, error } = await supabase.functions.invoke("verify-receipt", {
        body: { imageBase64: base64, mimeType: f.type },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      if (data?.verified) {
        setActivated(true);
        setState("ok");
        toast({ title: "تم التفعيل بنجاح ✓", description: "تم تفعيل جميع الخدمات" });
      } else {
        setState("fail");
        toast({
          title: "يرجى التأكد من صحة بيانات الإيصال",
          description: `الاسم: ${data?.nameMatch ? "مطابق" : "غير مطابق"} | الآيبان: ${data?.ibanMatch ? "مطابق" : "غير مطابق"}`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setState("fail");
      toast({ title: "فشل التحقق", description: err.message || "حاول مرة أخرى", variant: "destructive" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      toast({ title: "تم نسخ الآيبان" });
    } catch {}
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/30 glow-gold">
          <ShieldCheck className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">الدفع والتفعيل</h2>
          <p className="text-[10px] text-muted-foreground">حوّل المبلغ ثم ارفع الإيصال لتفعيل الخدمات</p>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold ${
            unlocked ? "bg-green-500/15 text-green-400 border border-green-500/40" : "bg-secondary text-muted-foreground border border-border"
          }`}
        >
          {unlocked ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
          {unlocked ? "مُفعّل" : "مغلق"}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="bg-secondary/60 border border-border rounded-lg p-3">
          <p className="text-[9px] text-muted-foreground mb-1">المستفيد</p>
          <p className="text-xs font-bold text-foreground" dir="ltr">{BENEFICIARY}</p>
        </div>
        <div className="bg-secondary/60 border border-border rounded-lg p-3 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] text-muted-foreground mb-1">رقم الآيبان</p>
            <p className="text-xs font-bold text-primary truncate" dir="ltr">{IBAN}</p>
          </div>
          <button
            onClick={copyIban}
            className="h-8 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold flex items-center gap-1 hover:bg-primary/20"
          >
            <Copy className="w-3 h-3" />
            نسخ
          </button>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />

      <button
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
        يتم التحقق تلقائياً من اسم المستفيد ورقم الآيبان عبر الذكاء الاصطناعي قبل تفعيل الخدمات.
      </p>
    </div>
  );
};

export default PaymentActivation;
