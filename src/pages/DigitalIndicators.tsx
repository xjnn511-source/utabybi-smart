import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, User, Ruler, FileText, CheckCircle2, Radio } from "lucide-react";

const CYAN = "#00FFFF";

interface DeedData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const DigitalIndicators = () => {
  const navigate = useNavigate();
  const [deed, setDeed] = useState<DeedData>({
    deedNumber: "",
    area: "",
    owner: "",
    city: "",
    district: "",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("utaybi.deedData");
      if (raw) setDeed(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden font-cairo notranslate"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse at center, #00131f 0%, #000508 60%, #000 100%)",
        color: "#e2e8f0",
      }}
    >
      {/* grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `linear-gradient(${CYAN}10 1px, transparent 1px), linear-gradient(90deg, ${CYAN}10 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Header */}
      <header
        className="relative px-4 py-4 flex items-center justify-between border-b"
        style={{ borderColor: `${CYAN}30`, background: "rgba(0,8,20,0.7)", backdropFilter: "blur(8px)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
          style={{ background: `${CYAN}10`, border: `1px solid ${CYAN}50`, color: CYAN }}
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>
        <div className="text-center flex-1">
          <h1 className="text-base md:text-lg font-extrabold" style={{ color: CYAN, textShadow: `0 0 12px ${CYAN}` }}>
            عُتيبي ذكي Ai: تحليل صك عقاري
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: `${CYAN}aa` }}>
            نظام برمجي مؤتمت — Tactical Real-Estate Interface
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
          style={{ background: `${CYAN}10`, border: `1px solid ${CYAN}60`, color: CYAN, boxShadow: `0 0 12px ${CYAN}40` }}
        >
          <Radio className="w-3 h-3 animate-pulse" />
          LIVE
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-3 py-5 space-y-4">
        {/* Status banner */}
        <div
          className="mx-auto w-fit px-5 py-2 rounded-full flex items-center gap-2"
          style={{
            background: "rgba(0,8,20,0.8)",
            border: `1.5px solid ${CYAN}`,
            boxShadow: `0 0 25px ${CYAN}55, inset 0 0 12px ${CYAN}30`,
          }}
        >
          <CheckCircle2 className="w-4 h-4" style={{ color: CYAN, filter: `drop-shadow(0 0 4px ${CYAN})` }} />
          <span className="text-xs font-extrabold" style={{ color: "#fff", textShadow: `0 0 6px ${CYAN}` }}>
            حالة الصك: محدّث وساري
          </span>
          <span className="text-[10px] font-bold mr-2" style={{ color: CYAN }}>100% Match Score</span>
        </div>

        {/* Three Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* LEFT: Leather-framed deed */}
          <Panel label="01 · DIGITAL DEED">
            <LeatherDeed deed={deed} />
          </Panel>

          {/* CENTER: Pulse waveform deed-like card */}
          <Panel label="02 · PULSE MATCH">
            <PulseCard deed={deed} />
          </Panel>

          {/* RIGHT: Map */}
          <Panel label="03 · GEO LOCATOR">
            <MapCard deed={deed} />
          </Panel>
        </div>

        {/* Bottom 4 icon summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {[
            { icon: FileText, label: "رقم الصك", value: deed.deedNumber || "—" },
            { icon: User, label: "المالك", value: deed.owner || "—" },
            { icon: Ruler, label: "المساحة", value: deed.area ? `${deed.area} m²` : "—" },
            {
              icon: MapPin,
              label: "الموقع",
              value: [deed.city, deed.district].filter(Boolean).join(" - ") || "—",
            },
          ].map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl p-3 flex items-center gap-3"
              style={{
                background: "rgba(0,8,20,0.85)",
                border: `1px solid ${CYAN}60`,
                boxShadow: `inset 0 0 14px ${CYAN}15, 0 0 12px ${CYAN}25`,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${CYAN}15`, border: `1px solid ${CYAN}80`, boxShadow: `0 0 10px ${CYAN}50` }}
              >
                <Icon className="w-4 h-4" style={{ color: CYAN, filter: `drop-shadow(0 0 4px ${CYAN})` }} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px]" style={{ color: `${CYAN}aa` }}>{label}</p>
                <p className="text-xs font-extrabold truncate" style={{ color: "#fff", textShadow: `0 0 6px ${CYAN}` }}>
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className="rounded-xl p-3 flex items-center justify-center text-[10px] mt-2"
          style={{ background: "rgba(0,8,20,0.6)", border: `1px solid ${CYAN}25` }}
        >
          <span style={{ color: `${CYAN}aa` }}>
            عُتيبي ذكي Ai: نحلل بالرؤية والصوت — معالجة برمجية مؤتمتة
          </span>
        </div>
      </main>
    </div>
  );
};

const Panel = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div
    className="relative rounded-2xl p-3"
    style={{
      background: "rgba(0,8,20,0.75)",
      border: `1.5px solid ${CYAN}80`,
      boxShadow: `0 0 25px ${CYAN}30, inset 0 0 25px ${CYAN}10`,
    }}
  >
    {[
      { top: 4, left: 4, b: "border-t-2 border-l-2" },
      { top: 4, right: 4, b: "border-t-2 border-r-2" },
      { bottom: 4, left: 4, b: "border-b-2 border-l-2" },
      { bottom: 4, right: 4, b: "border-b-2 border-r-2" },
    ].map((c, i) => (
      <div key={i} className={`absolute w-4 h-4 ${c.b}`} style={{ ...c, borderColor: CYAN, boxShadow: `0 0 6px ${CYAN}` }} />
    ))}
    <p className="text-[9px] font-bold tracking-[0.3em] mb-2" style={{ color: `${CYAN}aa` }}>{label}</p>
    {children}
  </div>
);

/* ---------- LEATHER DEED (left) ---------- */
const LeatherDeed = ({ deed }: { deed: DeedData }) => (
  <div
    className="rounded-lg p-3 relative overflow-hidden"
    style={{
      background:
        "radial-gradient(ellipse at top, #1a2a18 0%, #0a1a14 60%, #000a08 100%)",
      border: `2px solid ${CYAN}80`,
      boxShadow: `0 0 18px ${CYAN}50, inset 0 0 30px rgba(0,0,0,0.6)`,
    }}
  >
    {/* inner ornate frame */}
    <div
      className="rounded-md p-3 relative"
      style={{
        border: `1px dashed ${CYAN}60`,
        background:
          "linear-gradient(180deg, rgba(0,30,40,0.35) 0%, rgba(0,8,12,0.55) 100%)",
        minHeight: 320,
      }}
    >
      {/* Saudi emblem */}
      <div className="flex justify-center mb-2">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle, ${CYAN}25 0%, transparent 70%)`,
            border: `1.5px solid ${CYAN}`,
            boxShadow: `0 0 14px ${CYAN}`,
          }}
        >
          <svg viewBox="0 0 64 64" className="w-7 h-7" fill="none" stroke={CYAN} strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${CYAN})` }}>
            <path d="M32 50 L32 28" />
            <path d="M32 28 C 22 22, 16 24, 14 30" />
            <path d="M32 28 C 42 22, 48 24, 50 30" />
            <path d="M32 28 C 26 18, 22 16, 18 18" />
            <path d="M32 28 C 38 18, 42 16, 46 18" />
            <path d="M32 28 C 30 20, 32 14, 32 12" />
            <path d="M14 54 L30 42" />
            <path d="M50 54 L34 42" />
          </svg>
        </div>
      </div>
      <p className="text-center text-[11px] font-extrabold tracking-widest mb-2"
         style={{ color: "#fff", textShadow: `0 0 8px ${CYAN}` }}>
        حصة العقارات العقارية
      </p>
      <div className="space-y-1.5 text-[11px] leading-relaxed" style={{ color: "#e6f9ff" }}>
        <Row k="رقم الصك" v={deed.deedNumber || "—"} />
        <Row k="نوع الصك" v="ملكية" />
        <Row k="المالك" v={deed.owner || "—"} />
        <Row k="المساحة" v={deed.area ? `${deed.area} م²` : "—"} />
        <Row k="الحي" v={deed.district || "—"} />
        <Row k="المدينة" v={deed.city || "—"} />
        <Row k="الموقع" v={[deed.city, deed.district].filter(Boolean).join(" — ") || "—"} />
      </div>
      <p className="mt-3 text-center text-[10px]" style={{ color: `${CYAN}cc` }}>
        والسلام يوم الإصدار
      </p>
    </div>
  </div>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex items-baseline gap-2">
    <span className="text-[10px] font-bold" style={{ color: `${CYAN}cc` }}>{k}:</span>
    <span className="font-extrabold truncate" style={{ color: "#fff", textShadow: `0 0 4px ${CYAN}` }}>{v}</span>
  </div>
);

