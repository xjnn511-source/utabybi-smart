import { Crown, Building2, Rocket } from "lucide-react";

const plans = [
  { name: "باقة النخبة", price: "99", icon: Crown, features: ["تحليل ٥ صكوك", "بوستر واحد"] },
  { name: "المكتب", price: "299", icon: Building2, features: ["تحليل ٢٠ صك", "١٠ بوسترات", "دعم عقاري صوتي"] },
  { name: "الريادة", price: "499", icon: Rocket, features: ["تحليل غير محدود", "بوسترات غير محدودة", "دعم عقاري + فيديو"] },
];

const SubscriptionRow = () => {
  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="card-clean p-5 min-w-[220px] snap-center flex flex-col"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <plan.icon className="w-4 h-4 text-accent-foreground" strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-foreground">{plan.name}</h3>
            </div>

            <div className="mb-3">
              <span className="text-2xl font-bold text-primary">{plan.price}</span>
              <span className="text-xs text-text-dim mr-1">ر.س/شهر</span>
            </div>

            <ul className="space-y-1.5 mb-4 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="text-xs text-text-dim flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {f}
                </li>
              ))}
            </ul>

            <button className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
              اشترك الآن
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-dim text-center px-6 pb-4 leading-relaxed">
        تنبيه: 5% من قيمة اشتراكك تُستقطع كصدقة جارية لوالدينا ووالديكم في بند البركة.
      </p>
    </>
  );
};

export default SubscriptionRow;
