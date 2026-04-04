import { useState } from "react";
import { FileSearch, ShieldCheck, MapPin, Ruler, FileText, User, Loader2, Zap, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AnalysisState = "idle" | "scanning" | "done";

const DeedAnalyzer = () => {
  const [state, setState] = useState<AnalysisState>("idle");
  const [scanProgress, setScanProgress] = useState(0);

  const handleLaunch = () => {
    setState("scanning");
    setScanProgress(0);

    const steps = [10, 25, 40, 55, 70, 85, 95, 100];
    steps.forEach((p, i) => {
      setTimeout(() => {
        setScanProgress(p);
        if (p === 100) {
          setTimeout(() => setState("done"), 400);
        }
      }, (i + 1) * 350);
    });
  };

  const handleReset = () => {
    setState("idle");
    setScanProgress(0);
  };

  return (
    <div className="card-neon p-5 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 glow-gold">
          <FileSearch className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">محلل الصكوك الذكي Ai</h2>
          <p className="text-[10px] text-muted-foreground">تحليل صك عقاري فوري بدقة 100%</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <textarea
              className="w-full h-28 p-4 bg-secondary rounded-2xl border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors resize-none mb-4"
              placeholder="الصق بيانات الصك هنا للتحليل الذكي..."
            />
            <button
              onClick={handleLaunch}
              className="w-full h-12 btn-neon text-sm flex items-center justify-center gap-3 rounded-xl"
            >
              <Zap className="w-4 h-4" strokeWidth={2} />
              تشغيل المحرك الذكي (Launch)
            </button>
          </motion.div>
        )}

        {state === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl border border-primary/20 bg-secondary p-6 relative overflow-hidden"
          >
            {/* Scanning animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="scan-line absolute w-full" />
            </div>

            <div className="relative z-10 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse-glow">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-sm font-bold text-primary">جاري مسح وتحليل الصك...</p>
              
              <div className="space-y-2">
                {["قراءة بيانات الصك...", "استخراج رقم الصك والمالك...", "تحليل الموقع والمساحة...", "التحقق من صلاحية الصك..."].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: scanProgress > i * 25 ? 1 : 0.3, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="flex items-center gap-2 justify-center"
                  >
                    {scanProgress > (i + 1) * 25 ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Zap className="w-3.5 h-3.5 text-primary animate-pulse" />
                    )}
                    <span className="text-[11px] text-muted-foreground text-center">{step}</span>
                  </motion.div>
                ))}
              </div>

              <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-l from-primary to-primary/60 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] text-primary/70 font-mono text-center">{scanProgress}%</p>
            </div>
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Status Banner */}
            <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-green-500" />
                <span className="text-sm font-bold text-green-400">حالة الصك: محدث وساري ✅</span>
              </div>
              <span className="text-xs font-black text-primary">دقة 100%</span>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <FileText className="w-4 h-4 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground">رقم الصك</p>
                <p className="text-sm font-bold text-foreground font-mono">09487333847</p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <Ruler className="w-4 h-4 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground">المساحة</p>
                <p className="text-sm font-bold text-foreground">500 م²</p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <User className="w-4 h-4 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground">المالك</p>
                <p className="text-sm font-bold text-foreground">خالد العتيبي</p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <MapPin className="w-4 h-4 text-red-400 mb-2" />
                <p className="text-[10px] text-muted-foreground">الموقع</p>
                <p className="text-sm font-bold text-foreground">الرياض - حي النرجس</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-xl flex items-center justify-center gap-2 hover:border-primary transition-all"
            >
              تحليل صك جديد
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="watermark">عُتيبي ذكي Ai 🤖</span>
    </div>
  );
};

export default DeedAnalyzer;
