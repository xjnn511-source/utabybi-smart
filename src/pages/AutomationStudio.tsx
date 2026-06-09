import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Copy, Download, FileSearch, Megaphone, FileSignature, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { incrementUsage } from "@/lib/usage";

type GenType = "deed_analysis" | "real_estate_ad" | "real_estate_contract";

const TEMPLATES: { id: GenType; label: string; icon: any; placeholder: string }[] = [
  { id: "deed_analysis", label: "تحليل صك عقاري", icon: FileSearch, placeholder: "ألصق بيانات الصك أو وصفه: رقم الصك، المساحة، المالك، الموقع، الحدود، الاستخدام... وسيتم تحليله عقارياً وقانونياً." },
  { id: "real_estate_ad", label: "إعلان تسويقي عقاري", icon: Megaphone, placeholder: "صف العقار: نوعه (فيلا/أرض/شقة)، الموقع، المساحة، عدد الغرف، السعر، المميزات، الجمهور المستهدف..." },
  { id: "real_estate_contract", label: "عقد / اتفاقية عقارية", icon: FileSignature, placeholder: "نوع العقد (بيع/إيجار/وساطة)، الأطراف، وصف العقار ورقم الصك، المقابل المالي، المدة، الشروط الأساسية..." },
];

const AutomationStudio = () => {
  const navigate = useNavigate();
  const [type, setType] = useState<GenType>("deed_analysis");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("يرجى إدخال تفاصيل الطلب");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { type, prompt },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setOutput(data?.text || "");
      toast.success("تم التوليد بنجاح");
    } catch (e: any) {
      toast.error(e?.message || "فشل التوليد");
    } finally {
      setLoading(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(output);
    toast.success("تم النسخ");
  };

  const downloadText = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background font-cairo notranslate pb-24" dir="rtl">
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <button onClick={() => navigate("/")} className="text-xs text-primary flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> الرئيسية
        </button>
        <h1 className="text-base font-bold text-primary">محرك الأتمتة العقارية</h1>
        <div className="w-12" />
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-5">
        <p className="text-xs text-muted-foreground text-center">
          محرك ذكاء اصطناعي متخصص في القطاع العقاري السعودي: تحليل الصكوك، صياغة الإعلانات، وإعداد العقود باحترافية.
        </p>

        {/* Template chooser */}
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`p-3 rounded-xl border text-right transition-all ${
                type === t.id
                  ? "border-primary bg-primary/10 text-primary shadow-[0_0_18px_hsl(var(--primary)/0.4)]"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              <t.icon className="w-5 h-5 mb-1" />
              <div className="text-xs font-bold">{t.label}</div>
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="card-neon p-4 space-y-3">
          <label className="text-xs font-bold text-foreground">تفاصيل طلبك</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={TEMPLATES.find((x) => x.id === type)?.placeholder}
            rows={6}
            className="w-full bg-secondary border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-11 btn-neon text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "جاري الصياغة بالذكاء الاصطناعي..." : "توليد النص الآن"}
          </button>
        </div>

        {/* Output */}
        {output && (
          <div className="card-neon p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary">النص المُولَّد</h3>
              <div className="flex gap-2">
                <button onClick={copyText} className="p-2 rounded-lg bg-secondary hover:bg-primary/10 text-primary" title="نسخ">
                  <Copy className="w-4 h-4" />
                </button>
                <button onClick={downloadText} className="p-2 rounded-lg bg-secondary hover:bg-primary/10 text-primary" title="تنزيل">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground bg-secondary/50 p-4 rounded-lg border border-border font-cairo">
              {output}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default AutomationStudio;
