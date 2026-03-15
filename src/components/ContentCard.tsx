import { motion } from "framer-motion";
import { Palette, Sparkles } from "lucide-react";
import { useState } from "react";

const ContentCard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [posterReady, setPosterReady] = useState(false);

  const handleCreate = () => {
    setIsCreating(true);
    setPosterReady(false);
    setTimeout(() => {
      setIsCreating(false);
      setPosterReady(true);
    }, 3500);
  };

  return (
    <motion.div
      className={`glass-card p-6 ${isCreating ? "glass-card-active" : ""}`}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div animate={{ rotate: isCreating ? [0, 360] : 0 }} transition={{ duration: 2, repeat: isCreating ? Infinity : 0, ease: "linear" }}>
          <Palette className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h2 className="text-lg font-light text-foreground">صانع المحتوى العقاري</h2>
          <p className="text-xs text-text-dim font-thin">تصميم تلقائي لبوسترات سناب وتيكتوك</p>
        </div>
      </div>

      <div className="aspect-[9/16] max-h-48 rounded-lg overflow-hidden mb-4 relative bg-secondary/50">
        {isCreating ? (
          <div className="absolute inset-0 flex flex-col gap-3 p-4">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="h-3 rounded-full bg-primary/20"
                animate={{ opacity: [0.2, 0.6, 0.2], width: [`${40 + i * 8}%`, `${60 + i * 5}%`, `${40 + i * 8}%`] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        ) : posterReady ? (
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-background flex flex-col items-center justify-center p-4">
            <Sparkles className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-primary font-light text-center">بوستر عقاري جاهز</p>
            <p className="text-xs text-text-dim mt-1">٩:١٦ — جاهز للنشر</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-text-dim font-thin">معاينة التصميم</p>
          </div>
        )}
      </div>

      <button
        onClick={handleCreate}
        className="w-full py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-light flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
      >
        <Sparkles className="w-4 h-4" strokeWidth={1.5} />
        {isCreating ? "جاري التصميم التلقائي..." : "إنشاء بوستر تلقائي"}
      </button>
    </motion.div>
  );
};

export default ContentCard;