/* ---------- PULSE CARD (center) ---------- */
const PulseCard = ({ deed }: { deed: DeedData }) => (
  <div
    className="rounded-lg p-3 relative overflow-hidden"
    style={{
      background:
        "radial-gradient(ellipse at top, #08222e 0%, #03121a 60%, #000508 100%)",
      border: `2px solid ${CYAN}80`,
      boxShadow: `0 0 18px ${CYAN}50, inset 0 0 30px rgba(0,0,0,0.6)`,
      minHeight: 360,
    }}
  >
    <div
      className="rounded-md p-3 relative"
      style={{
        border: `1px dashed ${CYAN}60`,
        background: "linear-gradient(180deg, rgba(0,30,45,0.45) 0%, rgba(0,8,15,0.7) 100%)",
        minHeight: 340,
      }}
    >
      <p className="text-center text-[11px] font-extrabold tracking-widest mb-2"
         style={{ color: "#fff", textShadow: `0 0 8px ${CYAN}` }}>
        حصة العقارات العقارية
      </p>

      {/* deed text */}
      <div className="space-y-1 text-[10px]" style={{ color: "#e6f9ff" }}>
        <p>رقم الصك: <span className="font-bold" style={{ color: "#fff" }}>{deed.deedNumber || "—"}</span></p>
        <p>المالك: <span className="font-bold">{deed.owner || "—"}</span></p>
        <p>المساحة: <span className="font-bold">{deed.area ? `${deed.area} م²` : "—"}</span></p>
        <p>المدينة: <span className="font-bold">{deed.city || "—"}</span></p>
        <p>الحي: <span className="font-bold">{deed.district || "—"}</span></p>
      </div>

      {/* pulse waveform */}
      <div className="my-3 relative h-20 rounded-md overflow-hidden"
           style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${CYAN}40` }}>
        <svg viewBox="0 0 300 80" className="w-full h-full">
          <defs>
            <linearGradient id="pulseGrad" x1="0%" x2="100%">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0" />
              <stop offset="50%" stopColor={CYAN} stopOpacity="1" />
              <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="40" x2="300" y2="40" stroke={`${CYAN}40`} strokeWidth="0.5" />
          <motion.path
            d="M 0 40 L 80 40 L 110 40 L 125 12 L 140 68 L 155 25 L 170 55 L 185 40 L 220 40 L 300 40"
            fill="none"
            stroke="url(#pulseGrad)"
            strokeWidth="2.2"
            style={{ filter: `drop-shadow(0 0 6px ${CYAN})` }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
        <div className="absolute top-1 right-2 text-[9px] font-bold" style={{ color: CYAN }}>
          100% MATCH
        </div>
      </div>

      <p className="text-center text-[10px]" style={{ color: `${CYAN}cc` }}>
        والسلام يوم الإصدار
      </p>
    </div>
  </div>
);

/* ---------- MAP CARD (right) ---------- */
const MapCard = ({ deed }: { deed: DeedData }) => (
  <div
    className="rounded-lg p-3 relative overflow-hidden"
    style={{
      background: "radial-gradient(ellipse at center, #002535 0%, #000a12 70%, #000508 100%)",
      border: `2px solid ${CYAN}80`,
      boxShadow: `0 0 18px ${CYAN}50, inset 0 0 30px rgba(0,0,0,0.6)`,
      minHeight: 360,
    }}
  >
    <div className="relative h-[320px] rounded-md overflow-hidden" style={{ border: `1px dashed ${CYAN}60` }}>
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 320" preserveAspectRatio="none">
        <defs>
          <pattern id="mg" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke={`${CYAN}25`} strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="300" height="320" fill="url(#mg)" />
        {/* roads */}
        <path d="M 0 100 Q 120 60 300 130" stroke={`${CYAN}90`} strokeWidth="1.4" fill="none" />
        <path d="M 150 0 Q 130 160 170 320" stroke={`${CYAN}80`} strokeWidth="1.2" fill="none" />
        <path d="M 30 250 L 290 60" stroke={`${CYAN}50`} strokeWidth="0.8" fill="none" strokeDasharray="4 4" />
        <path d="M 0 220 L 300 240" stroke={`${CYAN}40`} strokeWidth="0.6" fill="none" />
        {/* district shapes */}
        <path d="M 70 80 Q 110 60 130 100 Q 120 150 75 130 Z" fill={`${CYAN}15`} stroke={`${CYAN}55`} strokeWidth="0.7" />
        <path d="M 180 170 Q 230 160 240 200 Q 215 240 175 220 Z" fill={`${CYAN}10`} stroke={`${CYAN}45`} strokeWidth="0.7" />
        <path d="M 40 200 Q 90 195 95 235 Q 60 250 35 235 Z" fill={`${CYAN}10`} stroke={`${CYAN}40`} strokeWidth="0.6" />
      </svg>

      {/* glowing pin */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="absolute -inset-4 rounded-full"
          style={{ background: `${CYAN}50`, filter: "blur(10px)" }}
        />
        <MapPin className="w-9 h-9 relative" style={{ color: CYAN, fill: CYAN, filter: `drop-shadow(0 0 12px ${CYAN})` }} />
      </div>

      {/* small badge */}
      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-extrabold"
           style={{ background: "rgba(0,8,12,0.85)", border: `1px solid ${CYAN}60`, color: CYAN }}>
        55
      </div>

      {/* coords label */}
      <div
        className="absolute bottom-2 left-2 right-2 px-2 py-1.5 rounded text-center"
        style={{ background: "rgba(0,8,20,0.9)", border: `1px solid ${CYAN}70`, boxShadow: `0 0 10px ${CYAN}40` }}
      >
        <p className="text-[9px]" style={{ color: `${CYAN}cc` }}>الموقع</p>
        <p className="text-xs font-extrabold" style={{ color: "#fff", textShadow: `0 0 6px ${CYAN}` }}>
          {[deed.city, deed.district].filter(Boolean).join(" - ") || "—"}
        </p>
      </div>
    </div>
  </div>
);

export default DigitalIndicators;
