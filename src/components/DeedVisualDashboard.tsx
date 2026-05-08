import { motion } from "framer-motion";
import { Award, CheckCircle2, FileText, Home, MapPin, Ruler, ShieldCheck, Smartphone, User, type LucideIcon } from "lucide-react";

export interface DeedVisualData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const mint = "hsl(var(--deed-cyan))";
const gold = "hsl(var(--deed-gold))";
const goldSoft = "hsl(var(--deed-gold-soft))";
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";
const panel = "hsl(var(--deed-panel) / 0.78)";
const line = "hsl(var(--deed-gold) / 0.68)";

const valueOf = (v?: string) => v?.trim() || "—";
const compact = (v?: string, max = 16, fallback = "...") => {
  const value = valueOf(v);
  if (value === "—") return fallback;
  return value.length > max ? `...${value.slice(-(max - 3))}` : value;
};
const locationOf = (d: DeedVisualData) => [d.city, d.district].filter(Boolean).join(" - ") || "—";

const GlowDot = ({ className }: { className: string }) => (
  <span
    className={`absolute z-40 h-[0.9%] w-[0.9%] rounded-full ${className}`}
    style={{ background: gold, boxShadow: `0 0 8px ${gold}, 0 0 18px hsl(var(--deed-gold) / 0.45)` }}
  />
);

const ConnectorLines = () => (
  <svg className="pointer-events-none absolute inset-0 z-30 h-full w-full" viewBox="0 0 1000 595" preserveAspectRatio="none" aria-hidden="true">
    <g fill="none" stroke="hsl(var(--deed-gold) / 0.68)" strokeWidth="2">
      <path d="M146 407 V463 H286" />
      <path d="M510 314 V463 H494" />
      <path d="M815 377 V463 H692" />
      <path d="M408 435 V463 H332" />
      <path d="M702 439 V463 H736" />
      <path d="M523 196 V162" />
      <path d="M316 281 H633" stroke="hsl(var(--deed-cyan) / 0.62)" />
    </g>
  </svg>
);

const MiniField = ({ label, value }: { label: string; value: string }) => (
  <div className="grid grid-cols-[1fr_0.82fr] items-center gap-[3%] border-b py-[2.2%]" style={{ borderColor: "hsl(var(--deed-gold) / 0.18)" }}>
    <span className="truncate text-left text-[6px] font-black leading-none sm:text-[8px] md:text-[10px]" style={{ color: text }}>{value}</span>
    <span className="text-right text-[5px] font-black leading-none sm:text-[7px] md:text-[9px]" style={{ color: muted }}>{label}</span>
  </div>
);

const DigitalDeed = ({ deed, phone = false }: { deed: DeedVisualData; phone?: boolean }) => (
  <div
    className="relative h-full w-full overflow-hidden rounded-[3px] border"
    style={{
      background: "linear-gradient(135deg, hsl(var(--deed-parchment)), hsl(var(--deed-parchment-deep)))",
      borderColor: "hsl(var(--deed-gold) / 0.42)",
      boxShadow: "inset 0 0 28px hsl(var(--deed-gold) / 0.1), inset 0 0 70px hsl(var(--deed-bg) / 0.72)",
    }}
  >
    <div className="absolute inset-[4%] rotate-45 border" style={{ borderColor: "hsl(var(--deed-gold) / 0.16)" }} />
    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(circle at 35% 30%, hsl(var(--deed-gold) / 0.2), transparent 18%), linear-gradient(90deg, transparent, hsl(var(--deed-gold) / 0.08), transparent)" }} />
    <div className="relative z-10 mx-auto mt-[5%] flex aspect-square h-[18%] items-center justify-center rounded-full border" style={{ color: gold, borderColor: "hsl(var(--deed-gold) / 0.45)", background: "hsl(var(--deed-bg) / 0.22)", boxShadow: "0 0 20px hsl(var(--deed-gold) / 0.28)" }}>
      <Award className="h-[62%] w-[62%]" />
    </div>
    <p className="relative z-10 mt-[2.5%] text-center text-[6px] font-black leading-none sm:text-[9px] md:text-[11px]" style={{ color: goldSoft }}>صك عقاري رقمي</p>
    <div className="relative z-10 mx-auto mt-[4%] w-[72%]">
      <MiniField label="رقم الصك" value={compact(deed.deedNumber, phone ? 10 : 16)} />
      <MiniField label="المالك" value={compact(deed.owner, phone ? 9 : 15)} />
      <MiniField label="المساحة" value={deed.area ? `${compact(deed.area, 7)} م²` : "..."} />
      {!phone && <MiniField label="الموقع" value={compact(locationOf(deed), 15)} />}
    </div>
    <div className="absolute bottom-[7%] left-[16%] right-[16%] h-px" style={{ background: "hsl(var(--deed-gold) / 0.34)", boxShadow: "0 0 10px hsl(var(--deed-gold) / 0.24)" }} />
  </div>
);

