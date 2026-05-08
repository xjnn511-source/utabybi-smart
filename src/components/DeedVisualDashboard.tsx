import { motion } from "framer-motion";
import { FileText, MapPin, Ruler, ScanLine, ShieldCheck, Smartphone, User } from "lucide-react";

export interface DeedVisualData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const cyan = "hsl(var(--deed-cyan))";
const cyanSoft = "hsl(var(--deed-cyan) / 0.66)";
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";
const bg = "hsl(var(--deed-bg))";
const panel = "hsl(var(--deed-panel) / 0.82)";

const valueOf = (value?: string) => value?.trim() || "—";
const locationOf = (deed: DeedVisualData) => [deed.city, deed.district].filter(Boolean).join(" - ") || "—";

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => {
  const summary = [
    { icon: FileText, label: "رقم الصك", value: valueOf(deed.deedNumber) },
    { icon: User, label: "المالك", value: valueOf(deed.owner) },
    { icon: Ruler, label: "المساحة", value: deed.area ? `${deed.area} م²` : "—" },
    { icon: MapPin, label: "الموقع", value: locationOf(deed) },
  ];

  return (
    <section
      className="relative overflow-hidden rounded-2xl border p-3 sm:p-4 font-cairo notranslate"
      dir="rtl"
      style={{
        background: "linear-gradient(135deg, hsl(var(--deed-bg)) 0%, hsl(var(--deed-navy)) 52%, hsl(var(--deed-bg)) 100%)",
        borderColor: "hsl(var(--deed-cyan) / 0.58)",
        boxShadow: "0 0 34px hsl(var(--deed-cyan) / 0.26), inset 0 0 48px hsl(var(--deed-cyan) / 0.09)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--deed-cyan) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.08) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--deed-cyan) / 0.92), transparent)", boxShadow: "0 0 20px hsl(var(--deed-cyan) / 0.75)" }} />

      <header className="relative mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3" style={{ borderColor: "hsl(var(--deed-cyan) / 0.25)" }}>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" style={{ color: cyan, filter: "drop-shadow(0 0 6px hsl(var(--deed-cyan)))" }} />
          <h2 className="text-sm font-black sm:text-lg" style={{ color: text, textShadow: "0 0 10px hsl(var(--deed-cyan) / 0.82)" }}>
            عُتيبي ذكي Ai: تحليل صك عقاري
          </h2>
        </div>
        <div className="rounded-md border px-3 py-1 text-xs font-black" style={{ background: "hsl(var(--deed-bg) / 0.78)", borderColor: "hsl(var(--deed-cyan) / 0.62)", color: cyan, boxShadow: "0 0 14px hsl(var(--deed-cyan) / 0.28)" }}>
          حالة الصك: محدّث وساري
        </div>
      </header>

      <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-[0.78fr_1.16fr_0.82fr]">
        <PhonePreview deed={deed} />
        <PulseDeed deed={deed} />
        <GeoPanel deed={deed} />
      </div>

      <div className="relative mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {summary.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex min-h-20 items-center gap-2 rounded-lg border p-2" style={{ background: "hsl(var(--deed-bg) / 0.76)", borderColor: "hsl(var(--deed-cyan) / 0.45)", boxShadow: "inset 0 0 13px hsl(var(--deed-cyan) / 0.1), 0 0 12px hsl(var(--deed-cyan) / 0.18)" }}>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border" style={{ background: "hsl(var(--deed-cyan) / 0.08)", borderColor: "hsl(var(--deed-cyan) / 0.55)", boxShadow: "0 0 10px hsl(var(--deed-cyan) / 0.3)" }}>
              <Icon className="h-5 w-5" style={{ color: cyan, filter: "drop-shadow(0 0 5px hsl(var(--deed-cyan) / 0.8))" }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold" style={{ color: cyanSoft }}>{label}</p>
              <p className="truncate text-xs font-black" style={{ color: text, textShadow: "0 0 7px hsl(var(--deed-cyan) / 0.58)" }}>{value}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

const TacticalPanel = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`relative overflow-hidden rounded-xl border p-3 ${className}`} style={{ background: panel, borderColor: "hsl(var(--deed-cyan) / 0.45)", boxShadow: "inset 0 0 22px hsl(var(--deed-cyan) / 0.09), 0 0 18px hsl(var(--deed-cyan) / 0.18)" }}>
    <p className="mb-2 text-[9px] font-black tracking-[0.28em]" style={{ color: cyanSoft }}>{label}</p>
    {children}
  </div>
);

const PhonePreview = ({ deed }: { deed: DeedVisualData }) => (
  <TacticalPanel label="01 · MOBILE EXTRACTION">
    <div className="mx-auto max-w-[220px] rounded-[2rem] border p-2" style={{ background: bg, borderColor: "hsl(var(--deed-cyan) / 0.35)", boxShadow: "0 0 20px hsl(var(--deed-cyan) / 0.24), inset 0 0 14px hsl(var(--deed-cyan) / 0.08)" }}>
      <div className="mx-auto mb-2 h-3 w-20 rounded-b-xl" style={{ background: "hsl(var(--deed-cyan) / 0.14)" }} />
      <MiniDeed deed={deed} small />
      <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[8px] font-bold" style={{ color: muted }}>
        <span>رئيسية</span><span>تحليل</span><span>صكوك</span><span>أتمتة</span>
      </div>
    </div>
  </TacticalPanel>
);

const PulseDeed = ({ deed }: { deed: DeedVisualData }) => (
  <TacticalPanel label="02 · LIVE DEED OCR" className="min-h-[340px]">
    <div className="absolute left-3 top-10 z-20 rounded-md border px-3 py-1 text-[11px] font-black" style={{ background: "hsl(var(--deed-bg) / 0.86)", borderColor: "hsl(var(--deed-cyan) / 0.62)", color: text, boxShadow: "0 0 16px hsl(var(--deed-cyan) / 0.28)" }}>
      100% Match Score
    </div>
    <MiniDeed deed={deed} />
    <div className="pointer-events-none absolute inset-x-2 top-1/2 z-30 -translate-y-1/2">
      <svg viewBox="0 0 520 110" className="h-24 w-full overflow-visible">
        <line x1="0" y1="55" x2="520" y2="55" stroke="hsl(var(--deed-cyan) / 0.32)" strokeWidth="1" />
        <motion.path
          d="M0 55 L145 55 L178 55 L205 15 L232 92 L255 34 L278 70 L305 55 L520 55"
          fill="none"
          stroke={cyan}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 9px hsl(var(--deed-cyan)))" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
    <DataCallouts deed={deed} />
  </TacticalPanel>
);

