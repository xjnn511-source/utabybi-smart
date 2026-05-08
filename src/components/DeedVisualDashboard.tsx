import { motion } from "framer-motion";
import { CheckCircle2, FileText, MapPin, Ruler, ShieldCheck, Smartphone, User } from "lucide-react";

export interface DeedVisualData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const gold = "hsl(var(--deed-gold))";
const goldSoft = "hsl(var(--deed-gold-soft))";
const ink = "hsl(var(--deed-ink))";
const parchment = "hsl(var(--deed-parchment))";
const parchmentDeep = "hsl(var(--deed-parchment-deep))";
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";

const valueOf = (v?: string) => v?.trim() || "—";
const locationOf = (d: DeedVisualData) => [d.city, d.district].filter(Boolean).join(" - ") || "—";

// ===== Outer Dashboard =====
export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => {
  const summary = [
    { icon: FileText, label: "رقم الصك", value: valueOf(deed.deedNumber) },
    { icon: User, label: "المالك", value: valueOf(deed.owner) },
    { icon: Ruler, label: "المساحة", value: deed.area ? `${deed.area} م²` : "—" },
    { icon: MapPin, label: "الموقع", value: locationOf(deed) },
  ];

  return (
    <section
      dir="rtl"
      className="relative overflow-hidden rounded-2xl border p-3 sm:p-4 font-cairo notranslate"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, hsl(var(--deed-surface)) 0%, hsl(var(--deed-navy)) 55%, hsl(var(--deed-bg)) 100%)",
        borderColor: "hsl(var(--deed-gold) / 0.55)",
        boxShadow:
          "0 0 32px hsl(var(--deed-gold) / 0.18), inset 0 0 60px hsl(var(--deed-ink) / 0.55)",
      }}
    >
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--deed-gold) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-gold) / 0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Header */}
      <header
        className="relative mb-3 flex flex-wrap items-center justify-between gap-2 border-b pb-3"
        style={{ borderColor: "hsl(var(--deed-gold) / 0.32)" }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck
            className="h-5 w-5"
            style={{ color: gold, filter: "drop-shadow(0 0 6px hsl(var(--deed-gold)))" }}
          />
          <h2
            className="text-sm font-black sm:text-lg"
            style={{ color: goldSoft, textShadow: "0 0 10px hsl(var(--deed-gold) / 0.6)" }}
          >
            عُتيبي ذكي Ai: تحليل صك عقاري
          </h2>
        </div>
        <div
          className="flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-black"
          style={{
            background: "hsl(var(--deed-ink) / 0.7)",
            borderColor: "hsl(var(--deed-gold) / 0.6)",
            color: goldSoft,
            boxShadow: "0 0 12px hsl(var(--deed-gold) / 0.25)",
          }}
        >
          حالة الصك: محدّث وساري
          <CheckCircle2 className="h-3.5 w-3.5" style={{ color: gold }} />
        </div>
      </header>

      {/* Three panels */}
      <div className="relative grid grid-cols-1 gap-3 lg:grid-cols-[0.78fr_1.18fr_0.82fr]">
        <PhonePanel deed={deed} />
        <CenterDeedPanel deed={deed} />
        <MapPanel deed={deed} />
      </div>

      {/* Summary chips */}
      <div className="relative mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {summary.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex min-h-20 items-center gap-2 rounded-lg border p-2"
            style={{
              background: "hsl(var(--deed-ink) / 0.55)",
              borderColor: "hsl(var(--deed-gold) / 0.45)",
              boxShadow: "inset 0 0 14px hsl(var(--deed-gold) / 0.08), 0 0 12px hsl(var(--deed-gold) / 0.15)",
            }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border"
              style={{
                background: "hsl(var(--deed-gold) / 0.1)",
                borderColor: "hsl(var(--deed-gold) / 0.55)",
                boxShadow: "0 0 10px hsl(var(--deed-gold) / 0.28)",
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: gold, filter: "drop-shadow(0 0 5px hsl(var(--deed-gold) / 0.8))" }}
              />
            </div>
            <div className="min-w-0 select-text">
              <p className="text-[10px] font-bold" style={{ color: muted }}>
                {label}
              </p>
              <p
                className="truncate text-xs font-black"
                style={{ color: text, textShadow: "0 0 6px hsl(var(--deed-gold) / 0.4)" }}
              >
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ===== Reusable tactical panel =====
const TacticalPanel = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`relative overflow-hidden rounded-xl border p-3 ${className}`}
    style={{
      background: "hsl(var(--deed-panel) / 0.85)",
      borderColor: "hsl(var(--deed-gold) / 0.42)",
      boxShadow: "inset 0 0 24px hsl(var(--deed-ink) / 0.6), 0 0 16px hsl(var(--deed-gold) / 0.12)",
    }}
  >
    <p
      className="mb-2 text-[9px] font-black tracking-[0.28em]"
      style={{ color: goldSoft }}
    >
      {label}
    </p>
    {children}
  </div>
);

