import { Mic, Volume2 } from "lucide-react";
import { useState } from "react";

const VoiceCard = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 4000);
  };

  return (
    <div className="card-neon p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Mic className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">صوت عُتيبي ذكي Ai</h2>
          <p className="text-[10px] text-muted-foreground">توليد صوتي احترافي باللهجة السعودية</p>
        </div>
      </div>

      <div className="flex items-end justify-center gap-[3px] h-10 mb-4">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="w-[3px] rounded-full transition-all duration-300"
            style={{
              height: isGenerating ? `${Math.random() * 28 + 6}px` : "6px",
              backgroundColor: isGenerating
                ? `hsl(220 60% ${30 + Math.random() * 20}%)`
                : "hsl(210 15% 88%)",
            }}
          />
        ))}
      </div>

      <button
        onClick={handleGenerate}
        className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2"
      >
        <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
        {isGenerating ? "جاري التوليد الصوتي..." : "تحويل النص لصوت احترافي"}
      </button>
      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
        ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يعرّض صاحبه للمساءلة القانونية.
        <br />عُتيبي ذكي Ai 🤖
      </p>
    </div>
  );
};

export default VoiceCard;
