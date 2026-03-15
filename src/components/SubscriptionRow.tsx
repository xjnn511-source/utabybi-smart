import { motion } from "framer-motion";
import { Crown, Building2, Rocket } from "lucide-react";

const plans = [
  { name: "القناص", price: "99", icon: Crown, features: ["تحليل ٥ صكوك", "بوستر واحد"] },
  { name: "المكتب", price: "299", icon: Building2, features: ["تحليل ٢٠ صك", "١٠ بوسترات", "صوت نجدي"] },
  { name: "الريادة", price: "499", icon: Rocket, features: ["تحليل غير محدود", "بوسترات غير محدودة", "صوت + فيديو"] },
];

const SubscriptionRow = () => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-8 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      {plans.map((plan, i) => (
        <motion.div
          key={plan.name}
          className="glass-card p-5 min-w-[220px] snap-center flex flex-col"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <plan.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h3 className="text-base font-light text-foreground">{plan.name}</h3>
          </div>

          <div className="mb-3">
            <span className="text-2xl font-extralight glow-text">{plan.price}</span>
            <span className="text-xs text-text-dim font-thin mr-1">ر.س/شهر</span>
          </div>

          <ul className="space-y-1.5 mb-4 flex-1">
            {plan.features.map((f) => (
              <li key={f} className="text-xs text-text-dim font-thin flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-primary inline-block" />
                {f}
              </li>
            ))}
          </ul>

          <button className="w-full h-11 rounded-lg bg-foreground/90 text-primary-foreground text-sm font-light flex items-center justify-center gap-2">
             Pay
          </button>
        </motion.div>
      ))}
    </div>
  );
};

export default SubscriptionRow;
