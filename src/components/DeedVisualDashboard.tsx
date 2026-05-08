import { CheckCircle2, FileText, Home, MapPin, Ruler, ShieldCheck, Smartphone, User } from "lucide-react";

export interface DeedVisualData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const value = (text?: string) => (text && text.trim() ? text.trim() : "—");
const locationValue = (deed: DeedVisualData) => [deed.city, deed.district].filter(Boolean).join(" - ") || "—";

const DeedPaper = ({ deed, compact = false }: { deed: DeedVisualData; compact?: boolean }) => {
  const fields = [
    { label: "رقم الصك", value: value(deed.deedNumber) },
    { label: "اسم المالك", value: value(deed.owner) },
    { label: "المساحة", value: deed.area ? `${deed.area} م²` : "—" },
    { label: "الموقع", value: locationValue(deed) },
  ];

  return (
    <article
      dir="rtl"
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[8px] border-2 p-[5%] font-cairo notranslate"
      style={{
        background:
          "linear-gradient(180deg, hsl(var(--deed-parchment)) 0%, hsl(var(--deed-parchment-deep)) 100%)",
        borderColor: "hsl(var(--deed-gold))",
        color: "hsl(var(--deed-ink))",
        boxShadow: "inset 0 0 22px hsl(var(--deed-ink) / 0.12)",
      }}
    >
      <div className="pointer-events-none absolute inset-[3%] rounded-[6px] border" style={{ borderColor: "hsl(var(--deed-gold) / 0.55)" }} />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-[3%]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <p className="text-[9px] font-black leading-tight sm:text-[12px] md:text-[15px]">وزارة العدل</p>
            <p className="text-[7px] font-black leading-tight opacity-75 sm:text-[10px] md:text-[12px]">وثيقة عقارية رقمية</p>
          </div>
          <div
            className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border sm:h-[42px] sm:w-[42px] md:h-[54px] md:w-[54px]"
            style={{ borderColor: "hsl(var(--deed-gold))", background: "hsl(var(--deed-gold) / 0.18)" }}
          >
            <ShieldCheck className="h-[58%] w-[58%]" />
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-[13px] font-black leading-tight sm:text-[18px] md:text-[24px]">حجة استحكام عقاري</h3>
          <div className="mx-auto mt-2 h-px w-[70%]" style={{ background: "hsl(var(--deed-gold))" }} />
        </div>

        <div className="grid min-h-0 flex-1 content-start gap-2 sm:gap-2.5">
          {fields.map((field) => (
            <div
              key={field.label}
              className="grid min-w-0 grid-cols-[34%_1fr] items-start gap-2 rounded-[6px] border px-2 py-1.5 sm:px-3 sm:py-2"
              style={{ borderColor: "hsl(var(--deed-ink) / 0.16)", background: "hsl(var(--deed-gold) / 0.1)" }}
            >
              <span className="whitespace-nowrap text-[8px] font-black leading-relaxed sm:text-[11px] md:text-[13px]">{field.label}</span>
              <span
                className="min-w-0 break-words text-right text-[8px] font-black leading-relaxed sm:text-[11px] md:text-[13px]"
                style={{ overflowWrap: "anywhere" }}
              >
                {field.value}
              </span>
            </div>
          ))}
        </div>

        {!compact && (
          <div className="flex shrink-0 items-end justify-between gap-3 pt-1">
            <p className="max-w-[62%] text-[7px] font-black leading-relaxed sm:text-[10px] md:text-[12px]">
              تم استخراج البيانات وعرضها برمجياً بواسطة عُتيبي ذكي Ai.
            </p>
            <p className="whitespace-nowrap text-[10px] font-black italic sm:text-[14px] md:text-[18px]">معتمد</p>
          </div>
        )}
      </div>
    </article>
  );
};

