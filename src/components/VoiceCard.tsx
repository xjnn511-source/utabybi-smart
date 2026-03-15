import { motion } from "framer-motion";
import { Mic, Volume2 } from "lucide-react";
import { useState } from "react";

const WaveBar = ({ delay }: { delay: number }) => (
  <motion.div
    className="w-1 rounded-full bg-primary"
    animate={{ height: ["8px", "32px", "8px"] }}
    transition={{ duration: 1.2, repeat: Infinity, delay, ease: "easeInOut" }}
  />
);

const VoiceCard = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 4000);
  };

  return (
    <motion.div
      className={`glass-card p-6 ${isGenerating ? "glass-card-active" : ""}`}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div animate={{ scale: isGenerating ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.8, repeat: isGenerating ? Infinity : 0 }}>
          <Mic className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h2 className="text-lg font-light text-foreground">المرشد النجدي</h2>
          <p className="text-xs text-text-dim font-thin">توليد صوتي تلقائي باللهجة النجدية</p>
        </div>
      </div>

      <div className="flex items-end justify-center gap-1 h-16 mb-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <WaveBar key={i} delay={i * 0.08} />
        ))}
      </div>

      <button
        onClick={handleGenerate}
        className="w-full py-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-sm font-light flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
      >
        <Volume2 className="w-4 h-4" strokeWidth={1.5} />
        {isGenerating ? "جاري التوليد الصوتي..." : "تحويل تلقائي للنجدية"}
      </button>
    </motion.div>
  );
};

export default VoiceCard;
