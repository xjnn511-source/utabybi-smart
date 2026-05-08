import { motion } from "framer-motion";
import { Award, CheckCircle2, FileText, MapPin, Ruler, ShieldCheck, Sparkles, User, type LucideIcon } from "lucide-react";

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
const line = "hsl(var(--deed-cyan) / 0.45)";

const valueOf = (v?: string) => (v && v.trim()) || "—";
const locationOf = (d: DeedVisualData) =>
  [d.city, d.district].filter(Boolean).join(" - ") || "—";

const Field = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div
    className="flex items-center gap-3 rounded-xl border px-3 py-3"
    style={{
      borderColor: line,
      background: "hsl(var(--deed-bg) / 0.6)",
      boxShadow: "0 0 14px hsl(var(--deed-cyan) / 0.1)",
    }}
  >
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
      style={{
        borderColor: "hsl(var(--deed-cyan) / 0.4)",
        background: "hsl(var(--deed-cyan) / 0.1)",
      }}
    >
      <Icon className="h-4 w-4" style={{ color: mint }} />
    </div>
    <div className="min-w-0 flex-1 text-right leading-tight">
      <p
        className="truncate text-[10px] font-bold sm:text-[11px]"
        style={{ color: muted, letterSpacing: "0.05em" }}
      >
        {label}
      </p>
      <p
        className="truncate text-[12px] font-black sm:text-[14px] md:text-[15px]"
        style={{ color: text, letterSpacing: "0.03em" }}
      >
        {value}
      </p>
    </div>
  </div>
);

