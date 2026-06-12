import { ReactNode } from "react";
import { Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActivationState } from "@/hooks/useActivation";

interface LockGateProps {
  children: ReactNode;
  label?: string;
}

/**
 * بوابة الحماية (قفل وظيفي وليس بصري):
 * - الأدوات تبقى ظاهرة بالكامل للاستكشاف.
 * - غير مسجّل الدخول → النقر يوجّه لصفحة تسجيل الدخول.
 * - مسجّل دخول بدون تفعيل → النقر يوجّه لبوابة رفع الإيصال.
 * - مدير أو مفعّل بالإيصال → استخدام كامل.
 */
const LockGate = ({ children, label = "هذه الأداة مقفلة وظيفياً" }: LockGateProps) => {
  const { unlocked, isLoggedIn, loading } = useActivationState();
  const navigate = useNavigate();

  // أثناء تحميل الجلسة نبقي القفل مفعّلاً بصرياً دون كسر الواجهة
  if (unlocked) return <>{children}</>;

  const needsLogin = !isLoggedIn;
  const badgeLabel = loading
    ? "جارٍ التحقق..."
    : needsLogin
    ? "سجّل الدخول للاستخدام"
    : label;

  const handleClick = () => {
    if (loading) return;
    if (needsLogin) {
      navigate("/auth");
      return;
    }
    document
      .getElementById("activation-section")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="relative group">
      {/* الأدوات تبقى ظاهرة — نعطّل التفاعل فقط */}
      <div className="pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* درع شفاف يلتقط النقرات */}
      <button
        type="button"
        aria-label={badgeLabel}
        onClick={handleClick}
        className="absolute inset-0 z-20 cursor-not-allowed bg-transparent"
      />

      {/* شارة عائمة صغيرة */}
      <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-primary/40 shadow-sm pointer-events-none">
        {needsLogin ? (
          <LogIn className="w-3 h-3 text-primary" />
        ) : (
          <Lock className="w-3 h-3 text-primary" />
        )}
        <span className="text-[9px] font-bold text-foreground">{badgeLabel}</span>
      </div>
    </div>
  );
};

export default LockGate;
