import { motion } from "framer-motion";
import { CheckCircle2, FileText, Home, MapPin, Ruler, ShieldCheck, Smartphone, User, Video, type LucideIcon } from "lucide-react";

export interface DeedVisualData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const gold = "hsl(var(--deed-gold))";
const goldSoft = "hsl(var(--deed-gold-soft))";
const parchment = "hsl(var(--deed-parchment))";
const ink = "hsl(var(--deed-ink))";
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";

const v = (s?: string) => (s && s.trim()) || "—";
const loc = (d: DeedVisualData) => [d.city, d.district].filter(Boolean).join(" - ") || "—";

/* === Ornate parchment deed paper === */
const DeedPaper = ({ deed, mini = false }: { deed: DeedVisualData; mini?: boolean }) => (
  <div
    className="relative h-full w-full overflow-hidden rounded-[6px]"
    style={{
      background: `linear-gradient(180deg, hsl(var(--deed-parchment)) 0%, hsl(var(--deed-parchment-deep)) 100%)`,
      boxShadow: `inset 0 0 0 2px ${gold}, inset 0 0 0 4px hsl(var(--deed-parchment-deep)), inset 0 0 0 6px ${gold}, 0 6px 18px hsl(var(--deed-ink) / 0.6)`,
    }}
  >
    {/* corner ornaments */}
    {[
      "left-1 top-1",
      "right-1 top-1",
      "left-1 bottom-1",
      "right-1 bottom-1",
    ].map((pos, i) => (
      <div key={i} className={`absolute ${pos} h-[10%] w-[10%] rounded-[2px] border-2`} style={{ borderColor: gold, opacity: 0.65 }} />
    ))}

    {/* crown emblem */}
    <div className="relative z-10 mt-[6%] flex flex-col items-center">
      <svg viewBox="0 0 60 50" className={mini ? "h-[22%] w-auto" : "h-[18%] w-auto"} aria-hidden="true">
        <circle cx="30" cy="28" r="20" fill="hsl(var(--deed-ink))" stroke={gold} strokeWidth="1.4" />
        <path d="M14 24 L20 14 L26 22 L30 10 L34 22 L40 14 L46 24 L46 32 L14 32 Z" fill={gold} stroke={gold} strokeWidth="0.8" strokeLinejoin="round" />
        <circle cx="20" cy="14" r="1.6" fill={gold} />
        <circle cx="30" cy="10" r="1.8" fill={gold} />
        <circle cx="40" cy="14" r="1.6" fill={gold} />
        <rect x="18" y="34" width="24" height="2" fill={gold} />
      </svg>
    </div>

    {/* Arabic ornate title */}
    <p
      className={`relative z-10 mt-[2%] text-center font-black ${mini ? "text-[7px] sm:text-[10px]" : "text-[9px] sm:text-[14px] md:text-[18px]"}`}
      style={{ color: ink, letterSpacing: "0.04em", textShadow: `0 1px 0 hsl(var(--deed-parchment))` }}
    >
      حجة استحكام عقاري
    </p>

    {/* divider flourish */}
    <div className="relative z-10 mx-auto mt-[2%] flex w-[60%] items-center justify-center gap-1">
      <div className="h-px flex-1" style={{ background: gold, opacity: 0.6 }} />
      <span className="text-[8px]" style={{ color: gold }}>۞</span>
      <div className="h-px flex-1" style={{ background: gold, opacity: 0.6 }} />
    </div>

    {/* deed body lines */}
    <div className={`relative z-10 mx-auto mt-[4%] w-[86%] space-y-[3%] text-right leading-tight ${mini ? "text-[5.5px] sm:text-[7px]" : "text-[7px] sm:text-[10px] md:text-[12px]"}`}>
      <p className="flex items-center justify-between gap-1 whitespace-nowrap" style={{ color: ink, fontWeight: 800 }}>
        <span>رقم الصك:</span> <span className="min-w-0 text-left" style={{ color: ink }}>{v(deed.deedNumber)}</span>
      </p>
      <p className="flex items-center justify-between gap-1 whitespace-nowrap" style={{ color: ink, fontWeight: 800 }}>
        <span>حالة الصك:</span> <span>ساري</span>
      </p>
      <p className="flex items-center justify-between gap-1 whitespace-nowrap" style={{ color: ink, fontWeight: 800 }}>
        <span>المالك:</span> <span className="min-w-0 text-left">{v(deed.owner)}</span>
      </p>
      <p className="flex items-center justify-between gap-1 whitespace-nowrap" style={{ color: ink, fontWeight: 800 }}>
        <span>المساحة:</span> <span>{deed.area ? `${deed.area} م²` : "—"}</span>
      </p>
      {!mini && (
        <>
          <p style={{ color: ink, fontWeight: 800 }}>
            الموقع: <span>{loc(deed)}</span>
          </p>
          <p style={{ color: ink, fontWeight: 800 }}>
            المرجع: قاعدة البيانات الوطنية
          </p>
        </>
      )}
    </div>

    {/* signature script */}
    {!mini && (
      <p
        className="absolute bottom-[6%] right-[10%] text-[10px] italic sm:text-[14px]"
        style={{ color: ink, fontFamily: "cursive", opacity: 0.85 }}
      >
        وتحرر بيوم الشمائلي
      </p>
    )}
  </div>
);

