import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

const AutomationStudio = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    if (!prompt.trim()) {
      toast.error("يرجى إدخال أمرك");
      return;
    }
    setLoading(true);
    try {
      // محاكاة الاتصال بالمحرك
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOutput(`تم تنفيذ الأمر بنجاح: ${prompt}`);
      toast.success("تم التنفيذ");
    } catch (e) {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <header className="flex items-center justify-between mb-8">
        <button onClick={() => navigate("/")} className="flex items-center gap-1 text-xs">
          <ArrowRight className="w-4 h-4" /> الرئيسية
        </button>
        <h1 className="text-lg font-bold">منصة الأوامر</h1>
      </header>

      <main className="max-w-xl mx-auto space-y-4">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="اكتب الأمر هنا..."
          className="w-full p-4 rounded-xl border bg-card min-h-[150px]"
        />
        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "جاري التنفيذ..." : "نفذ الأمر"}
        </button>

        {output && (
          <div className="p-4 rounded-xl bg-secondary text-sm">
            {output}
          </div>
        )}
      </main>
    </div>
  );
};

export default AutomationStudio;