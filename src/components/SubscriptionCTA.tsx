import { CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubscriptionCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-primary rounded-2xl p-8 text-center shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-foreground/5 blur-[60px]" />
      <CreditCard className="w-10 h-10 mx-auto mb-3 text-primary-foreground/80" />
      <h2 className="text-xl font-bold text-primary-foreground mb-2">تفعيل اشتراك الأدوات</h2>
      <p className="text-primary-foreground/60 text-[11px] mb-6">احصل على وصول كامل للمحركات البرمجية</p>
      <button
        onClick={() => {
          const el = document.getElementById("subscription-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        className="bg-primary-foreground text-primary px-10 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
      >
        اشترك الآن
      </button>
    </div>
  );
};

export default SubscriptionCTA;
