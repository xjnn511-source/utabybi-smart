import { useState, useRef } from "react";
import {
  FileSearch, ShieldCheck, MapPin, Ruler, FileText, User,
  Loader2, Zap, CheckCircle, UploadCloud, Edit3, Sparkles, Radio, Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
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

// Neon palette — strict Blue/Cyan tech theme (no green, no magenta)
const NEON_PINK = "#00FFFF";   // cyan (kept name to minimize diff)
const NEON_PURPLE = "#3b82f6"; // neon blue
const NEON_VIOLET = "#1d4ed8"; // deep blue

const DeedAnalyzer = () => {
  const [state, setState] = useState<AnalysisState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [deedData, setDeedData] = useState<DeedData | null>(null);
  const [, setEditMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const deedPanelRef = useRef<HTMLDivElement>(null);

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
      toast({ title: "يرجى رفع صورة فقط", variant: "destructive" });
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
      toast({ title: "يرجى رفع صورة الوثيقة أولاً", variant: "destructive" });
      return;
    }

    setState("scanning");
    setScanProgress(0);

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

      if (error) throw new Error(error.message || "فشل الاتصال بالنظام");
      if (data?.error) throw new Error(data.error);

      if (data?.success && data?.data) {
        setTimeout(() => {
          setDeedData(data.data);
          setEditMode(true);
          setState("done");
        }, 400);
      } else {
        throw new Error("لم يتمكن النظام من استخراج البيانات");
      }
    } catch (err: any) {
      console.error("Deed processing error:", err);
      setScanProgress(0);
      setState("error");
      toast({
        title: "فشل المعالجة البرمجية",
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
    setEditMode(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateField = (key: keyof DeedData, value: string) => {
    if (!deedData) return;
    setDeedData({ ...deedData, [key]: value });
  };

  const handleDownload = async () => {
    if (!deedPanelRef.current) return;
    try {
      const dataUrl = await toPng(deedPanelRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#000814",
      });
      const link = document.createElement("a");
      link.download = `deed-${deedData?.deedNumber || "document"}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "تم تحميل الوثيقة الرقمية" });
    } catch (err: any) {
      toast({ title: "فشل التحميل", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "linear-gradient(160deg, #000010 0%, #001428 55%, #000008 100%)",
        border: `1px solid ${NEON_PINK}40`,
        boxShadow: `0 0 40px -8px ${NEON_PINK}40, inset 0 0 30px -10px ${NEON_PURPLE}20`,
      }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            `linear-gradient(${NEON_PINK}15 1px, transparent 1px), linear-gradient(90deg, ${NEON_PINK}15 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: `${NEON_PINK}10`,
            border: `1px solid ${NEON_PINK}80`,
            boxShadow: `0 0 18px ${NEON_PINK}70`,
          }}
        >
          <FileSearch className="w-5 h-5" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 6px ${NEON_PINK})` }} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2
            className="text-sm font-extrabold"
            style={{ color: NEON_PINK, textShadow: `0 0 10px ${NEON_PINK}` }}
          >
            معالجة برمجية مؤتمتة
          </h2>
          <p className="text-[10px]" style={{ color: `${NEON_PURPLE}cc` }}>
            منصة الأتمتة البرمجية للوثائق العقارية — Utaybi Smart AI
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
          style={{
            background: `${NEON_PURPLE}20`,
            border: `1px solid ${NEON_PURPLE}80`,
            color: NEON_PURPLE,
          }}
        >
          <Radio className="w-2.5 h-2.5 animate-pulse" />
          LIVE
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
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-36 mb-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all"
              style={{
                background: "rgba(0,8,20,0.6)",
                border: file ? `2px dashed ${NEON_PURPLE}80` : `2px dashed ${NEON_PINK}60`,
                boxShadow: file
                  ? `inset 0 0 25px ${NEON_PURPLE}25`
                  : `inset 0 0 25px ${NEON_PINK}15`,
              }}
            >
              {file ? (
                <div className="text-center">
                  <CheckCircle className="w-9 h-9 mx-auto mb-2" style={{ color: NEON_PURPLE, filter: `drop-shadow(0 0 8px ${NEON_PURPLE})` }} />
                  <p className="text-xs font-bold" style={{ color: "#f5d0fe" }}>{file.name}</p>
                  <p className="text-[9px] mt-1" style={{ color: `${NEON_PURPLE}99` }}>
                    {(file.size / 1024).toFixed(0)} كيلوبايت — اضغط لتغيير الملف
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-9 h-9 mx-auto mb-2 animate-pulse" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 8px ${NEON_PINK})` }} />
                  <p className="text-xs font-bold" style={{ color: NEON_PINK }}>ارفع صورة الوثيقة العقارية</p>
                  <p className="text-[9px] mt-1" style={{ color: `${NEON_PINK}99` }}>صور فقط — حد أقصى 10 ميجابايت</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLaunch}
              className="w-full h-12 text-sm font-extrabold rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
              style={{
                background: `linear-gradient(135deg, ${NEON_PINK} 0%, ${NEON_VIOLET} 100%)`,
                color: "#fff",
                boxShadow: `0 0 30px ${NEON_PINK}80, 0 0 60px ${NEON_PURPLE}40`,
              }}
            >
              <Zap className="w-4 h-4" strokeWidth={2.5} />
              تشغيل المعالجة البرمجية
            </button>
          </motion.div>
        )}

        {state === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="relative rounded-xl p-6 overflow-hidden"
            style={{
              background: "rgba(0,8,20,0.7)",
              border: `1px solid ${NEON_PINK}60`,
              boxShadow: `inset 0 0 40px ${NEON_PINK}15`,
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute w-full h-1"
                style={{
                  background: `linear-gradient(90deg, transparent, ${NEON_PINK}, transparent)`,
                  boxShadow: `0 0 20px ${NEON_PINK}`,
                  animation: "scanMove 2s ease-in-out infinite",
                }}
              />
            </div>
            <div className="relative z-10 text-center space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: `${NEON_PINK}15`,
                  border: `1px solid ${NEON_PINK}90`,
                  boxShadow: `0 0 30px ${NEON_PINK}80`,
                }}
              >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: NEON_PINK }} />
              </div>
              <p className="text-sm font-bold" style={{ color: NEON_PINK, textShadow: `0 0 10px ${NEON_PINK}` }}>
                جاري المعالجة البرمجية للوثيقة...
              </p>

              <div className="space-y-2">
                {[
                  "قراءة بيانات الوثيقة...",
                  "استخراج رقم الوثيقة والمالك...",
                  "معالجة الموقع والمساحة...",
                  "التحقق من الأتمتة البرمجية...",
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: scanProgress > i * 25 ? 1 : 0.3, x: 0 }}
                    className="flex items-center gap-2 justify-center"
                  >
                    {scanProgress > (i + 1) * 25 ? (
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: NEON_PURPLE }} />
                    ) : (
                      <Zap className="w-3.5 h-3.5 animate-pulse" style={{ color: NEON_PINK }} />
                    )}
                    <span className="text-[11px]" style={{ color: "#f5d0fe" }}>{step}</span>
                  </motion.div>
                ))}
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: `${NEON_PINK}15` }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${NEON_PINK}, ${NEON_PURPLE})`,
                    boxShadow: `0 0 12px ${NEON_PINK}`,
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] font-mono" style={{ color: NEON_PINK }}>{scanProgress}%</p>
            </div>
          </motion.div>
        )}

        {state === "done" && deedData && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative space-y-4"
          >
            {/* Status Banner */}
            <div
              className="rounded-xl p-3 flex items-center justify-between"
              style={{
                background: `${NEON_PURPLE}15`,
                border: `1px solid ${NEON_PURPLE}80`,
                boxShadow: `0 0 20px ${NEON_PURPLE}30`,
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" style={{ color: NEON_PURPLE, filter: `drop-shadow(0 0 6px ${NEON_PURPLE})` }} />
                <span className="text-xs font-bold" style={{ color: NEON_PURPLE }}>
                  تمت المعالجة البرمجية بنجاح
                </span>
              </div>
              <span className="text-[10px] font-extrabold" style={{ color: NEON_PINK }}>
                Utaybi Smart AI
              </span>
            </div>

            {/* Digital Deed — Neon Glassmorphism Panel (downloadable) */}
            <div
              ref={deedPanelRef}
              className="relative rounded-2xl p-5 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, rgba(0,20,40,0.95) 0%, rgba(0,8,20,0.95) 100%)",
                border: `1.5px solid ${NEON_PINK}90`,
                boxShadow: `0 0 35px ${NEON_PINK}50, inset 0 0 40px ${NEON_PURPLE}20`,
                backdropFilter: "blur(14px)",
              }}
            >
              {/* corner ornaments */}
              {[
                { top: 8, left: 8, b: "border-t-2 border-l-2" },
                { top: 8, right: 8, b: "border-t-2 border-r-2" },
                { bottom: 8, left: 8, b: "border-b-2 border-l-2" },
                { bottom: 8, right: 8, b: "border-b-2 border-r-2" },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`absolute w-5 h-5 ${c.b}`}
                  style={{ ...c, borderColor: NEON_PINK, boxShadow: `0 0 8px ${NEON_PINK}` }}
                />
              ))}

              {/* Deed Header */}
              <div className="text-center mb-4 pb-3" style={{ borderBottom: `1px dashed ${NEON_PINK}50` }}>
                <p className="text-[10px] font-bold tracking-widest" style={{ color: NEON_PURPLE }}>
                  UTAYBI SMART AI · DIGITAL DEED CARD
                </p>
                <h3
                  className="text-base font-extrabold mt-1"
                  style={{ color: "#fff", textShadow: `0 0 10px ${NEON_PINK}` }}
                >
                  وثيقة مبايعة رقمية مؤتمتة
                </h3>
                <p className="text-[9px] mt-0.5" style={{ color: `${NEON_PINK}cc` }}>
                  معالجة برمجية مؤتمتة
                </p>
              </div>

              {/* Editable fields */}
              <div className="space-y-2.5">
                {[
                  { key: "deedNumber" as const, label: "رقم الوثيقة", icon: FileText },
                  { key: "owner" as const, label: "المالك", icon: User },
                  { key: "area" as const, label: "المساحة", icon: Ruler },
                  { key: "district" as const, label: "الحي", icon: MapPin },
                  { key: "city" as const, label: "المدينة", icon: MapPin },
                ].map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="rounded-lg p-2.5 transition-all"
                    style={{
                      background: "rgba(0,8,20,0.6)",
                      border: `1px solid ${NEON_PINK}50`,
                      boxShadow: `inset 0 0 12px ${NEON_PINK}15, 0 0 6px ${NEON_PINK}25`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3.5 h-3.5" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 4px ${NEON_PINK})` }} />
                      <p className="text-[10px] font-bold" style={{ color: `${NEON_PINK}dd` }}>{label}</p>
                    </div>
                    <input
                      type="text"
                      value={deedData[key]}
                      placeholder="—"
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold font-cairo rounded px-1 py-0.5"
                      style={{
                        color: "#fff",
                        textShadow: `0 0 8px ${NEON_PINK}`,
                      }}
                    />
                    {key === "district" && deedData.district === "" && (
                      <p className="text-[9px] mt-1" style={{ color: `${NEON_PINK}99` }}>
                        لم يتم استخراج الحي — يرجى الإدخال يدوياً
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer / signature */}
              <div className="mt-4 pt-3 flex items-center justify-between" style={{ borderTop: `1px dashed ${NEON_PINK}50` }}>
                <p className="text-[9px]" style={{ color: `${NEON_PURPLE}cc` }}>
                  © عُتيبي ذكي Hub — منصة برمجية مرخصة
                </p>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 4px ${NEON_PINK})` }} />
                  <span className="text-[9px] font-bold" style={{ color: NEON_PINK }}>VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleDownload}
                className="w-full h-12 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(135deg, ${NEON_PINK} 0%, ${NEON_VIOLET} 100%)`,
                  color: "#fff",
                  boxShadow: `0 0 30px ${NEON_PINK}80, 0 0 60px ${NEON_PURPLE}40`,
                }}
              >
                <Download className="w-4 h-4" strokeWidth={2.5} />
                تحميل الوثيقة
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toast({ title: "تم تأكيد البيانات", description: "تم حفظ المدخلات النهائية للمعالجة البرمجية" })}
                  className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: `${NEON_PINK}15`,
                    border: `1px solid ${NEON_PINK}70`,
                    color: NEON_PINK,
                    boxShadow: `0 0 12px ${NEON_PINK}30`,
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  تأكيد البيانات المستخرجة
                </button>
                <button
                  onClick={handleReset}
                  className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "rgba(0,8,20,0.7)",
                    border: `1px solid ${NEON_PURPLE}60`,
                    color: NEON_PURPLE,
                  }}
                >
                  معالجة وثيقة جديدة
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="watermark" style={{ color: `${NEON_PINK}66` }}>عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default DeedAnalyzer;
