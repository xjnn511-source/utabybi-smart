import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";

const BlessingCalculator = () => {
  const [price, setPrice] = useState("");

  const numPrice = parseFloat(price) || 0;
  const parentsShare = numPrice * 0.05;
  const marketingFee = numPrice * 0.005;

  return (
    <motion.div
      className="glass-card p-6"
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      <div className="flex items-center gap-3 mb-4">
        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          <Calculator className="w-6 h-6 text-primary" strokeWidth={1.5} />
        </motion.div>
        <div>
          <h2 className="text-lg font-light text-foreground">بند البركة</h2>
          <p className="text-xs text-text-dim font-thin">حاسبة البر والتسويق</p>
        </div>
      </div>

      <input
        type="number"
        placeholder="أدخل سعر العقار (ريال)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full p-3 rounded-lg bg-secondary/50 border border-primary/20 text-foreground text-sm font-light placeholder:text-text-dim/50 focus:outline-none focus:border-primary/60 transition-colors mb-4"
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
          <p className="text-xs text-text-dim font-thin mb-1">٥٪ لوالديك</p>
          <p className="text-lg font-light glow-text">
            {numPrice > 0 ? parentsShare.toLocaleString("ar-SA") : "—"}
          </p>
          <p className="text-[10px] text-text-dim/60 mt-1">ريال</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/50 border border-primary/10 text-center">
          <p className="text-xs text-text-dim font-thin mb-1">0.5% أتعاب تسويق</p>
          <p className="text-lg font-light text-foreground">
            {numPrice > 0 ? marketingFee.toLocaleString("ar-SA") : "—"}
          </p>
          <p className="text-[10px] text-text-dim/60 mt-1">ريال</p>
        </div>
      </div>

      <p className="text-[10px] text-text-dim/40 text-center mt-3 font-thin uppercase tracking-wider">
        البركة تجلب الرزق
      </p>
    </motion.div>
  );
};

export default BlessingCalculator;
