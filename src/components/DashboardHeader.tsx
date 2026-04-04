import logo from "@/assets/logo.png";
import { Zap } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center px-4 py-4 bg-primary border-b-4 border-accent sticky top-0 z-40 shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-accent p-1.5 shadow-[0_0_20px_hsl(var(--accent)/0.4)]">
          <img
            src={logo}
            alt="عتيبي ذكي Ai"
            className="w-full h-full rounded-lg object-cover"
          />
        </div>
        <div>
          <h1 className="text-lg font-black text-primary-foreground tracking-tight">
            عُتيبي ذكي <span className="text-accent italic text-sm">Ai</span>
          </h1>
          <p className="text-[10px] text-primary-foreground/60 mt-0.5">
            حلول برمجية وذكاء اصطناعي متقدمة
          </p>
        </div>
      </div>
      <div className="bg-accent px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_12px_hsl(var(--accent)/0.3)] animate-pulse">
        <Zap className="w-3 h-3 text-accent-foreground" />
        <span className="text-[9px] font-black text-accent-foreground">محرك المعالجة نشط</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
