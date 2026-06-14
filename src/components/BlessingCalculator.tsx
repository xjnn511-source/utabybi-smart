import { Newspaper } from "lucide-react";

const NewsTicker = () => {
  return (
    <div className="card-neon p-4 overflow-hidden">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Newspaper className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">نشرات عُتيبي ذكي</h2>
          <p className="text-[10px] text-muted-foreground">آخر التحديثات والأخبار</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-lg bg-primary/5 border border-primary/10 py-3">
        <div className="animate-marquee whitespace-nowrap flex gap-12">
          <span className="text-xs font-medium text-primary">
            📊 نشرات عُتيبي ذكي: معالجة بيانات حية وتحديثات لحظية وتوجهات السوق
          </span>
          <span className="text-xs font-medium text-primary">
            🚀 تحديث جديد: محركات الذكاء الاصطناعي أصبحت أسرع بـ 3 أضعاف
          </span>
          <span className="text-xs font-medium text-primary">
            🔒 أمان متقدم: تشفير كامل لجميع البيانات المعالجة
          </span>
          <span className="text-xs font-medium text-primary">
            📊 نشرات عُتيبي ذكي: معالجة بيانات حية وتحديثات لحظية وتوجهات السوق
          </span>
          <span className="text-xs font-medium text-primary">
            🚀 تحديث جديد: محركات الذكاء الاصطناعي أصبحت أسرع بـ 3 أضعاف
          </span>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
