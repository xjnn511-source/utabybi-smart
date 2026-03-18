import { LayoutDashboard } from "lucide-react";

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center px-6 py-6 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <LayoutDashboard className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            عُتيبي ذكي Ai
          </h1>
          <p className="text-xs text-text-dim mt-0.5">
            منصة الحلول العقارية الذكية
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-xs text-text-dim">متصل</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
