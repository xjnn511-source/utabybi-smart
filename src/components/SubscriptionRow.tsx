import { Crown, Building2, Rocket, Gift } from "lucide-react";

const plans = [
  {
    name: "تجربة مجانية",
    price: "0",
    icon: Gift,
    features: ["تحليل صك واحد مجاناً", "إعلان فيديو Ai واحد مجاناً"],
    highlight: false,
    isFree: true,
  },
  {
    name: "باقة النخبة",
    price: "99",
    icon: Crown,
    features: ["صناعة عروض عقارية", "10 إعلانات عقارية مصممة", "صوت خالد العتيبي Ai"],
    highlight: false,
    isFree: false,
  },
  {
    name: "باقة الأعمال",
    price: "299",
    icon: Building2,
    features: ["مونتاج فيديو Ai", "صناعة عروض عقارية", "30 إعلان عقاري مصمم", "صوت خالد العتيبي Ai"],
    highlight: true,
    isFree: false,
  },
  {
    name: "باقة المكتب",
    price: "499",
    icon: Rocket,
    features: ["كل الخدمات بلا حدود", "إعلانات غير محدودة", "مونتاج + عروض + دعم", "صوت خالد العتيبي Ai"],
    highlight: false,
    isFree: false,
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
            } ${plan.isFree ? "border-green-500/50" : ""}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-7 h-7 rounded-md flex items-center justify-center ${plan.isFree ? "bg-green-100" : "bg-primary/10"}`}>
                <plan.icon className={`w-3.5 h-3.5 ${plan.isFree ? "text-green-600" : "text-primary"}`} strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-foreground">{plan.name}</h3>
            </div>

            <div className="mb-2">
              <span className={`text-xl font-bold ${plan.isFree ? "text-green-600" : "text-primary"}`}>{plan.price}</span>
              <span className="text-[10px] text-muted-foreground mr-1">
                {plan.isFree ? "مجاناً" : "ر.س/شهر"}
              </span>
            </div>

            <ul className="space-y-1 mb-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full inline-block ${plan.isFree ? "bg-green-500" : "bg-primary"}`} />
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              plan.isFree
                ? "bg-green-600 text-white hover:bg-green-700"
                : plan.highlight
                  ? "btn-neon"
                  : "bg-secondary border border-border text-foreground hover:border-primary hover:text-primary"
            }`}>
              {plan.isFree ? "ابدأ مجاناً" : "اشترك الآن"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground text-center px-6 pb-3 leading-relaxed">
        تنبيه: 5% من قيمة اشتراكك تُستقطع كصدقة جارية لوالدينا ووالديكم في بند البركة.
      </p>
    </>
  );
};

export default SubscriptionRow;
