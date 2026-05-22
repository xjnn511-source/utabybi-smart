import { FileSearch, PenTool, Play, Calculator } from "lucide-react";

const services = [
  { icon: FileSearch, label: "المعالج المنطقي", target: "deed-section" },
  { icon: PenTool, label: "توليد نصوص مؤتمتة", target: "content-section" },
  { icon: Play, label: "معالجة الوسائط", target: "video-section" },
  { icon: Calculator, label: "الأداة الحسابية", target: "calculator-section" },
];

const ServiceQuickGrid = () => {
  const scrollToTarget = (target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid grid-cols-4 gap-3">
      {services.map(({ icon: Icon, label, target }) => (
        <button
          type="button"
          key={label}
          onClick={() => scrollToTarget(target)}
          className="bg-card p-4 rounded-2xl border border-primary/10 text-center cursor-pointer hover:border-primary/40 hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)] hover:-translate-y-1 active:scale-95 transition-all duration-300 group"
        >
          <Icon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:icon-glow transition-all" />
          <p className="text-[10px] font-bold text-foreground text-center">{label}</p>
        </button>
      ))}
    </div>
  );
};

export default ServiceQuickGrid;
