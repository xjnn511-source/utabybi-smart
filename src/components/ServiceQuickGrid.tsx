import { FileSearch, PenTool, Play, Calculator } from "lucide-react";

const services = [
  { icon: FileSearch, label: "المحلل الذكي" },
  { icon: PenTool, label: "منشئ المحتوى" },
  { icon: Play, label: "صانع الفيديو" },
  { icon: Calculator, label: "الأداة الحسابية" },
];

const ServiceQuickGrid = () => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {services.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="bg-card p-4 rounded-2xl border border-border shadow-sm text-center cursor-pointer hover:border-accent hover:shadow-md hover:-translate-y-1 transition-all duration-200 group"
        >
          <Icon className="w-6 h-6 mx-auto mb-2 text-primary group-hover:text-accent transition-colors" />
          <p className="text-[10px] font-bold text-foreground text-center">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default ServiceQuickGrid;
