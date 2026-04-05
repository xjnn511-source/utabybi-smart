import { useState, useRef } from "react";
import {
  FileSearch, ShieldCheck, MapPin, Ruler, FileText, User,
  Loader2, Zap, CheckCircle, UploadCloud, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AnalysisState = "idle" | "scanning" | "done" | "error";

interface DeedData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

const DeedAnalyzer = () => {
  const [state, setState] = useState<AnalysisState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [deedData, setDeedData] = useState<DeedData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(f);
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      toast({ title: "يرجى رفع صورة فقط (JPG, PNG)", variant: "destructive" });
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast({ title: "حجم الملف كبير جداً (الحد: 10MB)", variant: "destructive" });
      return;
    }
    setFile(selected);
    setDeedData(null);
    setState("idle");
  };

  const handleLaunch = async () => {
    if (!file) {
      toast({ title: "يرجى رفع صورة الصك أولاً", variant: "destructive" });
      return;
    }

    setState("scanning");
    setScanProgress(0);

    // Animate progress
    const progressSteps = [10, 25, 40, 55, 70, 80];
    progressSteps.forEach((p, i) => {
      setTimeout(() => setScanProgress(p), (i + 1) * 400);
    });

    try {
      const base64 = await fileToBase64(file);
      setScanProgress(85);

      const { data, error } = await supabase.functions.invoke("analyze-deed", {
        body: { imageBase64: base64, mimeType: file.type },
      });

      setScanProgress(100);

      if (error) {
        throw new Error(error.message || "فشل الاتصال بالنظام");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.success && data?.data) {
        setTimeout(() => {
          setDeedData(data.data);
          setState("done");
        }, 400);
      } else {
        throw new Error("لم يتمكن النظام من استخراج البيانات");
      }
    } catch (err: any) {
      console.error("Deed analysis error:", err);
      setScanProgress(0);
      setState("error");
      toast({
        title: "فشل التحليل",
        description: err.message || "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setState("idle");
    setScanProgress(0);
    setFile(null);
    setDeedData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="card-neon p-5 relative overflow-hidden">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 glow-gold">
          <FileSearch className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">محلل الصكوك الذكي Ai</h2>
          <p className="text-[10px] text-muted-foreground">تحليل صك عقاري فوري بالذكاء الاصطناعي</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {(state === "idle" || state === "error") && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-32 mb-4 rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center cursor-pointer ${
                file
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-primary/20 bg-secondary hover:border-primary/50"
              }`}
            >
              {file ? (
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-foreground">{file.name}</p>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(0)} KB — اضغط لتغيير الملف
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
                  <p className="text-xs font-bold text-foreground">ارفع صورة الصك هنا</p>
                  <p className="text-[9px] text-muted-foreground mt-1">JPG, PNG — حد أقصى 10MB</p>
                </div>
              )}
            </div>

            {state === "error" && (
              <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <p className="text-[10px] text-destructive font-bold">فشل التحليل — يرجى المحاولة مرة أخرى</p>
              </div>
            )}

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
            <div className="absolute inset-0 overflow-hidden">
              <div className="scan-line absolute w-full" />
            </div>

            <div className="relative z-10 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center animate-pulse-glow">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <p className="text-sm font-bold text-primary">جاري مسح وتحليل الصك...</p>

              <div className="space-y-2">
                {[
                  "قراءة بيانات الصك...",
                  "استخراج رقم الصك والمالك...",
                  "تحليل الموقع والمساحة...",
                  "التحقق من صلاحية الصك...",
                ].map((step, i) => (
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

        {state === "done" && deedData && (
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
                <span className="text-sm font-bold text-green-400">تم استخراج البيانات بنجاح ✅</span>
              </div>
              <span className="text-xs font-black text-primary">Vision AI</span>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <FileText className="w-4 h-4 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground">رقم الصك</p>
                <p className="text-sm font-bold text-foreground font-mono">{deedData.deedNumber}</p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <Ruler className="w-4 h-4 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground">المساحة</p>
                <p className="text-sm font-bold text-foreground">{deedData.area}</p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <User className="w-4 h-4 text-primary mb-2" />
                <p className="text-[10px] text-muted-foreground">المالك</p>
                <p className="text-sm font-bold text-foreground">{deedData.owner}</p>
              </div>
              <div className="p-4 bg-secondary rounded-2xl border border-border">
                <MapPin className="w-4 h-4 text-red-400 mb-2" />
                <p className="text-[10px] text-muted-foreground">الموقع</p>
                <p className="text-sm font-bold text-foreground">
                  {deedData.city} - {deedData.district}
                </p>
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
