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
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-[10px] text-muted-foreground">متصل</span>
      </div>
    </header>
  );
};

export default DashboardHeader;
