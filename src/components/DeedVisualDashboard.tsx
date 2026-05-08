import { motion } from "framer-motion";
import { CheckCircle2, FileText, Home, MapPin, Ruler, ShieldCheck, Smartphone, User, type LucideIcon } from "lucide-react";

export interface DeedVisualData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const glow = "hsl(var(--deed-gold))";
const glowSoft = "hsl(var(--deed-gold-soft))";
const ink = "hsl(var(--deed-ink))";
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";
const line = "hsl(var(--deed-gold) / 0.54)";

const valueOf = (v?: string) => v?.trim() || "—";
const locationOf = (d: DeedVisualData) => [d.city, d.district].filter(Boolean).join(" - ") || "—";

const Field = ({ label, value, icon: Icon }: { label: string; value: string; icon: LucideIcon }) => (
  <div
    className="relative flex min-w-0 items-center gap-1.5 rounded-md border px-2 py-1.5"
    style={{
      background: "linear-gradient(180deg, hsl(var(--deed-panel) / 0.8), hsl(var(--deed-bg) / 0.78))",
      borderColor: line,
      boxShadow: "inset 0 0 12px hsl(var(--deed-gold) / 0.08), 0 0 10px hsl(var(--deed-gold) / 0.16)",
    }}
  >
    <Icon className="h-5 w-5 shrink-0" style={{ color: glow, filter: "drop-shadow(0 0 5px hsl(var(--deed-gold)))" }} />
    <div className="min-w-0 select-text leading-tight">
      <p className="text-[8px] font-black" style={{ color: glowSoft }}>{label}</p>
      <p className="truncate text-[10px] font-black sm:text-xs" style={{ color: text }}>{value}</p>
    </div>
  </div>
);

const DeedPaper = ({ deed, compact = false }: { deed: DeedVisualData; compact?: boolean }) => (
  <div
    className="relative h-full w-full overflow-hidden rounded-md border"
    style={{
      background:
        "radial-gradient(circle at 50% 18%, hsl(var(--deed-gold) / 0.16), transparent 26%), linear-gradient(135deg, hsl(var(--deed-surface) / 0.9), hsl(var(--deed-bg) / 0.94))",
      borderColor: "hsl(var(--deed-gold) / 0.58)",
      boxShadow: "inset 0 0 0 2px hsl(var(--deed-gold) / 0.18), inset 0 0 32px hsl(var(--deed-ink) / 0.72)",
    }}
  >
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(90deg, hsl(var(--deed-gold) / 0.12) 1px, transparent 1px), linear-gradient(hsl(var(--deed-gold) / 0.1) 1px, transparent 1px)", backgroundSize: compact ? "12px 12px" : "18px 18px" }} />
    {(["right-0 top-0", "left-0 top-0", "right-0 bottom-0", "left-0 bottom-0"] as const).map((pos) => (
      <div key={pos} className={`absolute ${pos} h-[32%] w-[30%]`} style={{ background: "linear-gradient(135deg, hsl(var(--deed-ink) / 0.88), hsl(var(--deed-panel) / 0.68))", clipPath: pos.includes("right") ? "polygon(100% 0, 0 0, 100% 100%)" : "polygon(0 0, 100% 0, 0 100%)" }} />
    ))}
    <div className="relative z-10 mx-auto mt-2 flex h-9 w-9 items-center justify-center rounded-full border" style={{ borderColor: line, color: glow, boxShadow: "0 0 14px hsl(var(--deed-gold) / 0.35)" }}>
      <ShieldCheck className="h-5 w-5" />
    </div>
    <div className="relative z-10 mx-auto mt-1 h-px w-24" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--deed-gold)), transparent)" }} />
    <div className="relative z-10 mt-2 space-y-1 px-4 text-right">
      {[
        ["رقم الصك", valueOf(deed.deedNumber)],
        ["المالك", valueOf(deed.owner)],
        ["المساحة", deed.area ? `${deed.area} م²` : "—"],
        ["الموقع", locationOf(deed)],
      ].map(([label, value]) => (
        <div key={label} className="grid grid-cols-[42%_1fr] gap-1 border-b pb-0.5 text-[8px] sm:text-[10px]" style={{ borderColor: "hsl(var(--deed-gold) / 0.18)" }}>
          <span className="font-black" style={{ color: muted }}>{label}</span>
          <span className="truncate font-black" style={{ color: text }}>{value}</span>
        </div>
      ))}
    </div>
  </div>
);