const MiniDeed = ({ deed, small = false }: { deed: DeedVisualData; small?: boolean }) => (
  <div className="relative mx-auto overflow-hidden rounded-lg border" style={{ minHeight: small ? 245 : 315, background: "radial-gradient(ellipse at top, hsl(var(--deed-surface) / 0.85), hsl(var(--deed-bg) / 0.92))", borderColor: "hsl(var(--deed-cyan) / 0.42)", boxShadow: "inset 0 0 35px hsl(var(--deed-cyan) / 0.08)" }}>
    <div className="absolute inset-4 border" style={{ borderColor: "hsl(var(--deed-cyan) / 0.28)", clipPath: "polygon(13% 0, 87% 0, 100% 15%, 100% 85%, 87% 100%, 13% 100%, 0 85%, 0 15%)" }} />
    <div className="relative z-10 p-4 text-center">
      <Smartphone className="mx-auto mb-2 h-7 w-7" style={{ color: cyan, filter: "drop-shadow(0 0 7px hsl(var(--deed-cyan)))" }} />
      <p className="text-[10px] font-black" style={{ color: text, textShadow: "0 0 8px hsl(var(--deed-cyan) / 0.58)" }}>صك عقاري رقمي</p>
      <div className="mt-3 space-y-2 text-right text-[10px] leading-relaxed sm:text-[11px]" style={{ color: text }}>
        <DeedLine label="رقم الصك" value={valueOf(deed.deedNumber)} />
        <DeedLine label="المالك" value={valueOf(deed.owner)} />
        <DeedLine label="المساحة" value={deed.area ? `${deed.area} م²` : "—"} />
        <DeedLine label="المدينة" value={valueOf(deed.city)} />
        <DeedLine label="الحي" value={valueOf(deed.district)} />
      </div>
      <p className="mt-4 text-[9px] font-bold" style={{ color: muted }}>تم استخراج البيانات وطباعتها داخل إطار الصك</p>
    </div>
  </div>
);

