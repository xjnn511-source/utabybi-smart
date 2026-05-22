import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Radio } from "lucide-react";
import DeedVisualDashboard from "@/components/DeedVisualDashboard";

const CYAN = "hsl(var(--deed-cyan))";
const CYAN_SOFT = "hsl(var(--deed-cyan) / 0.65)";

interface DeedData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const DigitalIndicators = () => {
  const navigate = useNavigate();
  const [deed, setDeed] = useState<DeedData>({
    deedNumber: "09487333847",
    area: "500",
    owner: "خالد العتيبي",
    city: "الرياض",
    district: "حي الريس",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("utaybi.deedData");
      if (raw) setDeed(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden font-cairo notranslate"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse at center, hsl(var(--deed-surface)) 0%, hsl(var(--deed-navy)) 48%, hsl(var(--deed-bg)) 100%)",
        color: "hsl(var(--deed-text))",
      }}
    >
      {/* grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
            backgroundImage: `linear-gradient(hsl(var(--deed-cyan) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.08) 1px, transparent 1px)`,
          backgroundSize: "30px 30px",
        }}
      />

      {/* Header */}
      <header
        className="relative px-4 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "hsl(var(--deed-cyan) / 0.24)", background: "hsl(var(--deed-bg) / 0.78)", backdropFilter: "blur(8px)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold"
          style={{ background: "hsl(var(--deed-cyan) / 0.08)", border: "1px solid hsl(var(--deed-cyan) / 0.35)", color: CYAN }}
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>
        <div className="text-center flex-1">
          <h1 className="text-base md:text-lg font-extrabold" style={{ color: CYAN, textShadow: `0 0 12px ${CYAN}` }}>
            عُتيبي ذكي Ai: تحليل صك عقاري
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: CYAN_SOFT }}>
            نظام برمجي مؤتمت — Tactical Real-Estate Interface
          </p>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
          style={{ background: "hsl(var(--deed-cyan) / 0.08)", border: "1px solid hsl(var(--deed-cyan) / 0.45)", color: CYAN, boxShadow: "0 0 12px hsl(var(--deed-cyan) / 0.28)" }}
        >
          <Radio className="w-3 h-3 animate-pulse" />
          LIVE
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-3 py-5 space-y-4">
        <div className="overflow-x-auto pb-2">
          <DeedVisualDashboard deed={deed} />
        </div>

        {/* Footer */}
        <div
          className="rounded-xl p-3 flex items-center justify-center text-[10px] mt-2"
          style={{ background: "hsl(var(--deed-bg) / 0.62)", border: "1px solid hsl(var(--deed-cyan) / 0.18)" }}
        >
          <span style={{ color: CYAN_SOFT }}>
            عُتيبي ذكي Ai: نحلل بالرؤية والصوت — معالجة برمجية مؤتمتة
          </span>
        </div>
      </main>
    </div>
  );
};

export default DigitalIndicators;
