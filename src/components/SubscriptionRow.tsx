import { Building2, Rocket, Crown, ChevronRight } from "lucide-react";

const plans = [
  {
    name: "باقة التراخيص الأساسية",
    price: "99",
    icon: Crown,
    features: [
      "ترخيص معالجة البيانات الهيكلية",
      "أدوات أتمتة التقارير المحدودة",
      "دعم فني برمجي أساسي",
    ],
    highlight: false,
    cta: "اشترك الآن",
  },
  {
    name: "باقة الأنظمة المتقدمة (Pro)",
    price: "299",
    icon: Building2,
    features: [
      "وصول كامل لمحركات الأتمتة",
      "ربط تقني متقدم (دعم API)",
      "معالجة دفعات البيانات الضخمة",
    ],
    highlight: true,
    badge: "احترافية",
    cta: "اشترك الآن",
  },
  {
    name: "باقة الحلول البرمجية (Enterprise)",
    price: "499",
    icon: Rocket,
    features: [
      "تطوير حلول برمجية مخصصة",
      "استضافة بيانات خاصة مشفرة",
      "دعم هندسي وتطوير متواصل",
    ],
    highlight: false,
    cta: "تواصل للتعاقد",
  },
];

const SubscriptionRow = () => {
  return (
    <div className="px-4 space-y-6">
      <h3 className="text-center text-sm font-black text-foreground mb-4">
        تراخيص استخدام الأدوات البرمجية
      </h3>
      <div className="grid grid-cols-1 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card-neon p-5 relative ${
              plan.highlight
                ? "border-accent border-2 shadow-[0_0_30px_hsl(var(--accent)/0.15)]"
                : ""
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-2.5 right-6 bg-accent text-accent-foreground text-[9px] px-3 py-0.5 rounded-full font-black">
                {plan.badge}
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <plan.icon className={`w-5 h-5 ${plan.highlight ? "text-accent" : "text-primary"}`} />
              <h4 className="text-xs font-black text-foreground">{plan.name}</h4>
            </div>
            <div className="mb-3">
              <span className={`text-2xl font-black ${plan.highlight ? "text-accent" : "text-primary"}`}>
                {plan.price}
              </span>
              <span className="text-[10px] text-muted-foreground mr-1">ر.س/شهر</span>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="text-[10px] text-muted-foreground flex items-center gap-2">
                  <ChevronRight className={`w-3 h-3 flex-shrink-0 ${plan.highlight ? "text-accent" : "text-primary"}`} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              className={`w-full h-10 rounded-xl text-[11px] font-bold transition-all ${
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