// ===== Parchment deed paper (the gold/cream card) =====
const ParchmentDeed = ({ deed, compact = false }: { deed: DeedVisualData; compact?: boolean }) => (
  <div
    className="relative mx-auto overflow-hidden"
    style={{
      width: "100%",
      maxWidth: compact ? 200 : 320,
      minHeight: compact ? 240 : 300,
      background: `linear-gradient(135deg, ${parchment} 0%, ${parchmentDeep} 100%)`,
      borderRadius: 8,
      boxShadow:
        "inset 0 0 0 2px hsl(var(--deed-gold) / 0.7), inset 0 0 0 4px hsl(var(--deed-parchment-deep)), inset 0 0 28px hsl(var(--deed-ink) / 0.18), 0 6px 22px hsl(var(--deed-ink) / 0.6)",
    }}
  >
    {/* Ornate corners */}
    {(["tl", "tr", "bl", "br"] as const).map((c) => (
      <div
        key={c}
        className="absolute h-5 w-5"
        style={{
          top: c.startsWith("t") ? 6 : "auto",
          bottom: c.startsWith("b") ? 6 : "auto",
          left: c.endsWith("l") ? 6 : "auto",
          right: c.endsWith("r") ? 6 : "auto",
          borderColor: "hsl(var(--deed-gold))",
          borderStyle: "solid",
          borderTopWidth: c.startsWith("t") ? 2 : 0,
          borderBottomWidth: c.startsWith("b") ? 2 : 0,
          borderLeftWidth: c.endsWith("l") ? 2 : 0,
          borderRightWidth: c.endsWith("r") ? 2 : 0,
        }}
      />
    ))}

    {/* Calligraphy header band */}
    <div
      className="relative mx-3 mt-3 rounded-md py-1.5 text-center"
      style={{
        background: "linear-gradient(180deg, hsl(var(--deed-ink)) 0%, hsl(var(--deed-navy)) 100%)",
        boxShadow: "0 0 0 1px hsl(var(--deed-gold) / 0.6) inset",
      }}
    >
      <p
        className="text-[10px] font-black tracking-wider sm:text-xs"
        style={{
          color: goldSoft,
          textShadow: "0 0 6px hsl(var(--deed-gold) / 0.7)",
          fontFamily: "'Aref Ruqaa', 'Cairo', serif",
        }}
      >
        ﷽
      </p>
      <p
        className="text-[11px] font-black sm:text-sm"
        style={{
          color: gold,
          textShadow: "0 0 7px hsl(var(--deed-gold) / 0.8)",
        }}
      >
        صك عقاري رقمي
      </p>
    </div>

    {/* Body */}
    <div className="select-text px-4 py-3 text-right" style={{ color: text, fontWeight: 800 }}>
      <DeedRow label="رقم الصك" value={valueOf(deed.deedNumber)} />
      <DeedRow label="المالك" value={valueOf(deed.owner)} />
      <DeedRow label="المساحة" value={deed.area ? `${deed.area} م²` : "—"} />
      <DeedRow label="المدينة" value={valueOf(deed.city)} />
      <DeedRow label="الحي" value={valueOf(deed.district)} />

      <p
        className="mt-3 border-t pt-2 text-center text-[9px]"
        style={{ borderColor: "hsl(var(--deed-gold) / 0.25)", color: muted }}
      >
        تم استخراج البيانات وطباعتها داخل إطار الصك
      </p>
    </div>
  </div>
);

const DeedRow = ({ label, value }: { label: string; value: string }) => (
  <div
    className="flex items-center justify-between gap-2 border-b py-1 text-[11px] sm:text-xs"
    style={{ borderColor: "hsl(var(--deed-gold) / 0.18)" }}
  >
    <span style={{ color: muted, fontWeight: 700 }}>{label}</span>
    <span className="truncate" style={{ color: text, fontWeight: 900, textShadow: "0 0 5px hsl(var(--deed-gold) / 0.4)" }}>
      {value}
    </span>
  </div>
);

// ===== Left: phone preview =====
const PhonePanel = ({ deed }: { deed: DeedVisualData }) => (
  <TacticalPanel label="01 · MOBILE EXTRACTION">
    <div
      className="mx-auto rounded-[2rem] border p-2"
      style={{
        maxWidth: 230,
        background: "hsl(var(--deed-bg))",
        borderColor: "hsl(var(--deed-gold) / 0.4)",
        boxShadow: "0 0 22px hsl(var(--deed-gold) / 0.22), inset 0 0 14px hsl(var(--deed-ink))",
      }}
    >
      <div
        className="mx-auto mb-2 h-3 w-20 rounded-b-xl"
        style={{ background: "hsl(var(--deed-gold) / 0.18)" }}
      />
      <ParchmentDeed deed={deed} compact />
      <div
        className="mt-2 grid grid-cols-4 gap-1 text-center text-[8px] font-bold"
        style={{ color: muted }}
      >
        <span>الرئيسية</span>
        <span>الرادار</span>
        <span>تحليل</span>
        <span>المحرر</span>
      </div>
    </div>
  </TacticalPanel>
);

