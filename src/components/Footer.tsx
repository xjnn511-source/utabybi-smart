import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card mt-8">
      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* Policy Links */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/privacy" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
            سياسة الخصوصية
          </Link>
          <span className="text-muted-foreground/30">|</span>
          <Link to="/terms" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
            شروط الاستخدام
          </Link>
          <span className="text-muted-foreground/30">|</span>
          <Link to="/refund" className="text-[11px] text-muted-foreground hover:text-primary transition-colors">
            سياسة الاسترداد
          </Link>
        </div>

        {/* Payment Methods */}
        <div className="flex items-center justify-center gap-3">
          <span className="text-[9px] text-muted-foreground">طرق الدفع:</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded border border-border">mada</span>
            <span className="text-[10px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded border border-border">VISA</span>
            <span className="text-[10px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded border border-border">MasterCard</span>
            <span className="text-[10px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded border border-border">Apple Pay</span>
            <span className="text-[10px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded border border-border">STC Pay</span>
          </div>
        </div>

        {/* Branding */}
        <p className="text-[9px] text-muted-foreground text-center">
          عُتيبي ذكي Ai 🤖 – منصتك الذكية للحلول العقارية
        </p>
        <p className="text-[8px] text-muted-foreground/40 text-center">
          🇸🇦 🇦🇪 🇶🇦 🇧🇭 🇰🇼 🇴🇲 متاح لجميع دول الخليج العربي
        </p>
      </div>
    </footer>
  );
};

export default Footer;
