import { FileText, Cpu, ShieldCheck, Box, Search, BarChart3 } from "lucide-react";
import { useLabels } from "@/hooks/useLabels";

const ServiceQuickGrid = () => {
  const { t } = useLabels();
  const services = [
    { icon: FileText, label: t("service.data_processing") },
    { icon: Cpu, label: t("service.code_generator", "أتمتة التقارير التقنية") },
    { icon: ShieldCheck, label: t("service.vulnerability_scanner") },
    { icon: Box, label: t("service.deed_analyzer") },
    { icon: Search, label: t("service.smart_radar") },
    { icon: BarChart3, label: t("service.ai_advisor") },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {services.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="bg-card p-4 rounded-2xl border border-primary/10 text-center cursor-pointer hover:border-primary/40 hover:shadow-[0_0_25px_hsl(var(--primary)/0.15)] hover:-translate-y-1 transition-all duration-300 group"
        >
          <Icon className="w-5 h-5 mx-auto mb-2 text-primary group-hover:icon-glow transition-all" />
          <p className="text-[9px] font-bold text-foreground text-center leading-tight">{label}</p>
        </div>
      ))}
    </div>
  );
};

export default ServiceQuickGrid;
