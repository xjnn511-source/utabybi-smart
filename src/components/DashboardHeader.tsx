import logo from "@/assets/logo.png";

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-background p-0.5 border border-border">
          <img
            src={logo}
            alt="عتيبي ذكي Smart AI"
            className="w-full h-full rounded-lg object-cover"
          />
        </div>
        <div>
          <h1 className="text-base font-bold neon-text">
            عُتيبي ذكي Ai
          </h1>
          <p className="text-[10px] text-text-dim mt-0.5">
            منصة الحلول العقارية الذكية
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] text-text-dim">متصل</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
