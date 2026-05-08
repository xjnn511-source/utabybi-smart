import { CheckCircle2, FileText, MapPin, Ruler, ShieldCheck, User, Home, Smartphone } from "lucide-react";

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
const text = "hsl(var(--deed-text))";
const muted = "hsl(var(--deed-muted))";
const cyan = "hsl(var(--deed-cyan))";

const v = (s?: string) => (s && s.trim()) || "—";
const loc = (d: DeedVisualData) => [d.city, d.district].filter(Boolean).join(" - ") || "—";

const Field = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) => (
  <div
    className="min-w-0 rounded-[8px] border p-3 sm:p-4"
    style={{
      background: "hsl(var(--deed-ink) / 0.58)",
      borderColor: "hsl(var(--deed-cyan) / 0.42)",
      boxShadow: "inset 0 0 18px hsl(var(--deed-cyan) / 0.08)",
    }}
  >
    <div className="mb-2 flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" style={{ color: cyan }} />
      <span className="text-[12px] font-black sm:text-sm" style={{ color: muted }}>
        {label}
      </span>
    </div>
    <p
      className="break-words text-right text-[18px] font-black leading-relaxed sm:text-[24px]"
      style={{ color: goldSoft, textShadow: `0 0 10px ${gold}55` }}
    >
      {value}
    </p>
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto w-full max-w-[980px] overflow-hidden rounded-[10px] border-2 p-4 font-cairo notranslate sm:p-5"
    style={{
      background: `linear-gradient(180deg, hsl(var(--deed-bg)) 0%, ${ink} 100%)`,
      borderColor: gold,
      boxShadow: `0 0 28px ${gold}33, inset 0 0 60px hsl(var(--deed-cyan) / 0.08)`,
    }}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-20"
      style={{
        backgroundImage: `linear-gradient(${gold}22 1px, transparent 1px), linear-gradient(90deg, ${gold}22 1px, transparent 1px)`,
        backgroundSize: "28px 28px",
      }}
    />

    <div className="relative z-10 space-y-4">
      <header className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "hsl(var(--deed-cyan) / 0.28)" }}>
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border"
            style={{ borderColor: gold, background: "hsl(var(--deed-cyan) / 0.08)" }}
          >
            <FileText className="h-6 w-6" style={{ color: goldSoft }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[20px] font-black leading-tight sm:text-[28px]" style={{ color: goldSoft }}>
              نتيجة تحليل الصك العقاري
            </h2>
            <p className="mt-1 text-[12px] font-bold sm:text-sm" style={{ color: muted }}>
              عُتيبي ذكي Ai — عرض واضح للبيانات المستخرجة
            </p>
          </div>
        </div>

        <div
          className="flex w-fit items-center gap-2 rounded-[8px] border px-3 py-2 text-[13px] font-black sm:text-sm"
          style={{ color: goldSoft, borderColor: gold, background: "hsl(var(--deed-ink) / 0.78)" }}
        >
          <CheckCircle2 className="h-4 w-4" style={{ color: "hsl(140 70% 55%)" }} />
          حالة الصك: محدّث وساري
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field icon={User} label="اسم المالك" value={v(deed.owner)} />
        <Field icon={FileText} label="رقم الصك" value={v(deed.deedNumber)} />
        <Field icon={Ruler} label="المساحة" value={deed.area ? `${deed.area} م²` : "—"} />
        <Field icon={MapPin} label="الموقع" value={loc(deed)} />
      </div>

      <div
        className="flex items-center justify-center gap-2 rounded-[8px] border px-3 py-3 text-center text-[13px] font-black sm:text-base"
        style={{ color: text, borderColor: "hsl(var(--deed-gold) / 0.48)", background: "hsl(var(--deed-cyan) / 0.06)" }}
      >
        <ShieldCheck className="h-5 w-5 shrink-0" style={{ color: gold }} />
        عُتيبي ذكي Ai · معالجة برمجية للوثائق العقارية
      </div>
    </div>
  </section>
);

export default DeedVisualDashboard;
export { Smartphone, Home };
