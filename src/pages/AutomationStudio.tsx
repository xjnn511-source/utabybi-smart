import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Copy, Download, FileSearch, Megaphone, FileSignature, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { commandCenter } from "../commands"; // قمنا بربطه هنا

type GenType = "deed_analysis" | "real_estate_ad" | "real_estate_contract";

const TEMPLATES: { id: GenType; label: string; icon: any; placeholder: string }[] = [
  { id: "deed_analysis", label: "تحليل صك عقاري", icon: FileSearch, placeholder: "ألصق بيانات الصك..." },
  { id: "real_estate_ad", label: "إعلان تسويقي عقاري", icon: Megaphone, placeholder: "صف العقار..." },
  { id: "real_estate_contract", label: "عقد / اتفاقية عقارية", icon: FileSignature, placeholder: "نوع العقد..." },
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
    try {
      // هنا الربط الحقيقي مع محرك جمني الخاص بك
      const response = await commandCenter.executeCommand(`النوع: ${type}. الطلب: ${prompt}`);
      setOutput(response || "لم يتم الحصول على رد.");
      toast.success("تم التوليد بنجاح عبر محركك الخاص");
    } catch (e: any) {
      toast.error("فشل الاتصال بالمحرك");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-cairo" dir="rtl">
      <header className="border-b border-border p-4 flex items-center justify-between">
        <button onClick={() => navigate("/")} className="text-xs flex items-center gap-1"><ArrowRight className="w-4 h-4"/> الرئيسية</button>
        <h1 className="text-base font-bold">محرك الأتمتة العقارية (النسخة الذكية)</h1>
        <div/>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {TEMPLATES.map((t) => (
            <button key={t.id} onClick={() => setType(t.id)} className={`p-3 rounded-xl border ${type === t.id ? "border-primary bg-primary/10" : "bg-card"}`}>
              <t.icon className="w-5 h-5 mb-1" />
              <div className="text-xs font-bold">{t.label}</div>
            </button>
          ))}
        </div>

        <div className="p-4 bg-card border rounded-xl space-y-3">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={6} className="w-full bg-secondary p-3 rounded-lg text-sm" placeholder="اكتب طلبك هنا..." />
          <button onClick={handleGenerate} disabled={loading} className="w-full h-11 bg-primary text-white rounded-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? "جاري المعالجة..." : "تنفيذ عبر المحرك الذكي"}
          </button>
        </div>

        {output && (
          <div className="p-4 bg-secondary/50 rounded-xl border">
            <pre className="whitespace-pre-wrap text-sm">{output}</pre>
          </div>
        )}
      </main>
    </div>
  );
};

export default AutomationStudio;