const PhonePreview = ({ deed }: { deed: DeedVisualData }) => (
  <div
    className="absolute bottom-[8%] right-[4%] hidden h-[48%] w-[21%] min-w-[112px] rounded-[18px] border p-[1.1%] sm:block"
    style={{ borderColor: "hsl(var(--deed-gold))", background: "hsl(var(--deed-ink))", boxShadow: "0 0 22px hsl(var(--deed-gold) / 0.28)" }}
  >
    <div className="h-full overflow-hidden rounded-[14px] border" style={{ borderColor: "hsl(var(--deed-gold) / 0.32)", background: "hsl(var(--deed-bg))" }}>
      <div className="flex h-[14%] items-center justify-between px-[8%] text-[6px] font-black sm:text-[8px]" style={{ color: "hsl(var(--deed-gold-soft))" }}>
        <Smartphone className="h-3 w-3" />
        <span className="whitespace-nowrap">عُتيبي ذكي</span>
      </div>
      <div className="mx-auto h-[70%] w-[84%]">
        <DeedPaper deed={deed} compact />
      </div>
      <div className="grid h-[16%] grid-cols-4 items-center px-[5%] text-[5px] font-black sm:text-[7px]" style={{ color: "hsl(var(--deed-muted))" }}>
        {[
          [Home, "الرئيسية"],
          [FileText, "برامج"],
          [CheckCircle2, "تحليل"],
          [User, "حسابي"],
        ].map(([Icon, label]) => {
          const NavIcon = Icon as typeof Home;
          return (
            <div key={label as string} className="flex flex-col items-center gap-1 text-center">
              <NavIcon className="h-3 w-3" />
              <span className="text-center leading-none">{label as string}</span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const Metric = ({ icon: Icon, label, value: metricValue }: { icon: typeof User; label: string; value: string }) => (
  <div
    className="min-w-0 rounded-[8px] border px-2.5 py-2 sm:px-3 sm:py-2.5"
    style={{ borderColor: "hsl(var(--deed-gold) / 0.55)", background: "hsl(var(--deed-ink) / 0.62)" }}
  >
    <div className="mb-1.5 flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" style={{ color: "hsl(var(--deed-cyan))" }} />
      <span className="whitespace-nowrap text-[9px] font-black sm:text-[11px]" style={{ color: "hsl(var(--deed-muted))" }}>
        {label}
      </span>
    </div>
    <p
      className="min-w-0 break-words text-[10px] font-black leading-relaxed sm:text-[13px] md:text-[15px]"
      style={{ color: "hsl(var(--deed-gold-soft))", overflowWrap: "anywhere" }}
    >
      {metricValue}
    </p>
  </div>
);

const MapPanel = () => (
  <div
    className="absolute bottom-[8%] left-[4%] hidden h-[26%] w-[28%] rounded-[8px] border md:block"
    style={{ borderColor: "hsl(var(--deed-gold) / 0.6)", background: "hsl(var(--deed-parchment) / 0.92)" }}
  >
    <svg viewBox="0 0 320 180" className="h-full w-full" aria-hidden="true">
      <path d="M15 58 C75 12 110 92 166 49 S270 22 304 85" fill="none" stroke="hsl(var(--deed-ink))" strokeWidth="4" strokeDasharray="10 8" opacity=".45" />
      <path d="M34 148 C98 96 138 168 196 106 S268 88 306 144" fill="none" stroke="hsl(var(--deed-gold))" strokeWidth="5" opacity=".7" />
      <circle cx="210" cy="96" r="20" fill="hsl(var(--deed-cyan) / 0.22)" stroke="hsl(var(--deed-cyan))" strokeWidth="4" />
      <path d="M0 36H320M0 72H320M0 108H320M0 144H320M64 0V180M128 0V180M192 0V180M256 0V180" stroke="hsl(var(--deed-ink))" strokeWidth="1" opacity=".18" />
    </svg>
  </div>
);

export const DeedVisualDashboard = ({ deed }: { deed: DeedVisualData }) => (
  <section
    dir="rtl"
    className="relative mx-auto aspect-[9/13] w-full min-w-[320px] max-w-[920px] overflow-hidden rounded-[10px] border-2 font-cairo notranslate sm:aspect-[16/10]"
    style={{
      background:
        "radial-gradient(circle at 50% 36%, hsl(var(--deed-surface)) 0%, hsl(var(--deed-navy)) 46%, hsl(var(--deed-bg)) 100%)",
      borderColor: "hsl(var(--deed-gold))",
      color: "hsl(var(--deed-text))",
      boxShadow: "0 0 34px hsl(var(--deed-gold) / 0.28), inset 0 0 70px hsl(var(--deed-cyan) / 0.08)",
    }}
  >
    <div
      className="pointer-events-none absolute inset-0 opacity-30"
      style={{
        backgroundImage:
          "linear-gradient(hsl(var(--deed-gold) / 0.12) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-gold) / 0.12) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    />

    <header className="absolute inset-x-[4%] top-[4%] z-20 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-start gap-2.5">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[8px] border sm:h-12 sm:w-12" style={{ borderColor: "hsl(var(--deed-gold))", background: "hsl(var(--deed-ink) / 0.55)" }}>
          <FileText className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: "hsl(var(--deed-gold-soft))" }} />
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 className="break-words text-[18px] font-black leading-tight sm:text-[26px] md:text-[34px]" style={{ color: "hsl(var(--deed-gold-soft))" }}>
            نتيجة تحليل الصك العقاري
          </h2>
          <p className="mt-1 break-words text-[10px] font-black leading-relaxed sm:text-[13px] md:text-[15px]" style={{ color: "hsl(var(--deed-muted))" }}>
            عُتيبي ذكي Ai — عرض البيانات المستخرجة بوضوح
          </p>
        </div>
      </div>
      <div
        className="shrink-0 rounded-[8px] border px-2.5 py-2 text-[10px] font-black leading-tight sm:px-3 sm:text-[12px] md:text-[14px]"
        style={{ borderColor: "hsl(var(--deed-gold))", background: "hsl(var(--deed-ink) / 0.82)", color: "hsl(var(--deed-gold-soft))" }}
      >
        حالة الصك: محدّث وساري
      </div>
    </header>

    <div className="absolute left-1/2 top-[24%] z-10 h-[46%] w-[76%] max-w-[620px] -translate-x-1/2 sm:top-[21%] sm:h-[58%] sm:w-[47%]">
      <DeedPaper deed={deed} />
    </div>

    <PhonePreview deed={deed} />
    <MapPanel />

    <div className="absolute inset-x-[4%] bottom-[5%] z-20 grid grid-cols-2 gap-2 sm:left-auto sm:right-[28%] sm:w-[38%] md:right-[35%] md:w-[30%]">
      <Metric icon={User} label="اسم المالك" value={value(deed.owner)} />
      <Metric icon={FileText} label="رقم الصك" value={value(deed.deedNumber)} />
      <Metric icon={Ruler} label="المساحة" value={deed.area ? `${deed.area} م²` : "—"} />
      <Metric icon={MapPin} label="الموقع" value={locationValue(deed)} />
    </div>
  </section>
);

export default DeedVisualDashboard;
export { Smartphone, Home };