const PhonePreview = ({ deed }: { deed: DeedVisualData }) => (
  <div
    className="absolute left-[2.3%] top-[3.4%] z-20 h-[88.5%] w-[27.2%] overflow-hidden rounded-[11%] border-[3px] p-[1.55%]"
    style={{ borderColor: "hsl(var(--deed-ink))", background: "hsl(var(--deed-ink))", boxShadow: "0 0 0 1px hsl(var(--deed-gold) / 0.32), 0 0 28px hsl(var(--deed-bg) / 0.85)" }}
  >
    <div className="absolute left-1/2 top-[2%] z-40 h-[4%] w-[33%] -translate-x-1/2 rounded-b-full" style={{ background: "hsl(var(--deed-bg))" }} />
    <div className="relative h-full w-full overflow-hidden rounded-[8%] border" style={{ borderColor: "hsl(var(--deed-gold) / 0.18)", background: "linear-gradient(180deg, hsl(var(--deed-panel) / 0.92), hsl(var(--deed-bg)))" }}>
      <div className="absolute inset-x-[8%] top-[8%] h-[71%]">
        <DigitalDeed deed={deed} phone />
      </div>
      <div className="absolute inset-x-[7%] bottom-[14%] rounded-[7px] border px-[7%] py-[4%]" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.82)", boxShadow: "0 0 12px hsl(var(--deed-gold) / 0.18)" }}>
        <p className="text-center text-[6px] font-black leading-none sm:text-[8px]" style={{ color: muted }}>رقم الصك</p>
        <p className="mt-[4%] truncate text-center text-[7px] font-black leading-none sm:text-[11px] md:text-[13px]" style={{ color: text }}>{compact(deed.deedNumber, 12)}</p>
      </div>
      <div className="absolute bottom-0 grid h-[11%] w-full grid-cols-4 border-t" style={{ borderColor: "hsl(var(--deed-gold) / 0.15)", background: "hsl(var(--deed-bg) / 0.92)" }}>
        {[Home, FileText, ShieldCheck, Smartphone].map((Icon, i) => (
          <div key={i} className="flex items-center justify-center">
            <Icon className="h-[38%] w-[38%]" style={{ color: i === 0 ? mint : "hsl(var(--deed-muted) / 0.55)" }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CenterDeed = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute left-[31.2%] top-[15.8%] z-20 h-[53.5%] w-[36.2%] rounded-[5px] border p-[1%]" style={{ borderColor: "hsl(var(--deed-cyan) / 0.54)", background: "hsl(var(--deed-bg) / 0.3)", boxShadow: "0 0 22px hsl(var(--deed-cyan) / 0.18), inset 0 0 18px hsl(var(--deed-cyan) / 0.08)" }}>
    <div className="absolute -top-[12.5%] left-[30%] right-[30%] z-30 rounded-b-[8px] border px-1 py-[1.4%] text-center text-[6px] font-black leading-[1.1] sm:text-[9px] md:text-[11px]" style={{ color: text, borderColor: line, background: "hsl(var(--deed-bg) / 0.88)", boxShadow: "0 0 13px hsl(var(--deed-gold) / 0.22)" }}>
      100% Match Score
    </div>
    <DigitalDeed deed={deed} />
    <svg className="pointer-events-none absolute inset-x-[-23%] top-[37%] z-30 h-[28%]" viewBox="0 0 620 120" preserveAspectRatio="none" aria-hidden="true">
      <line x1="0" y1="62" x2="620" y2="62" stroke="hsl(var(--deed-gold) / 0.48)" strokeWidth="2" />
      <motion.path d="M0 62 L186 62 L221 18 L253 103 L290 31 L323 76 L357 62 L620 62" fill="none" stroke={mint} strokeWidth="5" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 10px hsl(var(--deed-cyan)))" }} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
    </svg>
  </div>
);

const MapPanel = ({ deed }: { deed: DeedVisualData }) => (
  <div className="absolute right-[2.4%] top-[15.8%] z-20 h-[53.5%] w-[28.2%] overflow-hidden rounded-[4px] border" style={{ borderColor: "hsl(var(--deed-cyan) / 0.58)", background: panel, boxShadow: "inset 0 0 25px hsl(var(--deed-cyan) / 0.12), 0 0 18px hsl(var(--deed-cyan) / 0.18)" }}>
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 330 230" preserveAspectRatio="none" aria-hidden="true">
      <pattern id="deedReferenceMapGrid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0 L0 0 0 28" fill="none" stroke="hsl(var(--deed-gold) / 0.1)" /></pattern>
      <rect width="330" height="230" fill="url(#deedReferenceMapGrid)" />
      <g fill="none" strokeLinecap="round">
        <path d="M-10 89 C70 64 142 62 210 76 S302 86 350 60" stroke="hsl(var(--deed-cyan) / 0.42)" strokeWidth="2.3" />
        <path d="M60 230 L296 4" stroke="hsl(var(--deed-gold) / 0.28)" strokeWidth="2" />
        <path d="M24 170 L170 24 L312 42" stroke="hsl(var(--deed-cyan) / 0.24)" strokeWidth="1.7" strokeDasharray="8 7" />
        <path d="M52 70 H136 V128 H86 V185" stroke="hsl(var(--deed-cyan) / 0.32)" strokeWidth="1.6" />
        <path d="M176 92 H300 V170 H228 V216" stroke="hsl(var(--deed-cyan) / 0.3)" strokeWidth="1.6" />
        <path d="M108 96 Q148 66 166 111 Q134 145 100 128 Z" fill="hsl(var(--deed-cyan) / 0.08)" stroke="hsl(var(--deed-cyan) / 0.36)" />
      </g>
    </svg>
    <div className="absolute left-[55%] top-[43%] -translate-x-1/2 -translate-y-1/2">
      <motion.div className="absolute -inset-5 rounded-full" style={{ background: "hsl(var(--deed-gold) / 0.3)", filter: "blur(12px)" }} animate={{ scale: [1, 1.35, 1], opacity: [0.75, 0.18, 0.75] }} transition={{ duration: 1.8, repeat: Infinity }} />
      <MapPin className="relative h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14" style={{ color: gold, fill: gold, filter: "drop-shadow(0 0 12px hsl(var(--deed-gold)))" }} />
    </div>
    <p className="absolute bottom-[7%] left-[8%] right-[8%] truncate rounded-[5px] border px-2 py-[3%] text-center text-[6px] font-black leading-none sm:text-[10px] md:text-[12px]" style={{ color: text, borderColor: "hsl(var(--deed-gold) / 0.42)", background: "hsl(var(--deed-bg) / 0.82)", textShadow: "0 0 8px hsl(var(--deed-gold) / 0.55)" }}>
      {compact(locationOf(deed), 20)}
    </p>
  </div>
);

const Metric = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="flex min-w-0 items-center justify-between gap-[4%] rounded-[6px] border px-[5%] py-[5%]" style={{ borderColor: line, background: "hsl(var(--deed-bg) / 0.82)", boxShadow: "0 0 14px hsl(var(--deed-gold) / 0.16)" }}>
    <Icon className="h-4 w-4 shrink-0 sm:h-6 sm:w-6 md:h-7 md:w-7" style={{ color: gold }} />
    <div className="min-w-0 flex-1 text-right leading-none">
      <p className="truncate text-[6px] font-black sm:text-[9px] md:text-[11px]" style={{ color: muted }}>{label}</p>
      <p className="mt-[5%] truncate text-[7px] font-black sm:text-[11px] md:text-[13px]" style={{ color: text }}>{value}</p>
    </div>
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto aspect-[1.68/1] w-full max-w-[980px] overflow-hidden rounded-[10px] border font-cairo notranslate"
    style={{
      background: "radial-gradient(circle at 18% 44%, hsl(var(--deed-cyan) / 0.16), transparent 17%), radial-gradient(circle at 58% 40%, hsl(var(--deed-gold) / 0.1), transparent 24%), linear-gradient(90deg, hsl(var(--deed-bg)), hsl(var(--deed-surface) / 0.96), hsl(var(--deed-bg)))",
      borderColor: "hsl(var(--deed-gold) / 0.55)",
      boxShadow: "0 0 28px hsl(var(--deed-cyan) / 0.16), inset 0 0 48px hsl(var(--deed-gold) / 0.08)",
    }}
  >
    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(hsl(var(--deed-gold) / 0.07) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-gold) / 0.07) 1px, transparent 1px)", backgroundSize: "34px 34px" }} />
    <div className="absolute inset-[2.1%] rounded-[8px] border" style={{ borderColor: "hsl(var(--deed-gold) / 0.24)" }} />
    <ConnectorLines />
    <GlowDot className="left-[14.2%] top-[68.2%]" />
    <GlowDot className="left-[40.4%] top-[72.2%]" />
    <GlowDot className="left-[51.6%] top-[53.2%]" />
    <GlowDot className="left-[81.2%] top-[63.5%]" />

    <header className="absolute right-[4.2%] top-[5.1%] z-40 flex max-w-[47%] items-center gap-[2%]">
      <ShieldCheck className="h-4 w-4 shrink-0 sm:h-6 sm:w-6" style={{ color: gold, filter: "drop-shadow(0 0 8px hsl(var(--deed-gold) / 0.68))" }} />
      <h2 className="truncate text-[9px] font-black leading-none sm:text-[17px] md:text-[22px]" style={{ color: goldSoft, textShadow: "0 0 12px hsl(var(--deed-gold) / 0.45)" }}>عُتيبي ذكي Ai: تحليل صك عقاري</h2>
    </header>

    <div className="absolute left-[38.5%] top-[7.6%] z-50 flex items-center gap-1 rounded-[6px] border px-[2%] py-[1%] text-[7px] font-black leading-none sm:text-[12px] md:text-[15px]" style={{ color: text, borderColor: line, background: "hsl(var(--deed-bg) / 0.86)", boxShadow: "0 0 16px hsl(var(--deed-gold) / 0.27)" }}>
      <CheckCircle2 className="h-3 w-3 sm:h-5 sm:w-5" style={{ color: mint }} />
      حالة الصك: محدّث وساري
    </div>

    <PhonePreview deed={deed} />
    <CenterDeed deed={deed} />
    <MapPanel deed={deed} />

    <div className="absolute bottom-[14%] left-[31%] right-[2.4%] z-40 grid grid-cols-4 gap-[1.3%]">
      <Metric icon={FileText} label="رقم الصك" value={compact(deed.deedNumber, 13)} />
      <Metric icon={User} label="المالك" value={compact(deed.owner, 13)} />
      <Metric icon={Ruler} label="المساحة" value={deed.area ? `${compact(deed.area, 7)} م²` : "... م²"} />
      <Metric icon={MapPin} label="الموقع" value={compact(locationOf(deed), 14)} />
    </div>

    <div className="absolute bottom-[3.2%] left-[34%] right-[34%] z-40 rounded-t-[12px] border-t px-2 pt-[1.4%] text-center text-[6px] font-black leading-none sm:text-[10px] md:text-[12px]" style={{ color: goldSoft, borderColor: "hsl(var(--deed-gold) / 0.28)", textShadow: "0 0 10px hsl(var(--deed-gold) / 0.45)" }}>
      عُتيبي ذكي Ai: نحلل بالرؤية والصوت
    </div>

    <div className="absolute bottom-[3.5%] right-[3.8%] z-40 text-[18px] leading-none sm:text-[30px]" style={{ color: gold, textShadow: "0 0 14px hsl(var(--deed-gold) / 0.45)" }}>✦</div>
  </section>
);

export default DeedVisualDashboard;
export { Smartphone, Home };
