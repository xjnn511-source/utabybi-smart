import { useEffect, useRef, useState } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";

interface SpeakButtonProps {
  text: string;
  label?: string;
  className?: string;
  rate?: number;
  pitch?: number;
}

/**
 * Arabic Text-to-Speech using the browser's built-in Web Speech API.
 * Zero-cost, no external API. Picks the best available Arabic voice.
 */
const SpeakButton = ({ text, label = "استماع", className = "", rate = 0.95, pitch = 1 }: SpeakButtonProps) => {
  const [supported, setSupported] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);
  const arabicVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Prefer Saudi/Gulf, then any Arabic voice
      const ar =
        voices.find((v) => /ar-SA|ar_SA/i.test(v.lang)) ||
        voices.find((v) => /ar-(AE|EG|JO|KW|BH|QA|OM)/i.test(v.lang)) ||
        voices.find((v) => /^ar/i.test(v.lang));
      arabicVoiceRef.current = ar || null;
    };
    pickVoice();
    window.speechSynthesis.onvoiceschanged = pickVoice;
    return () => {
      try { window.speechSynthesis.cancel(); } catch {}
    };
  }, []);

  const stop = () => {
    try { window.speechSynthesis.cancel(); } catch {}
    setPlaying(false);
    setPaused(false);
  };

  const start = () => {
    if (!supported || !text?.trim()) return;
    stop();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = arabicVoiceRef.current?.lang || "ar-SA";
    if (arabicVoiceRef.current) u.voice = arabicVoiceRef.current;
    u.rate = rate;
    u.pitch = pitch;
    u.onend = () => { setPlaying(false); setPaused(false); };
    u.onerror = () => { setPlaying(false); setPaused(false); };
    utterRef.current = u;
    window.speechSynthesis.speak(u);
    setPlaying(true);
    setPaused(false);
  };

  const togglePause = () => {
    if (!playing) return;
    if (paused) { window.speechSynthesis.resume(); setPaused(false); }
    else { window.speechSynthesis.pause(); setPaused(true); }
  };

  if (!supported) return null;

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      {!playing ? (
        <button
          onClick={start}
          title={label}
          className="h-8 px-2.5 rounded-lg bg-primary/10 border border-primary/40 text-primary text-[11px] font-bold flex items-center gap-1.5 hover:bg-primary/20 transition"
        >
          <Volume2 className="w-3.5 h-3.5" />
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