const MapPanel = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute right-[1.6%] top-[16%] h-[56%] w-[28%] overflow-hidden rounded-md border" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.62)", boxShadow: "inset 0 0 24px hsl(var(--deed-gold) / 0.1), 0 0 12px hsl(var(--deed-gold) / 0.18)" }}>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 210" preserveAspectRatio="none">
      <pattern id="sameDeedMapGrid" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M22 0 L0 0 0 22" fill="none" stroke="hsl(var(--deed-gold) / 0.16)" strokeWidth="0.8" />
      </pattern>
      <rect width="300" height="210" fill="url(#sameDeedMapGrid)" />
      <path d="M0 64 Q90 36 300 82" stroke="hsl(var(--deed-gold) / 0.62)" strokeWidth="2" fill="none" />
      <path d="M40 205 L292 22" stroke="hsl(var(--deed-gold) / 0.34)" strokeWidth="1.5" fill="none" strokeDasharray="6 5" />
      <path d="M156 0 Q135 100 174 210" stroke="hsl(var(--deed-gold) / 0.36)" strokeWidth="1.5" fill="none" />
      <path d="M68 53 Q115 40 132 77 Q119 110 78 101 Z" fill="hsl(var(--deed-gold) / 0.08)" stroke="hsl(var(--deed-gold) / 0.35)" />
      <path d="M172 112 Q224 94 244 132 Q215 168 174 151 Z" fill="hsl(var(--deed-gold) / 0.08)" stroke="hsl(var(--deed-gold) / 0.35)" />
    </svg>
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
      <motion.div className="absolute -inset-4 rounded-full" style={{ background: "hsl(var(--deed-gold) / 0.25)", filter: "blur(10px)" }} animate={{ scale: [1, 1.35, 1], opacity: [0.65, 0.18, 0.65] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <MapPin className="relative h-8 w-8" style={{ color: glow, fill: glow, filter: "drop-shadow(0 0 10px hsl(var(--deed-gold)))" }} />
    </div>
    <p className="absolute bottom-2 left-2 right-2 truncate rounded border px-1.5 py-1 text-center text-[9px] font-black" style={{ color: glowSoft, borderColor: "hsl(var(--deed-gold) / 0.35)", background: "hsl(var(--deed-ink) / 0.78)" }}>
      {locationOf(deed)}
    </p>
  </div>
);

const PhonePreview = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[1.4%] top-[3.5%] h-[90%] w-[28%] rounded-[9%] border p-[1.2%]" style={{ background: "linear-gradient(160deg, hsl(var(--deed-bg)), hsl(var(--deed-panel)))", borderColor: "hsl(var(--deed-gold) / 0.45)", boxShadow: "0 0 18px hsl(var(--deed-gold) / 0.2), inset 0 0 18px hsl(var(--deed-ink))" }}>
    <div className="absolute left-1/2 top-1.5 h-4 w-[34%] -translate-x-1/2 rounded-b-xl" style={{ background: ink }} />
    <div className="mt-5 h-[68%]"><DeedPaper deed={deed} compact /></div>
    <div className="mt-2 rounded-md border px-2 py-1 text-center" style={{ borderColor: line, background: "hsl(var(--deed-panel) / 0.68)" }}>
      <p className="text-[8px] font-black" style={{ color: muted }}>رقم الصك</p>
      <p className="truncate text-[10px] font-black" style={{ color: text }}>{valueOf(deed.deedNumber)}</p>
    </div>
    <div className="absolute inset-x-[10%] bottom-3 grid grid-cols-4 gap-1 text-center text-[7px] font-black" style={{ color: "hsl(var(--deed-gold) / 0.75)" }}>
      <Home className="mx-auto h-3 w-3" /><span>مؤشر</span><span>تحليل</span><span>فيديو</span>
    </div>
  </div>
);

