import { useEffect, useState } from "react";
import { Play, Pause, Square, Volume2, Loader2 } from "lucide-react";
import {
  speakOtaibi,
  stopOtaibi,
  pauseOtaibi,
  resumeOtaibi,
  type OtaibiProfile,
} from "@/lib/otaibiVoice";

interface SpeakButtonProps {
  text: string;
  label?: string;
  className?: string;
  /** Voice character. "majestic" = deeper, slower. */
  profile?: OtaibiProfile;
  autoPlay?: boolean;
}

/**
 * "صوت عُتيبي" — محرك مجاني يعتمد على Web Speech API بصوت عربي (ar-SA)
 * بدون أي مفاتيح API خارجية.
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

  const stop = () => {
    stopOtaibi();
    setPlaying(false);
    setPaused(false);
  };

  const start = async () => {
    if (!text?.trim() || loading) return;
    stop();
    setLoading(true);
    try {
      await speakOtaibi(text, {
        profile,
        onStart: () => { setPlaying(true); setPaused(false); setLoading(false); },
        onEnd: () => { setPlaying(false); setPaused(false); },
        onError: () => { setPlaying(false); setPaused(false); setLoading(false); },
      });
    } catch (e) {
      console.warn("otaibi voice failed", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoPlay && text?.trim()) start();
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, text]);

  const togglePause = () => {
    if (paused) { resumeOtaibi(); setPaused(false); }
    else { pauseOtaibi(); setPaused(true); }
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
