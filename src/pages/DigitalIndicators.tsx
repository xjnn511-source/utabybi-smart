import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, TrendingUp, BarChart3, Star, Zap, Radio, ShieldCheck, Cpu,
} from "lucide-react";

const CYAN = "#bf5af2"; // fuchsia accent (theme)
const GREEN = "#2563eb"; // blue accent (theme)
const SCORE = 92;

const DigitalIndicators = () => {
  const navigate = useNavigate();
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1500, 1);
      setAnimatedScore(Math.round(SCORE * p));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Gauge math (semi-circle)
  const radius = 110;
  const circumference = Math.PI * radius;
  const dash = (animatedScore / 100) * circumference;

  const trendBars = [42, 55, 48, 62, 58, 71, 68, 79, 84, 88, 92];
  const demandBars = [30, 45, 38, 60, 55, 72, 80, 86];
  const ratingStars = 4.7;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden font-cairo notranslate"
      dir="rtl"
      style={{
        background: "radial-gradient(ellipse at top, #04111a 0%, #020617 60%, #000 100%)",
        color: "#e2e8f0",
      }}
    >
      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.07) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Header */}
      <header
        className="relative px-4 py-4 flex items-center justify-between border-b"
        style={{ borderColor: "rgba(34,211,238,0.25)", background: "rgba(2,6,23,0.7)", backdropFilter: "blur(8px)" }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all"
          style={{
            background: "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.4)",
            color: CYAN,
          }}
        >
          <ArrowRight className="w-4 h-4" />
          رجوع
        </button>

        <div className="text-center flex-1">
          <h1
            className="text-base md:text-lg font-extrabold"
            style={{ color: CYAN, textShadow: "0 0 12px rgba(34,211,238,0.7)" }}
          >
            التقرير التقني للمؤشرات الرقمية
          </h1>
          <p className="text-[10px] mt-0.5" style={{ color: "rgba(167,243,208,0.7)" }}>
            نظام برمجي مؤتمت لتقييم الأصول التقنية — Enterprise Edition
          </p>
        </div>

        <div
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.5)",
            color: "#34d399",
            boxShadow: "0 0 12px rgba(16,185,129,0.3)",
          }}
        >
          <Radio className="w-3 h-3 animate-pulse" />
          LIVE
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 py-6 space-y-5">
        {/* Catch / Efficiency Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl p-4 overflow-hidden"
          style={{
            background: "linear-gradient(90deg, rgba(16,185,129,0.18), rgba(34,211,238,0.12))",
            border: "1.5px solid rgba(16,185,129,0.6)",
            boxShadow: "0 0 30px rgba(16,185,129,0.4), inset 0 0 30px rgba(16,185,129,0.08)",
            animation: "pulseGlow 2.5s ease-in-out infinite",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(16,185,129,0.2)",
                  border: "1.5px solid #10b981",
                  boxShadow: "0 0 20px #10b981",
                }}
              >
                <ShieldCheck className="w-5 h-5" style={{ color: GREEN, filter: "drop-shadow(0 0 6px #10b981)" }} />
              </div>
              <div>
                <p className="text-[10px] font-bold" style={{ color: "rgba(167,243,208,0.8)" }}>
                  مؤشر كفاءة القيمة
                </p>
                <p className="text-base font-extrabold" style={{ color: "#34d399", textShadow: "0 0 10px #10b981" }}>
                  مثالي (نظام برمجى مؤتمت)
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-[9px]" style={{ color: "rgba(167,243,208,0.6)" }}>درجة الكفاءة</p>
              <p className="text-2xl font-black" style={{ color: GREEN, textShadow: "0 0 10px #10b981" }}>
                {animatedScore}%
              </p>
            </div>
          </div>
        </motion.div>

        {/* Central Gauge */}
        <div
          className="relative rounded-2xl p-6 overflow-hidden"
          style={{
            background: "rgba(2,6,23,0.6)",
            border: "1px solid rgba(34,211,238,0.3)",
            boxShadow: "0 0 30px rgba(34,211,238,0.2), inset 0 0 40px rgba(34,211,238,0.05)",
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4" style={{ color: CYAN, filter: "drop-shadow(0 0 4px #22d3ee)" }} />
            <h2 className="text-sm font-extrabold" style={{ color: CYAN, textShadow: "0 0 8px #22d3ee" }}>
              العداد المركزي للقيمة التقنية
            </h2>
          </div>

          <div className="flex flex-col items-center justify-center py-4">
            <svg width="280" height="170" viewBox="0 0 280 170">
              <defs>
                <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Track */}
              <path
                d="M 30 140 A 110 110 0 0 1 250 140"
                fill="none"
                stroke="rgba(34,211,238,0.15)"
                strokeWidth="14"
                strokeLinecap="round"
              />
              {/* Filled */}
              <path
                d="M 30 140 A 110 110 0 0 1 250 140"
                fill="none"
                stroke="url(#gaugeGrad)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${dash} ${circumference}`}
                filter="url(#glow)"
              />
              {/* Tick marks */}
              {[0, 25, 50, 75, 100].map((v) => {
                const angle = Math.PI - (v / 100) * Math.PI;
                const x1 = 140 + Math.cos(angle) * 95;
                const y1 = 140 - Math.sin(angle) * 95;
                const x2 = 140 + Math.cos(angle) * 80;
                const y2 = 140 - Math.sin(angle) * 80;
                return (
                  <line
                    key={v}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#22d3ee"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                );
              })}
              {/* Center text */}
              <text
                x="140"
                y="125"
                textAnchor="middle"
                fontSize="48"
                fontWeight="900"
                fill="#22d3ee"
                style={{ filter: "drop-shadow(0 0 8px #22d3ee)" }}
                fontFamily="Cairo, sans-serif"
              >
                {animatedScore}
              </text>
              <text
                x="140"
                y="155"
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill="#10b981"
                fontFamily="Cairo, sans-serif"
              >
                درجة الكفاءة البرمجية
              </text>
            </svg>

            <div className="grid grid-cols-3 gap-2 w-full max-w-md mt-3 text-center">
              {[
                { label: "ضعيف", color: "#ef4444", range: "0-40" },
                { label: "متوسط", color: "#eab308", range: "41-70" },
                { label: "مثالي", color: GREEN, range: "71-100" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg p-2"
                  style={{
                    background: "rgba(2,6,23,0.6)",
                    border: `1px solid ${s.color}40`,
                    boxShadow: s.label === "مثالي" ? `0 0 10px ${s.color}80` : undefined,
                  }}
                >
                  <p className="text-[10px] font-bold" style={{ color: s.color }}>{s.label}</p>
                  <p className="text-[9px]" style={{ color: "rgba(226,232,240,0.5)" }}>{s.range}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Charts grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* District Price Trends */}
          <ChartCard
            icon={TrendingUp}
            title="مؤشر أسعار الحي"
            subtitle="اتجاه آخر 11 فترة برمجية"
            color={CYAN}
            value="+18.4%"
          >
            <svg viewBox="0 0 220 100" className="w-full h-24">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const pts = trendBars.map((v, i) => `${(i / (trendBars.length - 1)) * 220},${100 - v}`);
                const path = `M ${pts.join(" L ")}`;
                const area = `${path} L 220,100 L 0,100 Z`;
                return (
                  <>
                    <path d={area} fill="url(#lineGrad)" />
                    <motion.path
                      d={path}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth="2"
                      style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                    {pts.map((p, i) => {
                      const [x, y] = p.split(",").map(Number);
                      return <circle key={i} cx={x} cy={y} r="2" fill="#22d3ee" />;
                    })}
                  </>
                );
              })()}
            </svg>
          </ChartCard>

          {/* Demand Analysis */}
          <ChartCard
            icon={BarChart3}
            title="مؤشر معالجة الطلب"
            subtitle="حجم الطلب الرقمي"
            color={GREEN}
            value="عالي"
          >
            <svg viewBox="0 0 220 100" className="w-full h-24">
              {demandBars.map((v, i) => {
                const w = 220 / demandBars.length - 4;
                const x = i * (220 / demandBars.length) + 2;
                const h = v;
                return (
                  <motion.rect
                    key={i}
                    x={x}
                    y={100 - h}
                    width={w}
                    height={h}
                    fill={GREEN}
                    rx="2"
                    style={{ filter: "drop-shadow(0 0 3px #10b981)" }}
                    initial={{ height: 0, y: 100 }}
                    animate={{ height: h, y: 100 - h }}
                    transition={{ duration: 0.6, delay: i * 0.08 }}
                  />
                );
              })}
            </svg>
          </ChartCard>

          {/* Property Rating */}
          <ChartCard
            icon={Star}
            title="تقييم الأصل التقني"
            subtitle="معالجة برمجية متعددة المعايير"
            color={CYAN}
            value={`${ratingStars} / 5`}
          >
            <div className="flex items-center justify-center gap-1.5 h-24">
              {[1, 2, 3, 4, 5].map((i) => {
                const filled = i <= Math.floor(ratingStars);
                const half = !filled && i - 0.5 <= ratingStars;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Star
                      className="w-7 h-7"
                      style={{
                        color: filled || half ? CYAN : "rgba(34,211,238,0.2)",
                        fill: filled ? CYAN : half ? "url(#halfGrad)" : "transparent",
                        filter: filled || half ? "drop-shadow(0 0 6px #22d3ee)" : undefined,
                      }}
                    />
                  </motion.div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Footer indicators */}
        <div
          className="rounded-xl p-3 flex items-center justify-between text-[10px]"
          style={{
            background: "rgba(2,6,23,0.6)",
            border: "1px solid rgba(34,211,238,0.2)",
          }}
        >
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 animate-pulse" style={{ color: GREEN }} />
            <span style={{ color: "rgba(167,243,208,0.8)" }}>المعالجة البرمجية نشطة</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" style={{ color: CYAN }} />
            <span style={{ color: "rgba(34,211,238,0.8)" }}>تحديث تلقائي كل 30 ثانية</span>
          </div>
          <span style={{ color: "rgba(226,232,240,0.4)" }}>عُتيبي ذكي 🤖 Hub</span>
        </div>
      </main>
    </div>
  );
};

const ChartCard = ({
  icon: Icon, title, subtitle, color, value, children,
}: {
  icon: any; title: string; subtitle: string; color: string; value: string; children: React.ReactNode;
}) => (
  <div
    className="rounded-xl p-4"
    style={{
      background: "rgba(2,6,23,0.6)",
      border: `1px solid ${color}40`,
      boxShadow: `0 0 18px ${color}20, inset 0 0 20px ${color}08`,
    }}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5" style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
        <div>
          <p className="text-xs font-extrabold" style={{ color, textShadow: `0 0 6px ${color}80` }}>{title}</p>
          <p className="text-[9px]" style={{ color: "rgba(226,232,240,0.5)" }}>{subtitle}</p>
        </div>
      </div>
      <span className="text-xs font-black" style={{ color, textShadow: `0 0 6px ${color}` }}>{value}</span>
    </div>
    {children}
  </div>
);

export default DigitalIndicators;
