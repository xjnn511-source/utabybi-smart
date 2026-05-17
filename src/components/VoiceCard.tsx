import { Mic, Square, Volume2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { speakOtaibi, stopOtaibi } from "@/lib/otaibiVoice";

const DEFAULT_TEXT = "مرحباً بك في عُتيبي ذكي Hub. تم تشغيل محرك النطق العربي المحسن بسرعة هادئة وطبقة طبيعية.";

const VoiceCard = () => {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleGenerate = async () => {
    const value = text.trim();
    if (!value) {
      toast({ title: "اكتب النص المراد نطقه", variant: "destructive" });
      return;
    }
    await speakOtaibi(value, {
      profile: "majestic",
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => {
        setIsSpeaking(false);
        toast({ title: "تعذر تشغيل الصوت في هذا المتصفح", variant: "destructive" });
      },
    });
  };

  const handleStop = () => {
    stopOtaibi();
    setIsSpeaking(false);
  };

  return (
    <div className="card-neon p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Mic className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">صوت عُتيبي ذكي</h2>
          <p className="text-[10px] text-muted-foreground">نطق عربي فعلي من النص المدخل عبر Web Speech API</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={4}
        className="w-full bg-secondary border border-border rounded-lg p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mb-3 resize-none"
        placeholder="اكتب النص الذي تريد نطقه بصوت عُتيبي..."
      />

      <div className="flex items-end justify-center gap-[3px] h-10 mb-4" aria-hidden="true">
        {Array.from({ length: 24 }).map((_, index) => (
          <div
            key={index}
            className="w-[3px] rounded-full transition-all duration-300 bg-primary"
            style={{ height: isSpeaking ? `${8 + ((index * 7) % 26)}px` : "6px", opacity: isSpeaking ? 0.9 : 0.35 }}
          />
        ))}
      </div>

      {isSpeaking ? (
        <button onClick={handleStop} className="w-full h-10 bg-secondary border border-destructive text-destructive text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2">
          <Square className="w-3.5 h-3.5" strokeWidth={2} />
          إيقاف النطق
        </button>
      ) : (
        <button onClick={handleGenerate} className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2">
          <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />
          تحويل النص لصوت الآن
        </button>
      )}

      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
        يعمل محلياً في المتصفح بدون مفاتيح API خارجية. جودة الصوت تعتمد على الأصوات العربية المثبتة في جهاز المستخدم.
        <br />عُتيبي ذكي 🤖
      </p>
    </div>
  );
};

export default VoiceCard;