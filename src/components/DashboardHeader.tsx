import logo from "@/assets/logo.png";

const DashboardHeader = () => {
  return (
    <header className="flex justify-between items-center px-4 py-3 border-b border-border bg-card sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-background p-0.5 border border-border">
          <img
            src={logo}
            alt="عتيبي ذكي Ai"
            className="w-full h-full rounded-lg object-cover"
          />
        </div>
        <div>
          <h1 className="text-base font-bold text-primary">
            عُتيبي ذكي Ai 🤖
          </h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            حلول برمجية وذكاء اصطناعي متقدمة
          </p>
        </div>
      </div>
      <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
        <span className="text-[9px] font-bold text-primary">منصة SaaS للحلول البرمجية</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