const DeedLine = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between gap-2 border-b pb-1" style={{ borderColor: "hsl(var(--deed-cyan) / 0.16)" }}>
    <span className="shrink-0 font-bold" style={{ color: cyanSoft }}>{label}</span>
    <span className="truncate font-black" style={{ color: text, textShadow: "0 0 5px hsl(var(--deed-cyan) / 0.42)" }}>{value}</span>
  </div>
);

const DataCallouts = ({ deed }: { deed: DeedVisualData }) => (
  <div className="pointer-events-none absolute inset-0 z-40 hidden sm:block">
    <Callout className="right-5 top-24" label="رقم الصك" value={valueOf(deed.deedNumber)} />
    <Callout className="right-8 bottom-16" label="المالك" value={valueOf(deed.owner)} />
    <Callout className="left-7 bottom-24" label="المساحة" value={deed.area ? `${deed.area} م²` : "—"} />
  </div>
);

const Callout = ({ label, value, className }: { label: string; value: string; className: string }) => (
  <div className={`absolute max-w-[180px] text-[10px] font-black ${className}`} style={{ color: text, textShadow: "0 0 7px hsl(var(--deed-cyan) / 0.75)" }}>
    <ScanLine className="mb-1 h-4 w-4" style={{ color: cyan }} />
    <span style={{ color: cyanSoft }}>{label}: </span>{value}
  </div>
);

const GeoPanel = ({ deed }: { deed: DeedVisualData }) => (
  <TacticalPanel label="03 · GEO LOCATOR">
    <div className="relative min-h-[315px] overflow-hidden rounded-lg border" style={{ background: "radial-gradient(ellipse at center, hsl(var(--deed-surface)) 0%, hsl(var(--deed-bg)) 78%)", borderColor: "hsl(var(--deed-cyan) / 0.4)" }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 330" preserveAspectRatio="none">
        <pattern id="deedMapGrid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path d="M25 0 L0 0 0 25" fill="none" stroke="hsl(var(--deed-cyan) / 0.15)" strokeWidth="0.7" />
        </pattern>
        <rect width="300" height="330" fill="url(#deedMapGrid)" />
        <path d="M0 110 Q115 70 300 138" stroke="hsl(var(--deed-cyan) / 0.72)" strokeWidth="1.4" fill="none" />
        <path d="M150 0 Q128 160 174 330" stroke="hsl(var(--deed-cyan) / 0.55)" strokeWidth="1.2" fill="none" />
        <path d="M22 270 L292 58" stroke="hsl(var(--deed-cyan) / 0.36)" strokeWidth="0.8" fill="none" strokeDasharray="5 5" />
        <path d="M65 85 Q112 60 133 105 Q121 155 74 132 Z" fill="hsl(var(--deed-cyan) / 0.08)" stroke="hsl(var(--deed-cyan) / 0.38)" />
        <path d="M176 176 Q231 160 244 206 Q214 245 174 222 Z" fill="hsl(var(--deed-cyan) / 0.07)" stroke="hsl(var(--deed-cyan) / 0.35)" />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <motion.div className="absolute -inset-5 rounded-full" style={{ background: "hsl(var(--deed-cyan) / 0.27)", filter: "blur(12px)" }} animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0.18, 0.55] }} transition={{ duration: 1.8, repeat: Infinity }} />
        <MapPin className="relative h-10 w-10" style={{ color: cyan, fill: cyan, filter: "drop-shadow(0 0 12px hsl(var(--deed-cyan)))" }} />
      </div>
      <div className="absolute bottom-3 left-3 right-3 rounded-lg border p-2 text-center" style={{ background: "hsl(var(--deed-bg) / 0.86)", borderColor: "hsl(var(--deed-cyan) / 0.5)", boxShadow: "0 0 12px hsl(var(--deed-cyan) / 0.28)" }}>
        <p className="text-[10px] font-bold" style={{ color: cyanSoft }}>الموقع</p>
        <p className="text-sm font-black" style={{ color: text, textShadow: "0 0 7px hsl(var(--deed-cyan) / 0.62)" }}>{locationOf(deed)}</p>
      </div>
    </div>
  </TacticalPanel>
);

export default DeedVisualDashboard;