/* === Phone mockup with mini parchment deed === */
const PhonePreview = ({ deed }: { deed: DeedVisualData }) => (
  <div
    className="absolute left-[2.3%] top-[6%] z-20 h-[82%] w-[26%] overflow-hidden rounded-[12%] border-[3px] p-[1.5%]"
    style={{
      borderColor: ink,
      background: ink,
      boxShadow: `0 0 0 1px ${gold}, 0 0 28px hsl(var(--deed-ink) / 0.8)`,
    }}
  >
    {/* notch */}
    <div className="absolute left-1/2 top-[1.5%] z-40 h-[3.5%] w-[34%] -translate-x-1/2 rounded-b-full" style={{ background: ink }} />
    <div className="relative h-full w-full overflow-hidden rounded-[8%]" style={{ background: ink }}>
      <div className="absolute inset-x-[6%] top-[7%] bottom-[24%]">
        <DeedPaper deed={deed} mini />
      </div>
      {/* deed number badge */}
      <div className="absolute inset-x-[8%] bottom-[14%] rounded-[6px] border px-[6%] py-[3%] text-center" style={{ borderColor: `${gold}`, background: "hsl(var(--deed-bg) / 0.7)" }}>
        <p className="text-[6px] font-black sm:text-[8px]" style={{ color: muted }}>رقم الصك</p>
        <p className="mt-[3%] truncate text-[7px] font-black sm:text-[11px]" style={{ color: goldSoft }}>{v(deed.deedNumber)}</p>
      </div>
      {/* bottom nav */}
      <div className="absolute bottom-0 grid h-[12%] w-full grid-cols-4 border-t" style={{ borderColor: `${gold}40`, background: "hsl(var(--deed-bg) / 0.92)" }}>
        {[
          { I: Home, l: "الرئيسية" },
          { I: ShieldCheck, l: "البرامج" },
          { I: FileText, l: "تحليل الصك" },
          { I: Video, l: "المحرر" },
        ].map(({ I, l }, i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-0.5">
            <I className="h-[28%] w-[28%]" style={{ color: i === 2 ? gold : `${goldSoft}` }} />
            <span className="text-[5px] font-black sm:text-[7px]" style={{ color: i === 2 ? gold : muted }}>{l}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* === Center deed (large) with waveform === */
const CenterDeed = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[31%] top-[20%] z-20 h-[52%] w-[37%]">
    {/* match score pill */}
    <div
      className="absolute -top-[7%] left-1/2 z-30 -translate-x-1/2 rounded-[6px] border px-3 py-[1.4%] text-center text-[7px] font-black sm:text-[11px] md:text-[13px]"
      style={{ color: goldSoft, borderColor: gold, background: "hsl(var(--deed-ink) / 0.92)", boxShadow: `0 0 14px ${gold}66` }}
    >
      100% Match Score
    </div>
    <DeedPaper deed={deed} />
    {/* waveform overlay */}
    <svg className="pointer-events-none absolute inset-x-[-18%] top-[42%] z-30 h-[24%]" viewBox="0 0 620 120" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="62" x2="620" y2="62" stroke={`${gold}`} strokeWidth="1.6" opacity="0.55" />
      <motion.path
        d="M0 62 L160 62 L195 22 L228 100 L262 30 L298 78 L334 62 L620 62"
        fill="none"
        stroke="hsl(var(--deed-cyan))"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 8px hsl(var(--deed-cyan)))` }}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  </div>
);

/* === Map panel (light) === */
const MapPanel = ({ deed }: { deed: DeedVisualData }) => (
  <div
    className="absolute right-[2.4%] top-[10%] z-20 h-[62%] w-[26%] overflow-hidden rounded-[6px] border-2"
    style={{
      borderColor: gold,
      background: "hsl(45 30% 88%)",
      boxShadow: `0 0 16px ${gold}55`,
    }}
  >
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 330 230" preserveAspectRatio="none" aria-hidden="true">
      <pattern id="mp-grid" width="22" height="22" patternUnits="userSpaceOnUse">
        <path d="M22 0 L0 0 0 22" fill="none" stroke="hsl(158 30% 60% / 0.35)" />
      </pattern>
      <rect width="330" height="230" fill="url(#mp-grid)" />
      <g fill="none" strokeLinecap="round">
        <path d="M0 70 H140 V120 H80 V200" stroke="hsl(158 35% 45% / 0.55)" strokeWidth="1.6" />
        <path d="M170 50 H310 V160 H220 V220" stroke="hsl(158 35% 45% / 0.55)" strokeWidth="1.6" />
        <path d="M0 180 L330 30" stroke="hsl(42 50% 45% / 0.4)" strokeWidth="1.4" strokeDasharray="6 5" />
        <path d="M110 100 Q150 70 170 115 Q140 150 105 130 Z" fill="hsl(158 40% 50% / 0.18)" stroke="hsl(158 40% 40% / 0.55)" />
      </g>
      <text x="40" y="40" fontSize="9" fill="hsl(158 50% 25% / 0.6)" fontWeight="bold">WADAY NEIGHBORHOOD</text>
      <text x="220" y="100" fontSize="9" fill="hsl(158 50% 25% / 0.6)" fontWeight="bold">RAMPUR</text>
      <text x="240" y="200" fontSize="9" fill="hsl(158 50% 25% / 0.6)" fontWeight="bold">ROOLEM</text>
    </svg>
    <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
      <motion.div className="absolute -inset-5 rounded-full" style={{ background: `${gold}55`, filter: "blur(12px)" }} animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.2, 0.7] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <MapPin className="relative h-10 w-10 sm:h-14 sm:w-14" style={{ color: gold, fill: gold, filter: `drop-shadow(0 0 10px ${gold})` }} />
    </div>
  </div>
);

/* === Bottom metric chip === */
const Metric = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div
    className="flex min-w-0 items-center justify-between gap-2 rounded-[6px] border-2 px-[4%] py-[5%]"
    style={{ borderColor: gold, background: "hsl(var(--deed-ink) / 0.85)", boxShadow: `0 0 12px ${gold}33` }}
  >
    <Icon className="h-4 w-4 shrink-0 sm:h-6 sm:w-6" style={{ color: gold }} />
    <div className="min-w-0 flex-1 text-right leading-tight">
      <p className="text-[6px] font-black sm:text-[9px] md:text-[11px]" style={{ color: muted }}>{label}</p>
      <p className="mt-[4%] break-words text-[7px] font-black leading-tight sm:text-[10px] md:text-[12px]" style={{ color: goldSoft }}>{value}</p>
    </div>
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto aspect-[1.7/1] w-full max-w-[980px] overflow-hidden rounded-[10px] border-2 font-cairo notranslate"
    style={{
      background: `radial-gradient(circle at 50% 30%, hsl(158 50% 14%), hsl(var(--deed-bg)) 70%)`,
      borderColor: gold,
      boxShadow: `0 0 28px ${gold}33, inset 0 0 60px hsl(var(--deed-ink) / 0.7)`,
    }}
  >
    {/* subtle grid */}
    <div
      className="absolute inset-0 opacity-25"
      style={{
        backgroundImage: `linear-gradient(${gold}22 1px, transparent 1px), linear-gradient(90deg, ${gold}22 1px, transparent 1px)`,
        backgroundSize: "32px 32px",
      }}
    />
    {/* inner gold frame */}
    <div className="absolute inset-[1.8%] rounded-[8px] border" style={{ borderColor: `${gold}66` }} />

    {/* Header (top right) */}
    <header className="absolute right-[3%] top-[4%] z-40 flex items-center gap-2">
      <h2 className="truncate text-[9px] font-black sm:text-[15px] md:text-[20px]" style={{ color: goldSoft, textShadow: `0 0 10px ${gold}88` }}>
        عُتيبي ذكي Ai: تحليل صك عقاري
      </h2>
      <svg viewBox="0 0 30 30" className="h-4 w-4 sm:h-6 sm:w-6" aria-hidden="true">
        <circle cx="15" cy="15" r="13" fill="none" stroke={gold} strokeWidth="2" />
        <path d="M15 4 L18 12 L26 13 L20 19 L22 27 L15 23 L8 27 L10 19 L4 13 L12 12 Z" fill={gold} />
      </svg>
    </header>

    {/* Status pill (top center) */}
    <div
      className="absolute left-1/2 top-[5.5%] z-50 flex -translate-x-1/2 items-center gap-1.5 rounded-[8px] border-2 px-3 py-[1%] text-[8px] font-black sm:text-[12px] md:text-[15px]"
      style={{ color: goldSoft, borderColor: gold, background: "hsl(var(--deed-ink) / 0.92)", boxShadow: `0 0 14px ${gold}55` }}
    >
      حالة الصك: محدّث وساري
      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: "hsl(140 70% 55%)" }} fill="hsl(140 70% 55%)" stroke={ink} />
    </div>

    <PhonePreview deed={deed} />
    <CenterDeed deed={deed} />
    <MapPanel deed={deed} />

    {/* 4 metric chips */}
    <div className="absolute bottom-[10%] left-[2.4%] right-[2.4%] z-40 grid grid-cols-4 gap-[1.4%]">
      <Metric icon={MapPin} label="الموقع" value={loc(deed)} />
      <Metric icon={Ruler} label="المساحة" value={deed.area ? `${deed.area} م²` : "—"} />
      <Metric icon={User} label="المالك" value={v(deed.owner)} />
      <Metric icon={FileText} label="رقم الصك" value={v(deed.deedNumber)} />
    </div>

    {/* footer */}
    <div
      className="absolute bottom-[2.5%] left-[28%] right-[28%] z-40 rounded-t-[10px] border-t-2 px-2 pt-[1.4%] text-center text-[7px] font-black sm:text-[11px] md:text-[13px]"
      style={{ color: goldSoft, borderColor: gold, textShadow: `0 0 8px ${gold}66` }}
    >
      عُتيبي ذكي Ai · نحلل بالرؤية والصوت
    </div>

    {/* sparkle */}
    <div className="absolute bottom-[3%] right-[3%] z-40 text-[20px] sm:text-[28px]" style={{ color: gold, textShadow: `0 0 14px ${gold}88` }}>✦</div>
  </section>
);

export default DeedVisualDashboard;
export { Smartphone, Home };
