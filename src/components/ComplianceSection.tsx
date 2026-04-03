import { ShieldCheck } from "lucide-react";

const ComplianceSection = () => {
  return (
    <div className="bg-secondary/50 border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <ShieldCheck className="w-7 h-7 text-primary" />
        <div>
          <h2 className="text-base font-bold text-foreground">بيانات التوثيق الرقمي</h2>
          <p className="text-[10px] text-muted-foreground">مطابقة النشاط البرمجي لوثيقة العمل الحر</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 text-sm">
        <div className="p-3 bg-card rounded-xl border border-border flex justify-between items-center">
          <span className="text-muted-foreground text-[11px]">النشاط المرخص:</span>
          <span className="font-bold text-primary text-[11px]">برمجة وتطوير المواقع</span>
        </div>
        <div className="p-3 bg-card rounded-xl border border-border flex justify-between items-center">
          <span className="text-muted-foreground text-[11px]">رقم الوثيقة المعتمد:</span>
          <span className="font-mono font-bold text-primary text-[11px]">FL-822675484</span>
        </div>
      </div>
      <p className="mt-4 text-[9px] text-muted-foreground leading-relaxed border-r-2 border-primary pr-3">
        جميع خدمات منصة "عُتيبي ذكي Ai" هي أدوات برمجية تقنية (SaaS) مطورة بواسطة المبرمج خالد العتيبي.
        الرسوم المحصلة هي مقابل اشتراكات برمجية لاستخدام المحركات الذكية، ولا تقدم المنصة خدمات وساطة أو تسويق عقاري.
      </p>
    </div>
  );
};

export default ComplianceSection;
