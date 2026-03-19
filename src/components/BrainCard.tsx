import { Brain, Upload } from "lucide-react";
import { useState, useCallback } from "react";

const BrainCard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setResult(null);
    setTimeout(() => {
      setIsProcessing(false);
      setResult("تم استخراج ٧ معالم عقارية من الصك بنجاح ✓");
    }, 3000);
  }, []);

  const handleClick = useCallback(() => {
    setIsProcessing(true);
    setResult(null);
    setTimeout(() => {
      setIsProcessing(false);
      setResult("تم استخراج ٧ معالم عقارية من الصك بنجاح ✓");
    }, 3000);
  }, []);

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center neon-border border">
          <Brain className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">محلل الصكوك الذكي</h2>
          <p className="text-[10px] text-text-dim">تحليل تلقائي بالذكاء الاصطناعي GPT-4o</p>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
      >
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <p className="text-[11px] text-text-dim">
          {isProcessing ? "جاري التحليل الذكي..." : "أسقط الصك هنا أو انقر للرفع"}
        </p>
      </div>

      {result && (
        <div className="mt-3 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary font-medium">{result}</p>
        </div>
      )}
      <span className="watermark">عُتيبي ذكي Ai</span>
    </div>
  );
};

export default BrainCard;
