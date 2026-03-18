import { Mic, Volume2 } from "lucide-react";
import { useState } from "react";

const VoiceCard = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 4000);
  };

  return (
    <div className="card-clean p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <Mic className="w-5 h-5 text-accent-foreground" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">الدعم العقاري الصوتي</h2>
          <p className="text-xs text-text-dim">توليد صوتي تلقائي باللهجة النجدية</p>
        </div>
      </div>

      <div className="flex items-end justify-center gap-1 h-12 mb-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              isGenerating ? "bg-primary" : "bg-border"
            }`}
            style={{
              height: isGenerating
                ? `${Math.random() * 32 + 8}px`
                : "8px",
            }}
          />
        ))}
      </div>

      <button
        onClick={handleGenerate}
        className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
      >
        <Volume2 className="w-4 h-4" strokeWidth={2} />
        {isGenerating ? "جاري التوليد الصوتي..." : "تحويل تلقائي للنجدية"}
      </button>
    </div>
  );
};

export default VoiceCard;
