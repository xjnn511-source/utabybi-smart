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
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";
const line = "hsl(var(--deed-cyan) / 0.5)";

const valueOf = (v?: string) => v?.trim() || "—";
const trimValue = (v?: string, fallback = "...") => {
  const value = valueOf(v);
  if (value === "—") return fallback;
  return value.length > 11 ? `...${value.slice(-7)}` : value;
};
const locationOf = (d: DeedVisualData) => [d.city, d.district].filter(Boolean).join(" - ") || "—";

const FieldLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex h-[22%] items-center border-b text-right" style={{ borderColor: "hsl(var(--deed-cyan) / 0.15)" }}>
    <span className="w-[52%] truncate pl-1 text-[10px] font-black leading-none sm:text-[15px]" style={{ color: text }}>{value}</span>
    <span className="w-[48%] text-[9px] font-black leading-none sm:text-[14px]" style={{ color: muted }}>{label}</span>
  </div>
);

const DeedCard = ({ deed, small = false }: { deed: DeedVisualData; small?: boolean }) => (
  <div
    className="relative h-full w-full overflow-hidden rounded-[8px] border px-[7%] py-[8%]"
    style={{
      background: "linear-gradient(180deg, hsl(var(--deed-bg) / 0.9), hsl(var(--deed-surface) / 0.66))",
      borderColor: line,
      boxShadow: "inset 0 0 26px hsl(var(--deed-cyan) / 0.12), 0 0 18px hsl(var(--deed-cyan) / 0.14)",
    }}
  >
    <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(hsl(var(--deed-cyan) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.1) 1px, transparent 1px)", backgroundSize: small ? "16px 16px" : "21px 21px" }} />
    <div className="relative z-10 mx-auto flex h-[28%] aspect-square items-center justify-center rounded-full border" style={{ color: cyan, borderColor: line, boxShadow: "0 0 26px hsl(var(--deed-cyan) / 0.34)" }}>
      <ShieldCheck className="h-[60%] w-[60%]" />
    </div>
    <div className="relative z-10 mt-[7%] h-[58%]">
      <FieldLine label="رقم الصك" value={trimValue(deed.deedNumber)} />
      <FieldLine label="المالك" value={trimValue(deed.owner)} />
      <FieldLine label="المساحة" value={deed.area ? `${deed.area} م²` : "..."} />
      {!small && <FieldLine label="الموقع" value={trimValue(locationOf(deed))} />}
    </div>
  </div>
);

const OuterFrame = ({ className }: { className: string }) => (
  <div className={`pointer-events-none absolute rounded-[10px] border ${className}`} style={{ borderColor: "hsl(var(--deed-cyan) / 0.46)", boxShadow: "0 0 20px hsl(var(--deed-cyan) / 0.16), inset 0 0 28px hsl(var(--deed-cyan) / 0.08)" }} />
);

const PhonePreview = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[3.4%] top-[19%] h-[55%] w-[24%] rounded-[8px] border p-[1.15%]" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.7)", boxShadow: "0 0 22px hsl(var(--deed-cyan) / 0.2)" }}>
    <DeedCard deed={deed} small />
    <div className="absolute -bottom-[31%] left-0 right-0 h-[24%] rounded-[8px] border px-[9%] py-[5%] text-right" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.88)", boxShadow: "0 0 15px hsl(var(--deed-cyan) / 0.18)" }}>
      <p className="text-[9px] font-black leading-none sm:text-[13px]" style={{ color: muted }}>رقم الصك</p>
      <p className="mt-1 truncate text-[12px] font-black leading-none sm:text-lg" style={{ color: text }}>{trimValue(deed.deedNumber)}</p>
    </div>
  </div>
);

const CenterDeed = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[32.4%] top-[19%] h-[55%] w-[30.5%] rounded-[8px] border p-[1.1%]" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.48)", boxShadow: "0 0 20px hsl(var(--deed-cyan) / 0.18)" }}>
    <div className="absolute -top-[24%] left-[25%] right-[25%] z-20 rounded-[8px] border py-1 text-center text-[9px] font-black leading-tight sm:text-[13px]" style={{ color: text, borderColor: line, background: "hsl(var(--deed-bg) / 0.92)", boxShadow: "0 0 16px hsl(var(--deed-cyan) / 0.25)" }}>
      100%<br />Match<br />Score
    </div>
    <DeedCard deed={deed} />
    <svg className="pointer-events-none absolute inset-x-[-35%] top-[39%] z-30 h-[34%]" viewBox="0 0 620 110" preserveAspectRatio="none">
      <line x1="0" y1="55" x2="620" y2="55" stroke="hsl(var(--deed-cyan) / 0.56)" strokeWidth="2" />
      <motion.path d="M0 55 L190 55 L224 14 L254 92 L288 32 L322 71 L354 55 L620 55" fill="none" stroke={cyan} strokeWidth="5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px hsl(var(--deed-cyan)))" }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }} />
    </svg>
  </div>
);

