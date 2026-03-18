import { useState } from "react";
import { Calculator } from "lucide-react";

const BlessingCalculator = () => {
  const [price, setPrice] = useState("");

  const numPrice = parseFloat(price) || 0;
  const parentsShare = numPrice * 0.05;
  const marketingFee = numPrice * 0.005;

  return (
    <div className="card-clean p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <Calculator className="w-5 h-5 text-accent-foreground" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">بند البركة</h2>
          <p className="text-xs text-text-dim">حاسبة رسوم التسويق والبر</p>
        </div>
      </div>

      <input
        type="number"
        placeholder="أدخل سعر العقار (ريال)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors mb-4"
      />

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-accent border border-border text-center">
          <p className="text-xs text-text-dim mb-1">٥٪ لوالديك</p>
          <p className="text-xl font-bold text-primary">
            {numPrice > 0 ? parentsShare.toLocaleString("ar-SA") : "—"}
          </p>
          <p className="text-[10px] text-text-dim mt-1">ريال</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary border border-border text-center">
          <p className="text-xs text-text-dim mb-1">0.5% رسوم التسويق</p>
          <p className="text-xl font-bold text-foreground">
            {numPrice > 0 ? marketingFee.toLocaleString("ar-SA") : "—"}
          </p>
          <p className="text-[10px] text-text-dim mt-1">ريال</p>
        </div>
      </div>

      <p className="text-[10px] text-text-dim text-center mt-3">
        البركة تجلب الرزق
      </p>
    </div>
  );
};

export default BlessingCalculator;
