import { motion } from "framer-motion";
import { CheckCircle2, FileText, Home, MapPin, Ruler, ShieldCheck, Smartphone, User, type LucideIcon } from "lucide-react";

export interface DeedVisualData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const cyan = "hsl(var(--deed-cyan))";
const cyanSoft = "hsl(var(--deed-gold-soft))";
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";
const panelLine = "hsl(var(--deed-cyan) / 0.48)";

const valueOf = (v?: string) => v?.trim() || "—";
const shortValue = (v?: string, fallback = "...") => {
  const value = valueOf(v);
  if (value === "—") return fallback;
  return value.length > 11 ? `...${value.slice(-7)}` : value;
};
const locationOf = (d: DeedVisualData) => [d.city, d.district].filter(Boolean).join(" - ") || "—";

const GlowFrame = ({ className = "" }: { className?: string }) => (
  <div
    className={`pointer-events-none absolute rounded-[8px] border ${className}`}
    style={{
      borderColor: "hsl(var(--deed-cyan) / 0.56)",
      boxShadow: "0 0 18px hsl(var(--deed-cyan) / 0.18), inset 0 0 22px hsl(var(--deed-cyan) / 0.08)",
    }}
  />
);

const DeedRow = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[1fr_46%] items-center gap-2 border-b py-[3px] text-right" style={{ borderColor: "hsl(var(--deed-cyan) / 0.16)" }}>
    <span className="truncate text-[11px] font-black leading-none sm:text-sm" style={{ color: text }}>{value}</span>
    <span className="text-[10px] font-black leading-none sm:text-[13px]" style={{ color: muted }}>{label}</span>
  </div>
);

const DeedCard = ({ deed, compact = false }: { deed: DeedVisualData; compact?: boolean }) => (
  <div
    className="relative h-full w-full overflow-hidden rounded-[8px] border px-[7%] py-[8%]"
    style={{
      background: "linear-gradient(180deg, hsl(var(--deed-bg) / 0.92), hsl(var(--deed-surface) / 0.68))",
      borderColor: panelLine,
      boxShadow: "inset 0 0 26px hsl(var(--deed-cyan) / 0.13), 0 0 18px hsl(var(--deed-cyan) / 0.12)",
    }}
  >
    <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(hsl(var(--deed-cyan) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.1) 1px, transparent 1px)", backgroundSize: compact ? "18px 18px" : "22px 22px" }} />
    <div className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full border sm:h-16 sm:w-16" style={{ color: cyan, borderColor: panelLine, boxShadow: "0 0 28px hsl(var(--deed-cyan) / 0.35)" }}>
      <ShieldCheck className="h-7 w-7 sm:h-9 sm:w-9" />
    </div>
    <div className="relative z-10 mt-[9%] space-y-1.5">
      <DeedRow label="رقم الصك" value={shortValue(deed.deedNumber)} />
      <DeedRow label="المالك" value={shortValue(deed.owner)} />
      <DeedRow label="المساحة" value={deed.area ? `${deed.area} م²` : "..."} />
      {!compact && <DeedRow label="الموقع" value={shortValue(locationOf(deed))} />}
    </div>
  </div>
);

const PhonePreview = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[3.3%] top-[19%] h-[57%] w-[24.5%] rounded-[8px] border p-[1.2%]" style={{ borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.72)", boxShadow: "0 0 22px hsl(var(--deed-cyan) / 0.25), inset 0 0 28px hsl(var(--deed-cyan) / 0.1)" }}>
    <DeedCard deed={deed} compact />
    <div className="absolute -bottom-[33%] left-0 right-0 rounded-[8px] border px-2 py-2 text-right" style={{ borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.86)", boxShadow: "0 0 16px hsl(var(--deed-cyan) / 0.18)" }}>
      <p className="text-[11px] font-black" style={{ color: muted }}>رقم الصك</p>
      <p className="truncate text-[15px] font-black" style={{ color: text }}>{shortValue(deed.deedNumber)}</p>
    </div>
  </div>
);

const CenterDeed = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[32.2%] top-[19%] h-[57%] w-[31%] rounded-[8px] border p-[1.2%]" style={{ borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.48)", boxShadow: "0 0 20px hsl(var(--deed-cyan) / 0.2)" }}>
    <div className="absolute -top-[25%] left-[25%] right-[25%] z-20 rounded-[8px] border px-1 py-1 text-center text-[10px] font-black sm:text-xs" style={{ color: cyanSoft, borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.9)", boxShadow: "0 0 16px hsl(var(--deed-cyan) / 0.28)" }}>
      100%<br />Match<br />Score
    </div>
    <DeedCard deed={deed} />
    <svg className="pointer-events-none absolute inset-x-[-34%] top-[38%] z-30 h-[34%]" viewBox="0 0 620 110" preserveAspectRatio="none">
      <line x1="0" y1="55" x2="620" y2="55" stroke="hsl(var(--deed-cyan) / 0.62)" strokeWidth="2" />
      <motion.path d="M0 55 L190 55 L223 14 L253 92 L287 32 L322 71 L352 55 L620 55" fill="none" stroke={cyan} strokeWidth="5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px hsl(var(--deed-cyan)))" }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
    </svg>
  </div>
);

