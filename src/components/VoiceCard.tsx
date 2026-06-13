import { Mic, Volume2, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const VoiceCard = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    const value = text.trim();
    if (!value) {
      toast({ title: "اكتب النص أولاً", variant: "destructive" });
      return;
    }
    const { data: pre } = await supabase.auth.getUser();
    if (!pre.user) {
      toast({ title: "سجّل الدخول أولاً" });
      window.location.href = "/auth";
      return;
    }
    setIsGenerating(true);
    setAudioUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke("tts-voice", {
        body: { text: value.slice(0, 600) },
      });
      if (error) throw new Error(error.message);
      if (!data?.ok) throw new Error(data?.error || "فشل توليد الصوت");
      setAudioUrl(data.audio);
      setTimeout(() => audioRef.current?.play().catch(() => {}), 100);
      toast({ title: "تم توليد الصوت بصوتك الشخصي 🎙️" });
    } catch (e: any) {
      toast({ title: "تعذّر توليد الصوت", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="card-neon p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Mic className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">صوتي الشخصي</h2>
          <p className="text-[10px] text-muted-foreground">صوت مستنسخ خاص بك · جاهز للمونتاج</p>
        </div>
      </div>

      <textarea
        className="w-full h-20 p-3 text-xs bg-secondary/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none mb-3"
        value={text}
        maxLength={600}
        onChange={(e) => setText(e.target.value)}
        placeholder="اكتب النص لتحويله بصوتك الشخصي... (حد 600 حرف لتوفير الرصيد)"
      />

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
        disabled={isGenerating}
        className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />}
        {isGenerating ? "جاري التوليد بصوتك..." : "تحويل النص لصوتي الشخصي"}
      </button>

      {audioUrl && (
        <audio ref={audioRef} src={audioUrl} controls className="w-full mt-3" />
      )}

      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
        ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يعرّض صاحبه للمساءلة القانونية.
        <br />عُتيبي ذكي 🤖
      </p>
    </div>
  );
};

export default VoiceCard;
