// محرك صوت عُتيبي المجاني — Web Speech API
// صوت عربي (السعودية) مع ضبط النبرة والسرعة لتشبه نطقاً احترافياً مسترسلاً.

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady: Promise<SpeechSynthesisVoice[]> | null = null;

const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return Promise.resolve([]);
  }
  if (voicesReady) return voicesReady;
  voicesReady = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const existing = synth.getVoices();
    if (existing && existing.length) return resolve(existing);
    const handler = () => {
      const v = synth.getVoices();
      if (v && v.length) {
        synth.removeEventListener("voiceschanged", handler);
        resolve(v);
      }
    };
    synth.addEventListener("voiceschanged", handler);
    // fallback timer
    setTimeout(() => resolve(synth.getVoices() || []), 1500);
  });
  return voicesReady;
};

const pickArabicVoice = (voices: SpeechSynthesisVoice[]) => {
  if (!voices.length) return null;
  // الأولوية: السعودية، ثم أي عربي ذكوري، ثم أي عربي.
  const priorities: Array<(v: SpeechSynthesisVoice) => boolean> = [
    (v) => /ar[-_]SA/i.test(v.lang),
    (v) => /ar[-_]SA/i.test(v.lang) || /Saudi|Majed|Tarik|Hamed/i.test(v.name),
    (v) => /^ar/i.test(v.lang) && /male|majed|tarik|hamed|naayf/i.test(v.name),
    (v) => /^ar/i.test(v.lang),
  ];
  for (const test of priorities) {
    const found = voices.find(test);
    if (found) return found;
  }
  return voices[0];
};

export const getOtaibiVoice = async (): Promise<SpeechSynthesisVoice | null> => {
  if (cachedVoice) return cachedVoice;
  const voices = await loadVoices();
  cachedVoice = pickArabicVoice(voices);
  return cachedVoice;
};

export type OtaibiProfile = "majestic" | "natural" | "fast";

const profileSettings = (p: OtaibiProfile) => {
  switch (p) {
    case "fast":
      return { rate: 1.05, pitch: 1.0 };
    case "natural":
      return { rate: 0.95, pitch: 0.95 };
    case "majestic":
    default:
      // نبرة فخمة، أبطأ قليلاً، أعمق قليلاً → نطق مسترسل غير متقطع
      return { rate: 0.88, pitch: 0.85 };
  }
};

const sanitize = (text: string) =>
  text
    .replace(/[*_`#>\[\]()]/g, "")
    .replace(/\s*\n+\s*/g, "، ")
    .replace(/\s{2,}/g, " ")
    .trim();

// تقسيم النص لجمل قصيرة لمنع تقطّع متصفحات معينة (Chrome) في النصوص الطويلة
const chunk = (text: string, max = 180): string[] => {
  if (text.length <= max) return [text];
  const parts: string[] = [];
  const segments = text.split(/(?<=[.!؟?،,])\s+/);
  let buf = "";
  for (const s of segments) {
    if ((buf + " " + s).trim().length > max) {
      if (buf) parts.push(buf.trim());
      buf = s;
    } else {
      buf = (buf ? buf + " " : "") + s;
    }
  }
  if (buf) parts.push(buf.trim());
  return parts;
};

export interface SpeakOptions {
  profile?: OtaibiProfile;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (e: any) => void;
}

let activeUtterances: SpeechSynthesisUtterance[] = [];

export const stopOtaibi = () => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try { window.speechSynthesis.cancel(); } catch {}
  activeUtterances = [];
};

export const speakOtaibi = async (text: string, opts: SpeakOptions = {}) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opts.onError?.(new Error("speechSynthesis_unsupported"));
    return;
  }
  const clean = sanitize(text);
  if (!clean) return;

  stopOtaibi();
  const voice = await getOtaibiVoice();
  const { rate, pitch } = profileSettings(opts.profile || "majestic");
  const synth = window.speechSynthesis;
  const chunks = chunk(clean);

  opts.onStart?.();
  chunks.forEach((segment, i) => {
    const u = new SpeechSynthesisUtterance(segment);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || "ar-SA";
    u.rate = rate;
    u.pitch = pitch;
    u.volume = 1;
    if (i === chunks.length - 1) {
      u.onend = () => opts.onEnd?.();
    }
    u.onerror = (e) => opts.onError?.(e);
    activeUtterances.push(u);
    synth.speak(u);
  });
};

export const pauseOtaibi = () => {
  try { window.speechSynthesis?.pause(); } catch {}
};
export const resumeOtaibi = () => {
  try { window.speechSynthesis?.resume(); } catch {}
};
