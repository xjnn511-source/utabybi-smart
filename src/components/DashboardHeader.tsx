import logo from "@/assets/logo.png";
import { Zap } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center px-4 py-4 bg-card border-b border-primary/20 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 p-1 border border-primary/30 glow-gold">
          <img
            src={logo}
            alt="عتيبي ذكي Ai"
            className="w-full h-full rounded-lg object-cover"
          />
        </div>
        <div>
          <h1 className="text-lg font-black text-primary tracking-tight">
            عُتيبي ذكي <span className="text-foreground/80 italic text-sm">Ai</span>
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            تحليل صك عقاري بالذكاء الاصطناعي
          </p>
        </div>
      </div>
      <div className="bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 animate-pulse-glow">
        <Zap className="w-3 h-3 text-primary" />
        <span className="text-[9px] font-bold text-primary">محرك المعالجة نشط</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