const CenterDeed = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[32%] top-[16%] h-[56%] w-[35%] rounded-md border p-2" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.5)", boxShadow: "0 0 16px hsl(var(--deed-gold) / 0.2), inset 0 0 20px hsl(var(--deed-gold) / 0.08)" }}>
    <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 rounded-md border px-2 py-0.5 text-[9px] font-black" style={{ color: glowSoft, borderColor: line, background: "hsl(var(--deed-ink) / 0.88)", boxShadow: "0 0 12px hsl(var(--deed-gold) / 0.22)" }}>100% Match Score</div>
    <DeedPaper deed={deed} />
    <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 -translate-y-1/2">
      <svg viewBox="0 0 520 90" className="h-20 w-full overflow-visible">
        <line x1="0" y1="45" x2="520" y2="45" stroke="hsl(var(--deed-gold) / 0.55)" strokeWidth="1" />
        <motion.path d="M0 45 L160 45 L190 45 L216 8 L242 78 L266 25 L294 58 L324 45 L520 45" fill="none" stroke={glow} strokeWidth="3" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px hsl(var(--deed-gold)))" }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
      </svg>
    </div>
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto aspect-[16/9] min-h-[230px] w-full max-w-[980px] overflow-hidden rounded-2xl border font-cairo notranslate"
    style={{
      background: "radial-gradient(ellipse at 52% 35%, hsl(var(--deed-surface)) 0%, hsl(var(--deed-navy)) 48%, hsl(var(--deed-bg)) 100%)",
      borderColor: "hsl(var(--deed-gold) / 0.5)",
      boxShadow: "0 0 34px hsl(var(--deed-gold) / 0.18), inset 0 0 54px hsl(var(--deed-ink) / 0.72)",
    }}
  >
    <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(hsl(var(--deed-gold) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-gold) / 0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

    <header className="absolute right-[31%] top-[3.2%] z-40 flex items-center gap-2">
      <ShieldCheck className="h-5 w-5" style={{ color: glow, filter: "drop-shadow(0 0 6px hsl(var(--deed-gold)))" }} />
      <h2 className="text-xs font-black sm:text-lg" style={{ color: glowSoft, textShadow: "0 0 10px hsl(var(--deed-gold) / 0.6)" }}>عُتيبي ذكي Ai: تحليل صك عقاري</h2>
    </header>

    <div className="absolute left-[36%] top-[6.8%] z-50 flex items-center gap-1 rounded-md border px-2 py-1 text-[9px] font-black sm:text-xs" style={{ background: "hsl(var(--deed-ink) / 0.82)", borderColor: line, color: glowSoft, boxShadow: "0 0 13px hsl(var(--deed-gold) / 0.26)" }}>
      <CheckCircle2 className="h-3.5 w-3.5" style={{ color: glow }} />
      حالة الصك: محدّث وساري
    </div>

    <PhonePreview deed={deed} />
    <CenterDeed deed={deed} />
    <MapPanel deed={deed} />

    <div className="absolute bottom-[13.5%] left-[31.5%] right-[1.6%] grid grid-cols-4 gap-2">
      <Field icon={User} label="المالك" value={valueOf(deed.owner)} />
      <Field icon={Ruler} label="المساحة" value={deed.area ? `${deed.area} م²` : "—"} />
      <Field icon={MapPin} label="الموقع" value={locationOf(deed)} />
      <Field icon={FileText} label="رقم الصك" value={valueOf(deed.deedNumber)} />
    </div>

    <div className="absolute bottom-[2.3%] left-[34%] right-[34%] rounded-t-lg border-t px-4 py-1 text-center text-[9px] font-black" style={{ color: muted, borderColor: "hsl(var(--deed-gold) / 0.38)", background: "hsl(var(--deed-panel) / 0.45)" }}>
      عُتيبي ذكي Ai: نحلل بالرؤية والصوت
    </div>
  </section>
);

export default DeedVisualDashboard;
export { Smartphone };