const MapPanel = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute right-[3.5%] top-[19%] h-[55%] w-[28%] overflow-hidden rounded-[8px] border" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.62)", boxShadow: "inset 0 0 24px hsl(var(--deed-cyan) / 0.12), 0 0 18px hsl(var(--deed-cyan) / 0.16)" }}>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 210" preserveAspectRatio="none">
      <pattern id="exactDeedMapGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0 L0 0 0 24" fill="none" stroke="hsl(var(--deed-cyan) / 0.13)" /></pattern>
      <rect width="320" height="210" fill="url(#exactDeedMapGrid)" />
      <path d="M0 84 Q106 31 320 64" stroke="hsl(var(--deed-cyan) / 0.58)" strokeWidth="2" fill="none" />
      <path d="M66 210 L298 17" stroke="hsl(var(--deed-cyan) / 0.3)" strokeWidth="1.5" strokeDasharray="7 5" />
      <path d="M80 70 Q128 48 144 92 Q118 124 80 108 Z" fill="hsl(var(--deed-cyan) / 0.07)" stroke="hsl(var(--deed-cyan) / 0.34)" />
      <path d="M182 110 Q238 92 260 132 Q228 170 182 150 Z" fill="hsl(var(--deed-cyan) / 0.08)" stroke="hsl(var(--deed-cyan) / 0.34)" />
    </svg>
    <div className="absolute left-[58%] top-[38%] -translate-x-1/2 -translate-y-1/2">
      <motion.div className="absolute -inset-5 rounded-full" style={{ background: "hsl(var(--deed-cyan) / 0.3)", filter: "blur(12px)" }} animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0.2, 0.7] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <MapPin className="relative h-12 w-12 sm:h-16 sm:w-16" style={{ color: cyan, fill: cyan, filter: "drop-shadow(0 0 14px hsl(var(--deed-cyan)))" }} />
    </div>
    <p className="absolute bottom-[8%] left-[8%] right-[8%] truncate rounded-[6px] border px-2 py-2 text-center text-[10px] font-black leading-none sm:text-base" style={{ color: text, borderColor: line, background: "hsl(var(--deed-bg) / 0.86)", textShadow: "0 0 8px hsl(var(--deed-cyan) / 0.55)" }}>
      {trimValue(locationOf(deed))}
    </p>
  </div>
);

const Metric = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="flex min-w-0 items-center justify-between gap-1 rounded-[8px] border px-1.5 py-1.5" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.88)", boxShadow: "0 0 14px hsl(var(--deed-cyan) / 0.15)" }}>
    <Icon className="h-4 w-4 shrink-0 sm:h-6 sm:w-6" style={{ color: cyan }} />
    <div className="min-w-0 text-right leading-none">
      <p className="text-[8px] font-black sm:text-[12px]" style={{ color: muted }}>{label}</p>
      <p className="mt-1 truncate text-[9px] font-black sm:text-[13px]" style={{ color: text }}>{value}</p>
    </div>
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto aspect-[1.618/1] w-full max-w-[980px] overflow-hidden rounded-[18px] border font-cairo notranslate"
    style={{
      background: "radial-gradient(circle at 19% 40%, hsl(var(--deed-cyan) / 0.18), transparent 20%), radial-gradient(circle at 50% 42%, hsl(var(--deed-cyan) / 0.1), transparent 30%), linear-gradient(90deg, hsl(var(--deed-bg)), hsl(var(--deed-surface) / 0.92), hsl(var(--deed-bg)))",
      borderColor: "hsl(var(--deed-cyan) / 0.62)",
      boxShadow: "0 0 28px hsl(var(--deed-cyan) / 0.2), inset 0 0 44px hsl(var(--deed-cyan) / 0.09)",
    }}
  >
    <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(hsl(var(--deed-cyan) / 0.09) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.09) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
    <OuterFrame className="left-[1.8%] top-[8%] h-[82%] w-[27.5%]" />
    <OuterFrame className="left-[31%] top-[14%] h-[68%] w-[34%]" />
    <OuterFrame className="right-[1.8%] top-[14%] h-[68%] w-[31%]" />

    <header className="absolute left-[17%] right-[17%] top-[5.5%] z-40 text-center">
      <h2 className="truncate text-[11px] font-black leading-none sm:text-[20px] md:text-[28px]" style={{ color: text, textShadow: "0 0 12px hsl(var(--deed-cyan) / 0.72)" }}>عُتيبي ذكي Ai: تحليل صك عقاري</h2>
    </header>
    <div className="absolute left-[43%] top-[13.5%] z-50 flex -translate-x-1/2 items-center gap-1 rounded-[8px] border px-2 py-0.5 text-[8px] font-black sm:px-3 sm:py-1 sm:text-[13px]" style={{ color: text, borderColor: line, background: "hsl(var(--deed-bg) / 0.92)", boxShadow: "0 0 16px hsl(var(--deed-cyan) / 0.28)" }}>
      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: cyan }} />
      حالة الصك: محدّث وساري
    </div>

    <PhonePreview deed={deed} />
    <CenterDeed deed={deed} />
    <MapPanel deed={deed} />

    <div className="absolute bottom-[12%] left-[30.5%] right-[3%] z-40 grid grid-cols-4 gap-2">
      <Metric icon={User} label="المالك" value={trimValue(deed.owner, "خ...")} />
      <Metric icon={Ruler} label="المساحة" value={deed.area ? `${deed.area} م²` : "...2"} />
      <Metric icon={MapPin} label="الموقع" value={trimValue(locationOf(deed))} />
      <Metric icon={FileText} label="رقم الصك" value={trimValue(deed.deedNumber)} />
    </div>
    <div className="absolute bottom-[3%] left-[31%] right-[31%] text-center text-[9px] font-black leading-tight sm:text-[14px] md:text-[16px]" style={{ color: text, textShadow: "0 0 10px hsl(var(--deed-cyan) / 0.65)" }}>
      عُتيبي ذكي Ai: نحلل<br />بالرؤية والصوت
    </div>
  </section>
);

export default DeedVisualDashboard;
export { Smartphone, Home };