const MapPanel = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute right-[3.3%] top-[19%] h-[57%] w-[28%] overflow-hidden rounded-[8px] border" style={{ borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.62)", boxShadow: "inset 0 0 24px hsl(var(--deed-cyan) / 0.13), 0 0 20px hsl(var(--deed-cyan) / 0.16)" }}>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 210" preserveAspectRatio="none">
      <pattern id="deedExactMapGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0 L0 0 0 24" fill="none" stroke="hsl(var(--deed-cyan) / 0.13)" /></pattern>
      <rect width="320" height="210" fill="url(#deedExactMapGrid)" />
      <path d="M0 84 Q104 30 320 64" stroke="hsl(var(--deed-cyan) / 0.58)" strokeWidth="2" fill="none" />
      <path d="M62 210 L298 18" stroke="hsl(var(--deed-cyan) / 0.3)" strokeWidth="1.5" strokeDasharray="7 5" />
      <path d="M80 70 Q128 48 144 92 Q118 124 80 108 Z" fill="hsl(var(--deed-cyan) / 0.07)" stroke="hsl(var(--deed-cyan) / 0.34)" />
      <path d="M182 110 Q238 92 260 132 Q228 170 182 150 Z" fill="hsl(var(--deed-cyan) / 0.08)" stroke="hsl(var(--deed-cyan) / 0.34)" />
    </svg>
    <div className="absolute left-[57%] top-[38%] -translate-x-1/2 -translate-y-1/2">
      <motion.div className="absolute -inset-5 rounded-full" style={{ background: "hsl(var(--deed-cyan) / 0.3)", filter: "blur(12px)" }} animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.2, 0.7] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <MapPin className="relative h-12 w-12 sm:h-16 sm:w-16" style={{ color: cyan, fill: cyan, filter: "drop-shadow(0 0 14px hsl(var(--deed-cyan)))" }} />
    </div>
    <p className="absolute bottom-[9%] left-[8%] right-[8%] truncate rounded-[6px] border px-2 py-2 text-center text-[11px] font-black sm:text-base" style={{ color: text, borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.84)", textShadow: "0 0 8px hsl(var(--deed-cyan) / 0.55)" }}>
      {shortValue(locationOf(deed))}
    </p>
  </div>
);

const BottomMetric = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="flex min-w-0 items-center justify-between gap-1 rounded-[8px] border px-2 py-2" style={{ borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.84)", boxShadow: "0 0 14px hsl(var(--deed-cyan) / 0.16)" }}>
    <Icon className="h-5 w-5 shrink-0" style={{ color: cyan }} />
    <div className="min-w-0 text-right leading-none">
      <p className="text-[10px] font-black" style={{ color: muted }}>{label}</p>
      <p className="mt-1 truncate text-[12px] font-black" style={{ color: text }}>{value}</p>
    </div>
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto aspect-[16/9] min-h-[230px] w-full max-w-[980px] overflow-hidden rounded-[18px] border font-cairo notranslate"
    style={{
      background: "radial-gradient(circle at 18% 38%, hsl(var(--deed-cyan) / 0.18), transparent 20%), radial-gradient(circle at 50% 40%, hsl(var(--deed-cyan) / 0.1), transparent 31%), linear-gradient(90deg, hsl(var(--deed-bg)), hsl(var(--deed-surface) / 0.92), hsl(var(--deed-bg)))",
      borderColor: "hsl(var(--deed-cyan) / 0.6)",
      boxShadow: "0 0 28px hsl(var(--deed-cyan) / 0.2), inset 0 0 44px hsl(var(--deed-cyan) / 0.09)",
    }}
  >
    <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(hsl(var(--deed-cyan) / 0.09) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.09) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
    <GlowFrame className="left-[1.8%] top-[8%] h-[82%] w-[27.5%]" />
    <GlowFrame className="left-[31%] top-[14%] h-[68%] w-[34%]" />
    <GlowFrame className="right-[1.8%] top-[14%] h-[68%] w-[31%]" />

    <header className="absolute left-[18%] right-[18%] top-[5.5%] z-40 text-center">
      <h2 className="truncate text-[13px] font-black leading-none sm:text-3xl" style={{ color: text, textShadow: "0 0 12px hsl(var(--deed-cyan) / 0.72)" }}>عُتيبي ذكي Ai: تحليل صك عقاري</h2>
    </header>

    <div className="absolute left-[43%] top-[13.5%] z-50 flex -translate-x-1/2 items-center gap-1 rounded-[8px] border px-2 py-1 text-[10px] font-black sm:text-sm" style={{ color: text, borderColor: panelLine, background: "hsl(var(--deed-bg) / 0.9)", boxShadow: "0 0 16px hsl(var(--deed-cyan) / 0.28)" }}>
      <CheckCircle2 className="h-4 w-4" style={{ color: cyan }} />
      حالة الصك: محدّث وساري
    </div>

    <PhonePreview deed={deed} />
    <CenterDeed deed={deed} />
    <MapPanel deed={deed} />

    <div className="absolute bottom-[12%] left-[30.5%] right-[3%] z-40 grid grid-cols-4 gap-2">
      <BottomMetric icon={User} label="المالك" value={shortValue(deed.owner, "خ...")} />
      <BottomMetric icon={Ruler} label="المساحة" value={deed.area ? `${deed.area} م²` : "...2"} />
      <BottomMetric icon={MapPin} label="الموقع" value={shortValue(locationOf(deed))} />
      <BottomMetric icon={FileText} label="رقم الصك" value={shortValue(deed.deedNumber)} />
    </div>

    <div className="absolute bottom-[3%] left-[31%] right-[31%] text-center text-[11px] font-black sm:text-lg" style={{ color: text, textShadow: "0 0 10px hsl(var(--deed-cyan) / 0.65)" }}>
      عُتيبي ذكي Ai: نحلل<br />بالرؤية والصوت
    </div>
  </section>
);

export default DeedVisualDashboard;
export { Smartphone, Home };