// ===== Center: live deed with pulse =====
const CenterDeedPanel = ({ deed }: { deed: DeedVisualData }) => (
  <TacticalPanel label="02 · LIVE DEED OCR" className="min-h-[340px]">
    <div
      className="absolute right-3 top-9 z-30 rounded-md border px-3 py-1 text-[11px] font-black"
      style={{
        background: "hsl(var(--deed-ink) / 0.85)",
        borderColor: "hsl(var(--deed-gold) / 0.65)",
        color: goldSoft,
        boxShadow: "0 0 14px hsl(var(--deed-gold) / 0.3)",
      }}
    >
      ✓ 100% Match Score
    </div>

    <ParchmentDeed deed={deed} />

    {/* Pulse waveform overlay */}
    <div className="pointer-events-none absolute inset-x-2 top-1/2 z-20 -translate-y-1/2">
      <svg viewBox="0 0 520 110" className="h-24 w-full overflow-visible">
        <line
          x1="0"
          y1="55"
          x2="520"
          y2="55"
          stroke="hsl(var(--deed-gold) / 0.42)"
          strokeWidth="1"
        />
        <motion.path
          d="M0 55 L150 55 L182 55 L208 18 L234 92 L258 32 L282 70 L308 55 L520 55"
          fill="none"
          stroke={gold}
          strokeWidth="3"
          strokeLinecap="round"
          style={{ filter: "drop-shadow(0 0 10px hsl(var(--deed-gold)))" }}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  </TacticalPanel>
);

// ===== Right: map locator =====
const MapPanel = ({ deed }: { deed: DeedVisualData }) => (
  <TacticalPanel label="03 · GEO LOCATOR">
    <div
      className="relative min-h-[300px] overflow-hidden rounded-lg border"
      style={{
        background:
          "radial-gradient(ellipse at center, hsl(var(--deed-surface)) 0%, hsl(var(--deed-bg)) 78%)",
        borderColor: "hsl(var(--deed-gold) / 0.42)",
      }}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 330" preserveAspectRatio="none">
        <pattern id="deedMapGrid" width="25" height="25" patternUnits="userSpaceOnUse">
          <path
            d="M25 0 L0 0 0 25"
            fill="none"
            stroke="hsl(var(--deed-gold) / 0.14)"
            strokeWidth="0.7"
          />
        </pattern>
        <rect width="300" height="330" fill="url(#deedMapGrid)" />
        <path
          d="M0 110 Q115 70 300 138"
          stroke="hsl(var(--deed-gold) / 0.6)"
          strokeWidth="1.4"
          fill="none"
        />
        <path
          d="M150 0 Q128 160 174 330"
          stroke="hsl(var(--deed-gold) / 0.45)"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M22 270 L292 58"
          stroke="hsl(var(--deed-gold) / 0.32)"
          strokeWidth="0.8"
          fill="none"
          strokeDasharray="5 5"
        />
        <path
          d="M65 85 Q112 60 133 105 Q121 155 74 132 Z"
          fill="hsl(var(--deed-gold) / 0.07)"
          stroke="hsl(var(--deed-gold) / 0.32)"
        />
        <path
          d="M176 176 Q231 160 244 206 Q214 245 174 222 Z"
          fill="hsl(var(--deed-gold) / 0.07)"
          stroke="hsl(var(--deed-gold) / 0.32)"
        />
      </svg>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <motion.div
          className="absolute -inset-5 rounded-full"
          style={{ background: "hsl(var(--deed-gold) / 0.3)", filter: "blur(12px)" }}
          animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0.18, 0.55] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        />
        <MapPin
          className="relative h-10 w-10"
          style={{
            color: gold,
            fill: gold,
            filter: "drop-shadow(0 0 12px hsl(var(--deed-gold)))",
          }}
        />
      </div>
      <div
        className="absolute bottom-3 left-3 right-3 select-text rounded-lg border p-2 text-center"
        style={{
          background: "hsl(var(--deed-ink) / 0.85)",
          borderColor: "hsl(var(--deed-gold) / 0.5)",
          boxShadow: "0 0 12px hsl(var(--deed-gold) / 0.28)",
        }}
      >
        <p className="text-[10px] font-bold" style={{ color: muted }}>
          الموقع
        </p>
        <p
          className="text-sm font-black"
          style={{ color: goldSoft, textShadow: "0 0 7px hsl(var(--deed-gold) / 0.6)" }}
        >
          {locationOf(deed)}
        </p>
      </div>
    </div>
  </TacticalPanel>
);

export default DeedVisualDashboard;

// Re-export Smartphone to keep backward compatibility (unused but harmless)
export { Smartphone };
