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

// كلمات مفتاحية تدل على أصوات عالية الجودة في المتصفحات/الأنظمة المختلفة
const PREMIUM_HINTS = /(premium|enhanced|neural|natural|online|wavenet|studio|google|microsoft|siri|majed|maged|tarik|hamed|naayf|salim)/i;
const ARABIC_LANG = /^ar([-_]|$)/i;
const SAUDI_LANG = /ar[-_]SA/i;

const scoreVoice = (v: SpeechSynthesisVoice): number => {
  let score = 0;
  if (!ARABIC_LANG.test(v.lang)) return -1;
  if (SAUDI_LANG.test(v.lang)) score += 50;
  if (PREMIUM_HINTS.test(v.name)) score += 40;
  if (/google/i.test(v.name)) score += 30; // Google عادةً Neural
  if (/microsoft/i.test(v.name)) score += 25;
  if (/natural|neural|online|wavenet|studio/i.test(v.name)) score += 35;
  if (!v.localService) score += 15; // الأصوات السحابية أعلى جودة عادةً
  if (/male|majed|maged|tarik|hamed|naayf|salim/i.test(v.name)) score += 10;
  return score;
};

const pickArabicVoice = (voices: SpeechSynthesisVoice[]) => {
  if (!voices.length) return null;
  const arabic = voices.filter((v) => ARABIC_LANG.test(v.lang));
  const pool = arabic.length ? arabic : voices;
  const ranked = [...pool].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  if (typeof console !== "undefined") {
    console.info(
      "[otaibiVoice] selected:",
      ranked[0]?.name,
      ranked[0]?.lang,
      "from",
      pool.length,
      "Arabic voices"
    );
  }
  return ranked[0] || voices[0];
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
      return { rate: 1.0, pitch: 1.0 };
    case "natural":
      return { rate: 0.9, pitch: 1.0 };
    case "majestic":
    default:
      // إعدادات مطلوبة من المستخدم: نطق مسترسل هادئ يليق بمنصة احترافية
      return { rate: 0.85, pitch: 1.0 };
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
