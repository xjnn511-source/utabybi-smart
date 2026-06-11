import { ReactNode } from "react";
import { Lock } from "lucide-react";
import { useActivation } from "@/hooks/useActivation";

interface LockGateProps {
  children: ReactNode;
  label?: string;
}

/**
 * Function Lock (not a visual blur):
 * - When NOT activated, the wrapped tools remain fully VISIBLE and explorable
 *   (no blur, no dimming) so the user can browse them clearly.
 * - Only INTERACTION is disabled (pointer-events / inputs), plus a small
 *   floating lock badge that points to the activation gate.
 * - Once activated, everything behaves exactly as before.
 */
const LockGate = ({ children, label = "هذه الأداة مقفلة وظيفياً" }: LockGateProps) => {
  const unlocked = useActivation();

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative group">
      {/* Tools stay fully visible — we only block interaction */}
      <div className="pointer-events-none select-none" aria-hidden>
        {children}
      </div>

      {/* Transparent interaction shield so visuals stay clear but clicks are blocked */}
      <button
        type="button"
        aria-label={label}
        onClick={() =>
          document.getElementById("activation-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
        className="absolute inset-0 z-20 cursor-not-allowed bg-transparent"
      />

      {/* Small floating lock badge — does not hide content */}
      <div className="absolute top-2 left-2 z-30 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/85 backdrop-blur-sm border border-primary/40 shadow-sm pointer-events-none">
        <Lock className="w-3 h-3 text-primary" />
        <span className="text-[9px] font-bold text-foreground">{label}</span>
      </div>
    </div>
  );
};

export default LockGate;
