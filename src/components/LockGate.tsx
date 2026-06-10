import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useActivation } from "@/hooks/useActivation";

interface LockGateProps {
  children: ReactNode;
  label?: string;
}

/**
 * Wraps existing tools without changing their design.
 * When the account is not activated (receipt not verified), it overlays a
 * non-destructive lock layer that blocks interaction. Once activated, the
 * children render and behave exactly as before.
 */
const LockGate = ({ children, label = "هذه الأداة مقفلة" }: LockGateProps) => {
  const unlocked = useActivation();

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Original UI, untouched, just visually dimmed and non-interactive */}
      <div className="pointer-events-none select-none blur-[3px] opacity-60" aria-hidden>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-[var(--radius)] bg-background/70 backdrop-blur-[2px] border border-primary/20">
        <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center glow-gold">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <p className="text-[11px] font-bold text-foreground">{label}</p>
        <p className="text-[9px] text-muted-foreground">ارفع إيصال التحويل البنكي لتفعيل الوصول</p>
        <button
          onClick={() =>
            document.getElementById("activation-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
          }
          className="mt-1 h-8 px-4 rounded-lg bg-primary/15 border border-primary/40 text-primary text-[10px] font-bold hover:bg-primary/25"
        >
          فتح بوابة التفعيل
        </button>
      </div>
    </div>
  );
};

export default LockGate;
