import { ShieldCheck, ChevronRight } from "lucide-react";

const plans = [
  {
    name: "رخصة تجريبية",
    price: "0",
    priceSuffix: "ريال",
    features: ["معالجة بيانات محدودة"],
    highlight: false,
    cta: "ابدأ الآن",
  },
  {
    name: "باقة المكاتب",
    price: "99",
    priceSuffix: "ريال",
    features: ["ترخيص معالجة متقدم"],
    highlight: false,
    cta: "اختيار الباقة",
    accent: true,
  },
  {
    name: "باقة الشركات",
    price: "249",
    priceSuffix: "ريال",
    features: ["ربط تقني (API)"],
    highlight: true,
    badge: "موصى به",
    cta: "اشتراك الآن",
  },
  {
    name: "باقة المؤسسات",
    price: "عرض سعر",
    priceSuffix: "",
    features: ["حلول مخصصة"],
    highlight: false,
    cta: "تواصل معنا",
    accent: true,
  },
];

const SubscriptionRow = () => {
  return (
    <div className="px-4 space-y-6">
      {/* Digital Certification Box */}
      <div className="bg-primary/10 border border-primary/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 mb-6 shadow-[0_0_20px_hsl(var(--primary)/0.05)]">
        <div className="flex items-center gap-3 text-right">
          <ShieldCheck className="text-primary w-6 h-6 icon-glow" />
          <div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase">بيانات التوثيق الرقمي الرسمي</p>
            <p className="text-sm text-foreground font-black italic">برمجة وتطوير المواقع والأنظمة الذكية</p>
          </div>
        </div>
        <div className="bg-background px-4 py-2 rounded-xl border border-border">
          <span className="text-[11px] text-primary font-mono font-black">FL-822675484</span>
        </div>
      </div>

      {/* Plans Title */}
      <h3 className="text-center text-sm font-black text-foreground mb-4">
        تراخيص استخدام الأدوات البرمجية
      </h3>

      {/* 4-tier grid */}
      <div className="grid grid-cols-2 gap-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card-neon p-4 relative flex flex-col justify-between ${
              plan.highlight
                ? "border-accent border-2 shadow-[0_0_30px_hsl(var(--accent)/0.15)] z-10"
                : ""
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-2 right-4 bg-accent text-accent-foreground text-[7px] px-2.5 py-0.5 rounded-full font-black uppercase">
                {plan.badge}
              </div>
            )}
            <div>
              <p className={`text-[10px] font-black mb-1 uppercase italic ${plan.highlight ? "text-accent" : "text-primary"}`}>
                {plan.name}
              </p>
              <p className="text-lg font-bold text-foreground mb-3 italic">
                {plan.price} <span className="text-[9px] text-muted-foreground">{plan.priceSuffix}</span>
              </p>
              <ul className="space-y-1.5 mb-4">
                {plan.features.map((f) => (
                  <li key={f} className="text-[9px] text-muted-foreground flex items-center gap-1.5">
                    <ChevronRight className={`w-2.5 h-2.5 flex-shrink-0 ${plan.highlight ? "text-accent" : "text-primary"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <button
              className={`w-full h-9 rounded-xl text-[10px] font-bold transition-all ${
                plan.highlight
                  ? "bg-accent text-accent-foreground hover:brightness-110 shadow-[0_0_15px_hsl(var(--accent)/0.3)]"
                  : "bg-secondary border border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground text-center">
        وثيقة العمل الحر: FL-822675484 | المنصة الرسمية (SaaS) لحلول الذكاء الاصطناعي والمعالجة الرقمية
      </p>
    </div>
  );
};

export default SubscriptionRow;
