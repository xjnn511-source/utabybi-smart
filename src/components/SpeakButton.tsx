import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Volume2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SpeakButtonProps {
  text: string;
  label?: string;
  className?: string;
  /** Voice character. "majestic" = deeper, slower. */
  profile?: "majestic" | "natural" | "fast";
  autoPlay?: boolean;
}

/**
 * "صوت عُتيبي" — يستخدم صوت ElevenLabs المعتمد (Ali / MI88rOZjXbH22N8KHXUo)
 * عبر Edge Function آمنة فقط.
 */
const SpeakButton = ({
  text,
  label = "استماع بصوت عُتيبي",
  className = "",
  profile = "majestic",
  autoPlay = false,
}: SpeakButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stop = () => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
    setPlaying(false);
    setPaused(false);
  };

  const start = async () => {
    if (!text?.trim() || loading) return;
    stop();
    setLoading(true);

    // إعدادات الصوت حسب الـ profile
    const settings =
      profile === "majestic"
        ? { stability: 0.85, similarity_boost: 0.85, style: 0.4, speed: 0.95 }
        : profile === "fast"
        ? { stability: 0.7, similarity_boost: 0.75, style: 0.2, speed: 1.1 }
        : { stability: 0.8, similarity_boost: 0.8, style: 0.3, speed: 1.0 };

    try {
      const { data, error } = await supabase.functions.invoke("tts-otaibi", {
        body: { text, ...settings },
      });
      if (data?.unavailable) return;
      if (error || !data?.audioContent) throw error || new Error("no audio");

      const audio = new Audio(`data:${data.mime || "audio/mpeg"};base64,${data.audioContent}`);
      audioRef.current = audio;
      audio.onended = () => { setPlaying(false); setPaused(false); };
      audio.onerror = () => { setPlaying(false); setPaused(false); };
      await audio.play();
      setPlaying(true);
      setPaused(false);
    } catch (e) {
      console.warn("tts-otaibi failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoPlay && text?.trim()) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  const togglePause = () => {
    if (!audioRef.current) return;
    if (paused) { audioRef.current.play(); setPaused(false); }
    else { audioRef.current.pause(); setPaused(true); }
  };

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {!playing ? (
        <button
          onClick={start}
          disabled={loading}
          title={label}
          className="h-8 px-2.5 rounded-lg bg-primary/10 border border-primary/40 text-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary/20 transition disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
          {label}
        </button>
      ) : (
        <>
          <button
            onClick={togglePause}
            title={paused ? "استئناف" : "إيقاف مؤقت"}
            className="h-8 w-8 rounded-lg bg-primary/15 border border-primary/40 text-primary flex items-center justify-center hover:bg-primary/25"
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={stop}
            title="إيقاف"
            className="h-8 w-8 rounded-lg bg-destructive/15 border border-destructive/40 text-destructive flex items-center justify-center hover:bg-destructive/25"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
};

export default SpeakButton;
