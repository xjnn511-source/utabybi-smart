import { Mic, Volume2, Loader2, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";

const SAMPLE =
  "بسم الله الرحمن الرحيم، فرصة استثمارية ذهبية في قلب الرياض. أرض سكنية مميزة بصك إلكتروني محدث، إطلالة فاخرة، وموقع استراتيجي لا يُعوّض. تواصلوا معنا الآن مع عُتيبي ذكي.";

// Curated premium Arabic-capable voices (ElevenLabs Multilingual v2)
const VOICES = [
  { id: "nPczCjzI2devNBz1zQrb", label: "نبرة فخمة — رجالي إعلاني" },
  { id: "JBFqnCBsd6RMkjVDRZzb", label: "نبرة عميقة — رجالي وقور" },
  { id: "onwK4e9ZLuTAKqWW03F9", label: "نبرة هادئة — رجالي راوي" },
  { id: "XrExE9yKIg1WjnnlVkGX", label: "نبرة دافئة — نسائي" },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

const VoiceCard = () => {
  const [text, setText] = useState(SAMPLE);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: "اكتب النص أولاً", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ text, voiceId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "فشل التوليد" }));
        throw new Error(err.error || "فشل التوليد الصوتي");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setTimeout(() => {
        const a = audioRef.current;
        if (a) {
          a.src = url;
          a.play();
          setIsPlaying(true);
        }
      }, 50);
      toast({ title: "تم توليد الصوت", description: "نبرة احترافية جاهزة للتشغيل والتحميل" });
    } catch (e: any) {
      toast({ title: "تعذر التوليد", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a || !audioUrl) return;
    if (a.paused) { a.play(); setIsPlaying(true); }
    else { a.pause(); setIsPlaying(false); }
  };

  return (
    <div className="card-neon p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Mic className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">صوت عُتيبي ذكي — Premium</h2>
          <p className="text-[10px] text-muted-foreground">محرك نطق احترافي بالعربية الفصحى بنبرة فخمة (ElevenLabs)</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        dir="rtl"
        className="w-full p-3 rounded-lg border border-border bg-background text-xs text-foreground mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 font-cairo"
        placeholder="اكتب النص التسويقي العقاري هنا..."
      />

      <select
        value={voiceId}
        onChange={(e) => setVoiceId(e.target.value)}
        className="w-full p-2 rounded-lg border border-border bg-background text-[11px] text-foreground mb-3 font-cairo"
        dir="rtl"
      >
        {VOICES.map((v) => (
          <option key={v.id} value={v.id}>{v.label}</option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" strokeWidth={2} />}
          {isLoading ? "جاري التوليد الصوتي..." : "توليد بنبرة احترافية"}
        </button>
        {audioUrl && (
          <button
            onClick={togglePlay}
            className="h-10 px-3 rounded-lg border border-primary/30 bg-primary/10 text-primary text-xs flex items-center gap-1"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? "إيقاف" : "تشغيل"}
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="mt-3">
          <audio
            ref={audioRef}
            controls
            onEnded={() => setIsPlaying(false)}
            className="w-full h-9"
          />
          <a
            href={audioUrl}
            download={`utaybi-voice-${Date.now()}.mp3`}
            className="block text-center mt-2 text-[10px] text-primary underline"
          >
            تحميل الملف الصوتي (MP3)
          </a>
        </div>
      )}

      <p className="text-[8px] text-muted-foreground/60 text-center mt-3 leading-relaxed">
        ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يعرّض صاحبه للمساءلة القانونية.
        <br />عُتيبي ذكي 🤖
      </p>
    </div>
  );
};

export default VoiceCard;
