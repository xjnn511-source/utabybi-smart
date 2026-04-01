import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const PrivacyPolicy = () => (
  <div className="min-h-screen bg-background p-6 max-w-2xl mx-auto" dir="rtl">
    <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
      <ArrowRight className="w-4 h-4" /> العودة للرئيسية
    </Link>
    <h1 className="text-2xl font-bold text-foreground mb-4">سياسة الخصوصية</h1>
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      <p>نحن في "عُتيبي ذكي Ai" نلتزم بحماية خصوصية مستخدمينا. توضح هذه السياسة كيفية جمع واستخدام وحماية بياناتك.</p>
      <h2 className="text-lg font-semibold text-foreground">البيانات التي نجمعها</h2>
      <p>نجمع المعلومات التي تقدمها لنا مباشرةً مثل الاسم، البريد الإلكتروني، ورقم الجوال عند التسجيل. كما نجمع بيانات الصكوك والعقارات التي ترفعها للتحليل.</p>
      <h2 className="text-lg font-semibold text-foreground">كيف نستخدم بياناتك</h2>
      <p>نستخدم بياناتك لتقديم خدمات التحليل العقاري بالذكاء الاصطناعي، تحسين تجربة المستخدم، ومعالجة الاشتراكات والمدفوعات.</p>
      <h2 className="text-lg font-semibold text-foreground">حماية البيانات</h2>
      <p>نستخدم تشفير SSL وإجراءات أمنية متقدمة لحماية بياناتك. لا نشارك بياناتك مع أطراف ثالثة دون موافقتك.</p>
      <h2 className="text-lg font-semibold text-foreground">تواصل معنا</h2>
      <p>لأي استفسارات حول الخصوصية، تواصل معنا عبر البريد الإلكتروني المتاح في التطبيق.</p>
    </div>
  </div>
);

export default PrivacyPolicy;