const DeedCertificate = ({ deed }: { deed: DeedVisualData }) => (
  <div
    className="relative flex flex-col items-center overflow-hidden rounded-2xl border p-5"
    style={{
      background:
        "linear-gradient(140deg, hsl(var(--deed-panel)), hsl(var(--deed-bg)))",
      borderColor: "hsl(var(--deed-cyan) / 0.5)",
      boxShadow:
        "0 0 30px hsl(var(--deed-cyan) / 0.18), inset 0 0 30px hsl(var(--deed-cyan) / 0.08)",
    }}
  >
    <div
      className="pointer-events-none absolute inset-3 rounded-xl border"
      style={{ borderColor: "hsl(var(--deed-cyan) / 0.18)" }}
    />
    <div
      className="pointer-events-none absolute inset-0 opacity-40"
      style={{
        backgroundImage:
          "radial-gradient(circle at 30% 20%, hsl(var(--deed-cyan) / 0.18), transparent 35%)",
      }}
    />

    <div
      className="relative flex h-14 w-14 items-center justify-center rounded-full border"
      style={{
        color: mint,
        borderColor: "hsl(var(--deed-cyan) / 0.6)",
        background: "hsl(var(--deed-cyan) / 0.12)",
        boxShadow: "0 0 18px hsl(var(--deed-cyan) / 0.5)",
      }}
    >
      <Award className="h-7 w-7" />
    </div>

    <p
      className="relative mt-3 text-center text-[14px] font-black tracking-wide"
      style={{
        color: mint,
        textShadow: "0 0 10px hsl(var(--deed-cyan) / 0.5)",
        letterSpacing: "0.08em",
      }}
    >
      صك عقاري رقمي معتمد
    </p>

    <div className="relative mt-4 grid w-full grid-cols-2 gap-2 text-right">
      {[
        ["رقم الصك", valueOf(deed.deedNumber)],
        ["المالك", valueOf(deed.owner)],
        ["المساحة", deed.area ? `${deed.area} م²` : "—"],
        ["الموقع", locationOf(deed)],
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-lg border px-2 py-2"
          style={{
            borderColor: "hsl(var(--deed-cyan) / 0.25)",
            background: "hsl(var(--deed-bg) / 0.5)",
          }}
        >
          <p
            className="text-[9px] font-bold leading-tight sm:text-[10px]"
            style={{ color: muted, letterSpacing: "0.05em" }}
          >
            {label}
          </p>
          <p
            className="mt-1 truncate text-[11px] font-black leading-tight sm:text-[13px]"
            style={{ color: text, letterSpacing: "0.03em" }}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  </div>
);

const AnalysisBar = () => (
  <div
    className="relative flex items-center gap-3 overflow-hidden rounded-xl border px-4 py-3"
    style={{
      borderColor: "hsl(var(--deed-cyan) / 0.4)",
      background:
        "linear-gradient(90deg, hsl(var(--deed-cyan) / 0.08), hsl(var(--deed-bg) / 0.4))",
      boxShadow: "0 0 18px hsl(var(--deed-cyan) / 0.12)",
    }}
  >
    <Sparkles
      className="h-5 w-5 shrink-0"
      style={{ color: mint, filter: "drop-shadow(0 0 6px hsl(var(--deed-cyan)))" }}
    />
    <div className="min-w-0 flex-1">
      <p
        className="text-[10px] font-bold leading-tight sm:text-[11px]"
        style={{ color: muted, letterSpacing: "0.06em" }}
      >
        نتيجة تحليل عُتيبي ذكي Ai
      </p>
      <p
        className="mt-1 text-[12px] font-black leading-snug sm:text-[14px]"
        style={{ color: goldSoft, textShadow: "0 0 8px hsl(var(--deed-gold) / 0.35)", letterSpacing: "0.03em" }}
      >
        الصك مطابق ١٠٠٪ — البيانات سليمة وصالحة للاستخدام
      </p>
    </div>
    <motion.div
      className="hidden h-2 w-16 rounded-full sm:block"
      style={{ background: mint, boxShadow: `0 0 10px ${mint}` }}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity }}
    />
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto w-full max-w-[980px] overflow-hidden rounded-2xl border p-4 font-cairo notranslate sm:p-6"
    style={{
      background:
        "radial-gradient(circle at 18% 30%, hsl(var(--deed-cyan) / 0.14), transparent 40%), radial-gradient(circle at 80% 70%, hsl(217 91% 60% / 0.1), transparent 45%), linear-gradient(180deg, hsl(var(--deed-bg)), hsl(var(--deed-surface) / 0.96))",
      borderColor: "hsl(var(--deed-cyan) / 0.4)",
      boxShadow:
        "0 0 30px hsl(var(--deed-cyan) / 0.2), inset 0 0 50px hsl(var(--deed-cyan) / 0.05)",
    }}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-30"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--deed-cyan) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.06) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />

    {/* Header */}
    <header className="relative flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <ShieldCheck
          className="h-6 w-6"
          style={{
            color: gold,
            filter: "drop-shadow(0 0 8px hsl(var(--deed-gold) / 0.7))",
          }}
        />
        <h2
          className="text-[14px] font-black leading-tight sm:text-[18px] md:text-[20px]"
          style={{
            color: goldSoft,
            textShadow: "0 0 10px hsl(var(--deed-gold) / 0.5)",
            letterSpacing: "0.03em",
          }}
        >
          عُتيبي ذكي Ai · تحليل صك عقاري
        </h2>
      </div>
      <div
        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5"
        style={{
          color: text,
          borderColor: "hsl(var(--deed-cyan) / 0.4)",
          background: "hsl(var(--deed-bg) / 0.7)",
          boxShadow: "0 0 12px hsl(var(--deed-cyan) / 0.2)",
        }}
      >
        <CheckCircle2 className="h-4 w-4" style={{ color: mint }} />
        <span
          className="text-[11px] font-black sm:text-[12px]"
          style={{ letterSpacing: "0.04em" }}
        >
          محدّث وساري
        </span>
      </div>
    </header>

    {/* Body */}
    <div className="relative mt-4 grid gap-4 md:grid-cols-[1fr_1.1fr]">
      <DeedCertificate deed={deed} />

      <div className="flex flex-col gap-3">
        <Field icon={FileText} label="رقم الصك" value={valueOf(deed.deedNumber)} />
        <Field icon={User} label="اسم المالك" value={valueOf(deed.owner)} />
        <Field
          icon={Ruler}
          label="المساحة الإجمالية"
          value={deed.area ? `${deed.area} م²` : "—"}
        />
        <Field icon={MapPin} label="الموقع" value={locationOf(deed)} />
      </div>
    </div>

    {/* Analysis */}
    <div className="relative mt-4">
      <AnalysisBar />
    </div>

    {/* Footer */}
    <p
      className="relative mt-4 text-center text-[10px] font-bold sm:text-[11px]"
      style={{
        color: goldSoft,
        textShadow: "0 0 8px hsl(var(--deed-gold) / 0.4)",
        letterSpacing: "0.08em",
      }}
    >
      عُتيبي ذكي Ai · نحلل بالرؤية والصوت
    </p>
  </section>
);

export default DeedVisualDashboard;
