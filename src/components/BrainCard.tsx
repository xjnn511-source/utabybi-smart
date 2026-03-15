import { motion } from "framer-motion";
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
    <motion.div
      className={`glass-card p-6 relative overflow-hidden ${isProcessing ? "glass-card-active" : ""}`}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {isProcessing && (
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
          <motion.div
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <motion.div animate={{ rotate: isProcessing ? 360 : 0 }} transition={{ duration: 2, repeat: isProcessing ? Infinity : 0, ease: "linear" }}>
          <Brain className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h2 className="text-lg font-light text-foreground">عقل الذكاء الاصطناعي</h2>
          <p className="text-xs text-text-dim font-thin">تحليل تلقائي للصكوك والعقود</p>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={handleClick}
        className="border border-dashed border-primary/30 rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/60 transition-colors"
      >
        <motion.div
          className="w-16 h-16 rounded-full border border-primary/40 flex items-center justify-center pulse-ring"
          animate={{ boxShadow: isProcessing 
            ? ["0 0 0 0 hsl(180 100% 50% / 0.4)", "0 0 0 20px hsl(180 100% 50% / 0)", "0 0 0 0 hsl(180 100% 50% / 0.4)"]
            : "none"
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Upload className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </motion.div>
        <p className="text-sm text-text-dim font-thin">
          {isProcessing ? "جاري التحليل الذكي..." : "أسقط الصك هنا أو انقر للرفع"}
        </p>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <p className="text-sm text-primary font-light">{result}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BrainCard;
