import { CreditCard, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SubscriptionCTA = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-gradient-to-br from-card to-secondary rounded-3xl p-8 text-foreground text-center shadow-2xl relative overflow-hidden border border-primary/20">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary blur-[80px] opacity-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary blur-[60px] opacity-5"></div>
      <CreditCard className="w-10 h-10 mx-auto mb-3 text-primary opacity-80" />
      <h2 className="text-xl font-black mb-2 text-center text-primary">تفعيل اشتراك الأدوات</h2>
      <p className="text-muted-foreground text-xs mb-6 max-w-sm mx-auto text-center">
        تحويل بنكي مباشر على حساب المنصة مع مراجعة يدوية لضمان السرعة والأمان
      </p>
      <button
        onClick={() => navigate("/upgrade")}
        className="btn-accent px-12 py-3.5 text-sm flex items-center gap-2 mx-auto"
      >
        <Zap className="w-4 h-4" />
        اشترك الآن
      </button>
    </div>
  );
};

export default SubscriptionCTA;
