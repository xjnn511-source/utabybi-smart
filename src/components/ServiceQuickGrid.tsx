import { FileSearch, PenTool, Play, Calculator } from "lucide-react";

const services = [
  { icon: FileSearch, label: "المعالج المنطقي" },
  { icon: PenTool, label: "توليد نصوص مؤتمتة" },
  { icon: Play, label: "معالجة الوسائط" },
  { icon: Calculator, label: "الأداة الحسابية" },
];

const ServiceQuickGrid = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {services.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="bg-card p-4 rounded-2xl border border-primary/10 text-center cursor-pointer hover:border-primary/40 hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)] hover:-translate-y-1 transition-all duration-300 group"
        >
          <Icon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:icon-glow transition-all" />
          <p className="text-[10px] font-bold text-foreground text-center">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default ServiceQuickGrid;
