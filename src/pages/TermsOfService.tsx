import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const TermsOfService = () => (
  <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto" dir="rtl">
    <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
      <ArrowRight className="w-4 h-4" /> العودة للرئيسية
    </Link>
    <h1 className="text-2xl font-bold text-foreground mb-4">شروط الاستخدام</h1>
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <p>باستخدامك لمنصة "عُتيبي ذكي Ai" – منصة SaaS لتطوير البرمجيات والذكاء الاصطناعي – فإنك توافق على الالتزام بالشروط والأحكام التالية.</p>
      <h2 className="text-lg font-semibold text-foreground">الخدمات المقدمة</h2>
      <p>تقدم المنصة حلول SaaS متقدمة تعتمد على الذكاء الاصطناعي لتحليل البيانات، إنشاء محتوى تسويقي، ومونتاج فيديو احترافي. المنصة أداة تقنية مساعدة ولا تُعدّ بديلاً عن الاستشارة المتخصصة.</p>
      <h2 className="text-lg font-semibold text-foreground">الاشتراكات والدفع</h2>
      <p>تتوفر باقات شهرية (99، 299، 499 ريال سعودي). يتم خصم 5% كصدقة جارية من كل اشتراك. الدفع يتم عبر Apple Pay، mada، أو STC Pay.</p>
      <h2 className="text-lg font-semibold text-foreground">المسؤولية</h2>
      <p>المسؤولية النهائية عن دقة البيانات المدخلة تقع على عاتق المستخدم. التطبيق لا يتحمل أي مسؤولية قانونية عن نتائج التحليل.</p>
      <h2 className="text-lg font-semibold text-foreground">حقوق الملكية</h2>
      <p>جميع المحتويات والعلامات التجارية مملوكة لـ "عُتيبي ذكي Ai". يُمنع نسخ أو إعادة استخدام أي محتوى دون إذن مسبق.</p>
    </div>
  </div>
);

export default TermsOfService;
