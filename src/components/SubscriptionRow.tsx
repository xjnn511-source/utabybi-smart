import { Crown, Building2, Rocket, Gift, Gem } from "lucide-react";

const plans = [
  {
    name: "تجربة مجانية",
    price: "0",
    icon: Gift,
    features: ["معالجة بيانات تجريبي", "نموذج فيديو Ai واحد", "معالجة نصية (150 حرف)"],
    highlight: false,
    isFree: true,
  },
  {
    name: "الرخصة التقنية الأساسية",
    price: "99",
    icon: Crown,
    features: ["معالجة مستندات Ai", "10 خدمات تقنية شهرياً", "2,000 حرف/شهر", "محرك الذكاء الاصطناعي"],
    highlight: false,
    isFree: false,
  },
  {
    name: "نظام معالجة البيانات المتقدم",
    price: "299",
    icon: Building2,
    features: ["معالجة الوسائط التقنية", "30 خدمة تقنية شهرياً", "15,000 حرف/شهر", "أنظمة أتمتة منطقية"],
    highlight: true,
    isFree: false,
  },
  {
    name: "باقة الأنظمة المتقدمة Pro",
    price: "499",
    icon: Rocket,
    features: ["جميع الحلول التقنية بلا حدود", "100 خدمة شهرياً", "40,000 حرف/شهر", "دعم فني متقدم"],
    highlight: false,
    isFree: false,
    isPro: true,
  },
];

const SubscriptionRow = () => {
  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card-neon p-4 min-w-[185px] snap-center flex flex-col ${
              plan.highlight ? "border-primary border-2" : ""
            } ${plan.isFree ? "border-green-500/50" : ""} ${"isPro" in plan && plan.isPro ? "border-amber-500/50" : ""}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                plan.isFree ? "bg-green-100" : "isPro" in plan && plan.isPro ? "bg-amber-100" : "bg-primary/10"
              }`}>
                <plan.icon className={`w-3.5 h-3.5 ${
                  plan.isFree ? "text-green-600" : "isPro" in plan && plan.isPro ? "text-amber-600" : "text-primary"
                }`} strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-foreground">{plan.name}</h3>
            </div>

            <div className="mb-2">
              <span className={`text-xl font-bold ${
                plan.isFree ? "text-green-600" : "isPro" in plan && plan.isPro ? "text-amber-600" : "text-primary"
              }`}>{plan.price}</span>
              <span className="text-[10px] text-muted-foreground mr-1">
                {plan.isFree ? "مجاناً" : "ر.س/شهر"}
              </span>
            </div>

            <ul className="space-y-1 mb-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full inline-block ${
                    plan.isFree ? "bg-green-500" : "isPro" in plan && plan.isPro ? "bg-amber-500" : "bg-primary"
                  }`} />
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              plan.isFree
                ? "bg-green-600 text-white hover:bg-green-700"
                : plan.highlight
                  ? "btn-neon"
                  : "isPro" in plan && plan.isPro
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-secondary border border-border text-foreground hover:border-primary hover:text-primary"
            }`}>
              {plan.isFree ? "ابدأ مجاناً" : "اشترك الآن"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-[9px] text-muted-foreground text-center px-6 pb-3">
        وثيقة العمل الحر: FL-822675484 | المنصة الرسمية (SaaS) لحلول الذكاء الاصطناعي والمعالجة الرقمية
      </p>
    </>
  );
};

export default SubscriptionRow;
