import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const RefundPolicy = () => (
  <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto" dir="rtl">
    <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
      <ArrowRight className="w-4 h-4" /> العودة للرئيسية
    </Link>
    <h1 className="text-2xl font-bold text-foreground mb-4">سياسة الاسترداد</h1>
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <p>نسعى في "عُتيبي ذكي Ai" لتقديم أفضل تجربة. فيما يلي سياسة الاسترداد الخاصة بنا.</p>
      <h2 className="text-lg font-semibold text-foreground">شروط الاسترداد</h2>
      <p>يمكن طلب استرداد كامل المبلغ خلال 7 أيام من تاريخ الاشتراك، بشرط عدم استخدام أكثر من خدمتين من الباقة.</p>
      <h2 className="text-lg font-semibold text-foreground">كيفية طلب الاسترداد</h2>
      <p>أرسل طلب الاسترداد عبر البريد الإلكتروني مع ذكر رقم الاشتراك وسبب الطلب. سيتم معالجة الطلب خلال 5-10 أيام عمل.</p>
      <h2 className="text-lg font-semibold text-foreground">حالات عدم الاسترداد</h2>
      <p>لا يمكن الاسترداد بعد مرور 7 أيام أو بعد استهلاك أكثر من 50% من رصيد الباقة. ملاحظة: نسبة الـ 5% المخصصة للصدقة غير قابلة للاسترداد.</p>
      <h2 className="text-lg font-semibold text-foreground">تواصل معنا</h2>
      <p>لأي استفسارات حول الاسترداد، لا تتردد في التواصل معنا عبر قنوات الدعم المتاحة.</p>
    </div>
  </div>
);

export default RefundPolicy;
