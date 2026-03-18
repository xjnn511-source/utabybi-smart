import logo from "@/assets/logo.png";

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center px-4 py-4 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        <img
          src={logo}
          alt="عتيبي ذكي Smart AI"
          className="w-14 h-14 rounded-xl object-cover"
        />
        <div>
          <h1 className="text-lg font-bold text-foreground">
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
