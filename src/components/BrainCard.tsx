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
    <div className="card-clean p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <Brain className="w-5 h-5 text-accent-foreground" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">تحليل الصكوك</h2>
          <p className="text-xs text-text-dim">تحليل تلقائي للصكوك والعقود العقارية</p>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center">
          <Upload className="w-6 h-6 text-accent-foreground" strokeWidth={2} />
        </div>
        <p className="text-sm text-text-dim">
          {isProcessing ? "جاري التحليل الذكي..." : "أسقط الصك هنا أو انقر للرفع"}
        </p>
      </div>

      {result && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-700 font-medium">{result}</p>
        </div>
      )}
    </div>
  );
};

export default BrainCard;
