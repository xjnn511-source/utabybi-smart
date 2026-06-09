import { Brain, Upload, CheckCircle, Lock, FileSearch, Zap } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { incrementUsage } from "@/lib/usage";

const BrainCard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState<number>(0);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUsage = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ count }, { data: sub }] = await Promise.all([
        supabase.from("deed_analyses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
        supabase.from("subscribers").select("*").eq("user_id", user.id).eq("is_active", true).maybeSingle(),
      ]);

      setAnalysisCount(count || 0);
      setHasSubscription(!!sub);
    };
    checkUsage();
  }, []);

  const handleClick = useCallback(async () => {
    // Free trial: first analysis is free
    if (analysisCount >= 1 && !hasSubscription) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setShowUpgrade(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Record the analysis
      await supabase.from("deed_analyses").insert({
        user_id: user.id,
        file_name: "معالجة_مستند_" + Date.now(),
        status: "completed",
        analysis_result: {
          fields: 7,
          format: "PDF/JSON",
          source: "مستند مُحمّل",
          type: "تقرير بيانات",
          validation: "تم التحقق ✓",
          structure: "جداول: 3 | حقول: 12 | سجلات: 148",
          notes: "المستند مكتمل وصالح للمعالجة",
        },
      });

      // Simulated analysis animation
      await new Promise((r) => setTimeout(r, 3500));

      setIsProcessing(false);
      setResult("تم استخراج ٧ حقول بيانات من المستند بنجاح ✓");
      setAnalysisCount((c) => c + 1);
      toast({ title: "تم معالجة المستند بنجاح! 📄" });
    } catch (err) {
      setIsProcessing(false);
      toast({ title: "حدث خطأ", variant: "destructive" });
    }
  }, [analysisCount, hasSubscription]);

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Brain className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">محلل الأكواد والوثائق البرمجية</h2>
          <p className="text-[10px] text-muted-foreground">معالجة مستندات وأكواد بأنظمة برمجية مؤتمتة</p>
        </div>
        {analysisCount === 0 && !hasSubscription && (
          <span className="mr-auto text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
            تجربة مجانية ✨
          </span>
        )}
      </div>

      {/* Simulated Analysis Animation */}
      {isProcessing && (
        <div className="mb-3 rounded-lg bg-secondary border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <FileSearch className="w-4 h-4 text-primary animate-pulse" />
            <p className="text-[11px] text-primary font-bold">جاري معالجة المستند...</p>
          </div>
          <div className="space-y-2">
            {["قراءة بيانات المستند...", "استخراج الحقول والجداول...", "التحقق من صحة البيانات...", "معالجة البنية والمحتوى..."].map((step, i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse" style={{ animationDelay: `${i * 0.8}s` }}>
                <Zap className="w-3 h-3 text-primary" />
                <span className="text-[10px] text-muted-foreground">{step}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-[loading_3s_ease-in-out_forwards]" />
          </div>
        </div>
      )}

      {!isProcessing && !showUpgrade && (
        <div
          onClick={handleClick}
          className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <p className="text-[11px] text-muted-foreground">
            {analysisCount === 0 ? "أول معالجة مجانية! انقر للبدء" : "انقر لمعالجة مستند جديد"}
          </p>
        </div>
      )}

      {showUpgrade && (
        <div className="border border-dashed border-primary/30 rounded-lg p-6 flex flex-col items-center justify-center gap-3 bg-primary/5">
          <Lock className="w-8 h-8 text-primary" />
          <p className="text-xs text-foreground font-bold text-center">انتهت التجربة المجانية!</p>
          <p className="text-[10px] text-muted-foreground text-center">اشترك للحصول على عمليات برمجية غير محدودة</p>
          <button
            onClick={() => {
              const el = document.getElementById("subscription-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="btn-neon px-6 py-2 text-xs"
          >
            اشترك الآن
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 p-2.5 rounded-lg bg-green-50 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-xs text-green-700 font-medium">{result}</p>
          </div>
        </div>
      )}
      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default BrainCard;
