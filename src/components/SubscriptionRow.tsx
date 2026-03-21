import { Crown, Building2, Rocket } from "lucide-react";

const plans = [
  {
    name: "باقة النخبة",
    price: "99",
    icon: Crown,
    features: ["صناعة عروض عقارية", "10 إعلانات عقارية مصممة"],
    highlight: false,
  },
  {
    name: "باقة الأعمال",
    price: "299",
    icon: Building2,
    features: ["مونتاج فيديو Ai", "صناعة عروض عقارية", "30 إعلان عقاري مصمم"],
    highlight: true,
  },
  {
    name: "باقة المكتب",
    price: "499",
    icon: Rocket,
    features: ["كل الخدمات بلا حدود", "إعلانات غير محدودة", "مونتاج + عروض + دعم"],
    highlight: false,
  },
];

const SubscriptionRow = () => {
  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-3 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`card-neon p-4 min-w-[200px] snap-center flex flex-col ${
              plan.highlight ? "border-primary border-2" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <plan.icon className="w-3.5 h-3.5 text-primary" strokeWidth={2} />
              </div>
              <h3 className="text-xs font-bold text-foreground">{plan.name}</h3>
            </div>

            <div className="mb-2">
              <span className="text-xl font-bold text-primary">{plan.price}</span>
              <span className="text-[10px] text-muted-foreground mr-1">ر.س/شهر</span>
            </div>

            <ul className="space-y-1 mb-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                  {f}
                </li>
              ))}
            </ul>

            <button className={`w-full h-9 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
              plan.highlight
                ? "btn-neon"
                : "bg-secondary border border-border text-foreground hover:border-primary hover:text-primary"
            }`}>
              اشترك الآن
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
