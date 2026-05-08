import { Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-card mt-8">
      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
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

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
            <span className="text-[10px] font-semibold">دفع آمن وموثوق</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-foreground/10 border border-border rounded-md px-3 py-1.5 flex items-center gap-1">
              <svg className="w-3 h-3 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-[9px] font-bold text-foreground">دفع</span>
            </div>
            <div className="border-2 border-primary/40 rounded-md px-3 py-1.5">
              <span className="text-[11px] font-black tracking-tight text-primary">mada</span>
            </div>
            <div className="border border-border rounded-md px-2.5 py-1 flex items-center gap-0.5">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 -mr-1 opacity-90" />
              <div className="w-3.5 h-3.5 rounded-full bg-amber-400 opacity-90" />
            </div>
            <div className="rounded-md px-3 py-1.5 border border-border bg-purple-600/20">
              <span className="text-[9px] font-bold text-purple-300 tracking-tight">STC دفع</span>
            </div>
          </div>
        </div>

        <p className="text-[9px] text-muted-foreground text-center">
          عُتيبي ذكي 🤖 – نعالج بالرؤية والصوت | FL-822675484
        </p>
        <p className="text-[8px] text-muted-foreground/40 text-center">
          🇸🇦 🇦🇪 🇶🇦 🇧🇭 🇰🇼 🇴🇲 متاح لجميع دول الخليج العربي
        </p>
      </div>
    </footer>
  );
};

export default Footer;
