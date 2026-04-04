import { CreditCard, Zap } from "lucide-react";

const SubscriptionCTA = () => {
  return (
    <div className="bg-primary rounded-3xl p-8 text-primary-foreground text-center shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent blur-[80px] opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent blur-[60px] opacity-10"></div>
      <CreditCard className="w-10 h-10 mx-auto mb-3 text-accent opacity-80" />
      <h2 className="text-xl font-black text-primary-foreground mb-2 text-center">تفعيل اشتراك الأدوات</h2>
      <p className="text-primary-foreground/60 text-xs mb-6 max-w-sm mx-auto text-center">
        احصل على وصول كامل للمحركات البرمجية والذكاء الاصطناعي
      </p>
      <button
        onClick={() => {
          const el = document.getElementById("subscription-section");
          el?.scrollIntoView({ behavior: "smooth" });
        }}
        className="btn-accent px-12 py-3.5 text-sm flex items-center gap-2 mx-auto"
      >
        <Zap className="w-4 h-4" />
        اشترك الآن
      </button>
    </div>
  );
};

export default SubscriptionCTA;
