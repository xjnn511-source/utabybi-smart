import { useState } from "react";
import { Calculator } from "lucide-react";

const BlessingCalculator = () => {
  const [price, setPrice] = useState("");

  const numPrice = parseFloat(price) || 0;
  const parentsShare = numPrice * 0.05;
  const marketingFee = numPrice * 0.005;

  return (
    <div className="card-neon p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Calculator className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">بند البركة</h2>
          <p className="text-[10px] text-muted-foreground">حاسبة رسوم التسويق والبر</p>
        </div>
      </div>

      <input
        type="number"
        placeholder="أدخل سعر العقار (ريال)"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="w-full h-9 px-3 rounded-lg border border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors mb-3"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <p className="text-[10px] text-muted-foreground mb-1">٥٪ لوالديك</p>
          <p className="text-lg font-bold text-primary">
            {numPrice > 0 ? parentsShare.toLocaleString("ar-SA") : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">ريال</p>
        </div>
        <div className="p-3 rounded-lg bg-secondary border border-border text-center">
          <p className="text-[10px] text-muted-foreground mb-1">0.5% رسوم التسويق</p>
          <p className="text-lg font-bold text-foreground">
            {numPrice > 0 ? marketingFee.toLocaleString("ar-SA") : "—"}
          </p>
          <p className="text-[9px] text-muted-foreground mt-0.5">ريال</p>
        </div>
      </div>

      <p className="text-[9px] text-muted-foreground text-center mt-2">
        البركة تجلب الرزق
      </p>
    </div>
  );
};

export default BlessingCalculator;
