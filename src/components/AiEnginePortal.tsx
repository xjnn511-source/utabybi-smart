import { useState } from "react";
import {
  BarChart3, FileSearch, PenTool, Video, VolumeX,
  ShieldCheck, Loader2, Zap, UploadCloud, CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const engines = [
  { id: "Analyst", title: "Smart Data Analyst", icon: BarChart3 },
  { id: "OCR", title: "Document OCR", icon: FileSearch },
  { id: "Silencer", title: "The Silencer", icon: VolumeX },
  { id: "Content", title: "Creative Content", icon: PenTool },
  { id: "Video", title: "Video Montage", icon: Video },
];

const engineResults: Record<string, string> = {
  OCR: "استخراج رقم الصك: 108827364 | المساحة: 620م²",
  Analyst: "تحليل البيانات: نمو بنسبة 15% متوقع",
  Silencer: "تم تنقية الصوت وحذف الصمت بنجاح",
  Content: "تم توليد المحتوى الذكي",
  Video: "تم إنشاء مونتاج الفيديو بنجاح",
};

const AiEnginePortal = () => {
  const [loading, setLoading] = useState(false);
  const [activeEngine, setActiveEngine] = useState("Analyst");
  const [file, setFile] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    engine: string;
    summary: string;
    data: string;
  } | null>(null);

  const handleLaunchEngine = () => {
    if (!file) {
      alert("يرجى اختيار الملف أو رفع البيانات أولاً");
      return;
    }
    setLoading(true);
    setAnalysisResult(null);

    setTimeout(() => {
      setLoading(false);
      setAnalysisResult({
        engine: activeEngine,
        summary: `تمت المعالجة بنجاح عبر نظام ${activeEngine}`,
        data: engineResults[activeEngine] || "تمت المعالجة بنجاح",
      });
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Engine Selector Grid */}
      <div className="grid grid-cols-3 gap-3">
        {engines.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveEngine(id)}
            className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group ${
              activeEngine === id
                ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)] scale-[1.03]"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <Icon
              className={`w-5 h-5 transition-all ${
                activeEngine === id
                  ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                  : "text-muted-foreground group-hover:text-primary/70"
              }`}
            />
            <span className="text-[9px] font-bold text-foreground text-center leading-tight">
              {title}
            </span>
            {activeEngine === id && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
            )}
          </button>
        ))}
      </div>

      {/* Dynamic Workspace */}
      <div className="card-neon p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[60px]" />

        <div className="text-center mb-5 relative z-10">
          <h2 className="text-sm font-black text-foreground mb-1">
            محرك <span className="text-primary">{activeEngine}</span>
          </h2>
          <div className="w-12 h-0.5 bg-primary mx-auto rounded-full" />
        </div>

        {/* Upload Zone */}
        <div
          onClick={() => setFile(true)}
          className={`w-full h-40 mb-5 rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer relative z-10 ${
            file
              ? "border-green-500/40 bg-green-500/5"
              : "border-primary/20 bg-secondary hover:border-primary/50"
          }`}
        >
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="ready"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground">الملف جاهز للمعالجة</p>
                <p className="text-[9px] text-green-500/60 mt-1 font-mono">System Secured & Verified</p>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <UploadCloud className="w-10 h-10 text-primary mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-bold text-foreground mb-1">اسحب البيانات هنا</p>
                <p className="text-[9px] text-muted-foreground font-mono">
                  JPG, PNG, CSV, MP4, MP3
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLaunchEngine}
          disabled={loading}
          className="w-full h-12 btn-neon text-sm flex items-center justify-center gap-3 rounded-xl disabled:opacity-40 relative z-10"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          {loading ? "جاري المعالجة الرقمية..." : "تشغيل المحرك الذكي (LAUNCH)"}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card-neon p-5 border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <h3 className="text-xs font-bold text-foreground">
                تأكيد معالجة البيانات: {analysisResult.engine}
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-bold mb-1">المُلخص التنفيذي</p>
                <p className="text-xs text-foreground font-bold leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-bold mb-1">البيانات المستخرجة</p>
                <p className="text-xs font-mono text-primary font-bold">
                  {analysisResult.data}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiEnginePortal;
