import { Crown, Building2, Rocket, Gift, Gem } from "lucide-react";

const plans = [
  {
    name: "تجربة مجانية",
    price: "0",
    icon: Gift,
    features: ["تحليل بيانات تجريبي", "نموذج فيديو Ai واحد", "معالجة نصية (150 حرف)"],
    highlight: false,
    isFree: true,
  },
  {
    name: "الرخصة التقنية الأساسية",
    price: "99",
    icon: Crown,
    features: ["تحليل مستندات Ai", "10 خدمات تقنية شهرياً", "2,000 حرف/شهر", "محرك الذكاء الاصطناعي"],
    highlight: false,
    isFree: false,
  },
  {
    name: "نظام تحليل البيانات المتقدم",
    price: "299",
    icon: Building2,
    features: ["مونتاج فيديو Ai", "30 خدمة تقنية شهرياً", "15,000 حرف/شهر", "تحليلات ذكية متقدمة"],
    highlight: true,
    isFree: false,
  },
  {
    name: "باقة المطور Pro",
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

      {/* Payment Methods */}
      <div className="flex items-center justify-center gap-4 px-4 pb-2">
        <span className="text-[9px] text-muted-foreground">طرق الدفع:</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded">Apple Pay</span>
          <span className="text-[10px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded">mada</span>
          <span className="text-[10px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded">STC Pay</span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-6 pb-3 leading-relaxed">
        تنبيه: 5% من قيمة اشتراكك تُستقطع كصدقة جارية لوالدينا ووالديكم في بند البركة. 💚
      </p>
    </>
  );
};

export default SubscriptionRow;
