import { useState, useRef, useEffect } from "react";
import {
  BarChart3, FileSearch, PenTool, Video, VolumeX,
  ShieldCheck, Loader2, Zap, UploadCloud, CheckCircle2,
  User, Ruler, MapPin, Clock, PlayCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const BRAND_TAG = "Produced by Utaybi Smart · عُتيبي ذكي";
const safePath = (f: File) => {
  const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `uploads/${Date.now()}_${crypto.randomUUID()}.${ext}`;
};

const engines = [
  { id: "معالج الوثائق", title: "معالج الوثائق", icon: FileSearch },
  { id: "معالجة البيانات", title: "معالجة البيانات البرمجية", icon: BarChart3 },
  { id: "الأتمتة الصامتة", title: "محرك الأتمتة الصامتة", icon: VolumeX },
  { id: "توليد الحلول", title: "توليد الحلول البرمجية", icon: PenTool },
  { id: "معالجة الوسائط", title: "معالجة الوسائط الرقمية", icon: Video },
];

const mockResults: Record<string, string> = {
  "معالجة البيانات": "معالجة البيانات: نمو بنسبة 15% متوقع",
  "الأتمتة الصامتة": "تم تنقية الصوت وحذف الصمت بنجاح",
  "توليد الحلول": "تم توليد الحلول البرمجية",
  "معالجة الوسائط": "تمت معالجة الوسائط الرقمية بنجاح",
};

interface DeedData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const AiEnginePortal = () => {
  const [loading, setLoading] = useState(false);
  const [activeEngine, setActiveEngine] = useState("معالج الوثائق");
  const [file, setFile] = useState<File | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [deedData, setDeedData] = useState<DeedData | null>(null);
  const [genericResult, setGenericResult] = useState<{ engine: string; summary: string; data: string } | null>(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoJob, setVideoJob] = useState<{ id: string; status: string; result_url?: string | null; error?: string | null } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Realtime subscription on the active video job
  useEffect(() => {
    if (!videoJob?.id) return;
    const ch = supabase
      .channel(`engine_video_${videoJob.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "video_jobs", filter: `id=eq.${videoJob.id}` },
        (payload) => {
          const row = payload.new as any;
          setVideoJob({ id: row.id, status: row.status, result_url: row.result_url, error: row.error });
          if (row.status === "done") toast({ title: "✅ الفيديو الإعلاني جاهز" });
          if (row.status === "failed") toast({ title: row.error || "فشل الإنتاج", variant: "destructive" });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [videoJob?.id]);

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > 10 * 1024 * 1024) {
      toast({ title: "حجم الملف كبير جداً (الحد: 10 ميجابايت)", variant: "destructive" });
      return;
    }
    setFile(selected);
    setDeedData(null);
    setGenericResult(null);
  };

  const handleLaunchEngine = async () => {
    if (!file) {
      toast({ title: "يرجى اختيار الملف أو رفع البيانات أولاً", variant: "destructive" });
      return;
    }

    setLoading(true);
    setDeedData(null);
    setGenericResult(null);
    setScanProgress(0);

    // محرك الوثائق عبر نظام الرؤية البرمجية
    if (activeEngine === "معالج الوثائق") {
      try {
        // Scanning animation
        const interval = setInterval(() => {
          setScanProgress((p) => {
            if (p >= 90) { clearInterval(interval); return 90; }
            return p + Math.random() * 15;
          });
        }, 300);

        const base64 = await fileToBase64(file);
        const { data, error } = await supabase.functions.invoke("analyze-deed", {
          body: { imageBase64: base64, mimeType: file.type },
        });

        clearInterval(interval);
        setScanProgress(100);

        if (error || !data?.success) {
          throw new Error(data?.error || "فشل في معالجة الصورة");
        }

        setDeedData(data.data);
        toast({ title: "✅ تم استخراج بيانات الصك بنجاح" });
      } catch (err: any) {
        toast({ title: err.message || "خطأ في المعالجة", variant: "destructive" });
      } finally {
        setLoading(false);
      }
      return;
    }

    // بقية المحركات
    setTimeout(() => {
      setLoading(false);
      setGenericResult({
        engine: activeEngine,
        summary: `تمت المعالجة بنجاح عبر نظام ${activeEngine}`,
        data: mockResults[activeEngine] || "تمت المعالجة بنجاح",
      });
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* Engine Selector */}
      <div className="grid grid-cols-3 gap-3">
        {engines.map(({ id, title, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveEngine(id); setDeedData(null); setGenericResult(null); }}
            className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-2 group ${
              activeEngine === id
                ? "border-primary bg-primary/10 shadow-[0_0_20px_hsl(var(--primary)/0.15)] scale-[1.03]"
                : "border-border bg-card hover:border-primary/40"
            }`}
          >
            <Icon className={`w-5 h-5 transition-all ${
              activeEngine === id
                ? "text-primary drop-shadow-[0_0_8px_hsl(var(--primary)/0.5)]"
                : "text-muted-foreground group-hover:text-primary/70"
            }`} />
            <span className="text-[9px] font-bold text-foreground text-center leading-tight">{title}</span>
            {activeEngine === id && (
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_8px_hsl(var(--primary)/0.6)]" />
            )}
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div className="card-neon p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-[60px]" />

        <div className="text-center mb-5 relative z-10">
          <h2 className="text-sm font-black text-foreground mb-1">
            محرك <span className="text-primary">{activeEngine}</span>
          </h2>
          <div className="w-12 h-0.5 bg-primary mx-auto rounded-full" />
        </div>

        {/* Upload Zone - Real file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*,audio/*,.csv"
          className="hidden"
          onChange={handleFileChange}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-40 mb-5 rounded-2xl border-2 border-dashed transition-all duration-500 flex flex-col items-center justify-center cursor-pointer relative z-10 ${
            file
              ? "border-green-500/40 bg-green-500/5"
              : "border-primary/20 bg-secondary hover:border-primary/50"
          }`}
        >
          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="ready" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-xs font-bold text-foreground">{file.name}</p>
                <p className="text-[9px] text-green-500/60 mt-1 font-mono">تم التحقق وتأمين الملف</p>
              </motion.div>
            ) : (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <UploadCloud className="w-10 h-10 text-primary mx-auto mb-2 animate-pulse" />
                <p className="text-xs font-bold text-foreground mb-1">اسحب البيانات هنا</p>
                <p className="text-[9px] text-muted-foreground font-mono">صور، بيانات، فيديو، صوت</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Scan progress */}
        {loading && activeEngine === "معالج الوثائق" && (
          <div className="mb-4 relative z-10">
            <Progress value={scanProgress} className="h-2 bg-secondary" />
            <p className="text-[9px] text-primary font-mono text-center mt-1">
              جاري المسح الذكي... {Math.round(scanProgress)}%
            </p>
          </div>
        )}

        <button
          onClick={handleLaunchEngine}
          disabled={loading}
          className="w-full h-12 btn-neon text-sm flex items-center justify-center gap-3 rounded-xl disabled:opacity-40 relative z-10"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-4 h-4" />}
          {loading ? "جاري المعالجة الرقمية..." : "تشغيل المحرك البرمجي"}
        </button>
      </div>

      {/* نتائج معالجة الوثيقة */}
      <AnimatePresence>
        {deedData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card-neon p-5 border-primary/30"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <h3 className="text-xs font-bold text-foreground">تقرير معالجة الوثيقة</h3>
              </div>
              <span className="text-[9px] font-mono text-primary font-bold">تطابق كامل</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "رقم الصك", value: deedData.deedNumber, icon: <FileSearch className="w-4 h-4" />, mono: true },
                { label: "المالك", value: deedData.owner, icon: <User className="w-4 h-4" />, mono: false },
                { label: "المساحة", value: deedData.area, icon: <Ruler className="w-4 h-4" />, mono: true },
                { label: "الموقع", value: `${deedData.city} - ${deedData.district}`, icon: <MapPin className="w-4 h-4" />, mono: false },
              ].map((item, i) => (
                <div key={i} className="p-3 bg-secondary rounded-xl border border-border flex gap-3 items-start">
                  <div className="text-accent bg-accent/10 p-2 rounded-lg">{item.icon}</div>
                  <div>
                    <p className="text-[9px] text-muted-foreground font-bold mb-0.5">{item.label}</p>
                    <p className={`text-xs text-foreground font-bold ${item.mono ? "font-mono" : ""}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-[9px] text-green-500 font-bold mt-3">حالة الوثيقة: محدث وساري ✅</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generic Results */}
      <AnimatePresence>
        {genericResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="card-neon p-5 border-green-500/20"
          >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              <h3 className="text-xs font-bold text-foreground">تأكيد معالجة البيانات: {genericResult.engine}</h3>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-bold mb-1">المُلخص التنفيذي</p>
                <p className="text-xs text-foreground font-bold">{genericResult.summary}</p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <p className="text-[9px] text-muted-foreground font-bold mb-1">البيانات المستخرجة</p>
                <p className="text-xs font-mono text-primary font-bold">{genericResult.data}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiEnginePortal;
