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
                background: `${NEON_PINK}10`,
                border: `1px solid ${NEON_PINK}70`,
                boxShadow: `0 0 20px ${NEON_PINK}30`,
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 6px ${NEON_PINK})` }} />
                <span className="text-xs font-bold" style={{ color: NEON_PINK }}>
                  تمت المعالجة البرمجية بنجاح
                </span>
              </div>
              <span className="text-[10px] font-extrabold tracking-widest" style={{ color: NEON_PINK }}>
                UTAYBI · SMART AI
              </span>
            </div>

            {/* 3-Panel Tactical Dashboard */}
            <div
              ref={deedPanelRef}
              className="relative rounded-2xl p-3 sm:p-4 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #000814 0%, #001428 60%, #000008 100%)",
                border: `1.5px solid ${NEON_PINK}80`,
                boxShadow: `0 0 35px ${NEON_PINK}40, inset 0 0 50px ${NEON_PINK}10`,
              }}
            >
              {/* grid background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `linear-gradient(${NEON_PINK}30 1px, transparent 1px), linear-gradient(90deg, ${NEON_PINK}30 1px, transparent 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              {/* corner ornaments */}
              {[
                { top: 6, left: 6, b: "border-t-2 border-l-2" },
                { top: 6, right: 6, b: "border-t-2 border-r-2" },
                { bottom: 6, left: 6, b: "border-b-2 border-l-2" },
                { bottom: 6, right: 6, b: "border-b-2 border-r-2" },
              ].map((c, i) => (
                <div key={i} className={`absolute w-5 h-5 ${c.b}`} style={{ ...c, borderColor: NEON_PINK, boxShadow: `0 0 8px ${NEON_PINK}` }} />
              ))}

              {/* Title bar */}
              <div className="relative text-center mb-3 pb-2" style={{ borderBottom: `1px dashed ${NEON_PINK}50` }}>
                <p className="text-[10px] font-bold tracking-[0.3em]" style={{ color: `${NEON_PINK}cc` }}>
                  TACTICAL REAL-ESTATE INTERFACE
                </p>
                <h3 className="text-base font-extrabold mt-0.5" style={{ color: "#fff", textShadow: `0 0 10px ${NEON_PINK}` }}>
                  وثيقة مبايعة رقمية مؤتمتة
                </h3>
              </div>

              {/* 3 panels */}
              <div className="relative grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* LEFT: Digital Deed */}
                <div
                  className="rounded-xl p-3 relative"
                  style={{
                    background: "rgba(0,8,20,0.7)",
                    border: `1px solid ${NEON_PINK}60`,
                    boxShadow: `inset 0 0 18px ${NEON_PINK}15, 0 0 14px ${NEON_PINK}25`,
                  }}
                >
                  <p className="text-[9px] font-bold tracking-widest mb-2" style={{ color: `${NEON_PINK}aa` }}>
                    01 · DIGITAL DEED
                  </p>
                  <div className="flex justify-center mb-2">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{
                        background: `radial-gradient(circle, ${NEON_PINK}25 0%, transparent 70%)`,
                        border: `1.5px solid ${NEON_PINK}`,
                        boxShadow: `0 0 14px ${NEON_PINK}`,
                      }}
                    >
                      <svg viewBox="0 0 64 64" className="w-8 h-8" fill="none" stroke={NEON_PINK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 4px ${NEON_PINK})` }}>
                        <path d="M32 50 L32 28" />
                        <path d="M32 28 C 22 22, 16 24, 14 30" />
                        <path d="M32 28 C 42 22, 48 24, 50 30" />
                        <path d="M32 28 C 26 18, 22 16, 18 18" />
                        <path d="M32 28 C 38 18, 42 16, 46 18" />
                        <path d="M32 28 C 30 20, 32 14, 32 12" />
                        <path d="M14 54 L30 42" />
                        <path d="M50 54 L34 42" />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-center">
                    <p className="text-[9px]" style={{ color: `${NEON_PINK}99` }}>المالك</p>
                    <p className="text-sm font-extrabold" style={{ color: "#fff", textShadow: `0 0 8px ${NEON_PINK}` }}>{deedData.owner || "—"}</p>
                    <p className="text-[9px] mt-2" style={{ color: `${NEON_PINK}99` }}>رقم الوثيقة</p>
                    <p className="text-xs font-bold font-mono" style={{ color: NEON_PINK, textShadow: `0 0 6px ${NEON_PINK}` }}>{deedData.deedNumber || "—"}</p>
                    <p className="text-[9px] mt-2" style={{ color: `${NEON_PINK}99` }}>المساحة</p>
                    <p className="text-xs font-bold" style={{ color: "#fff", textShadow: `0 0 6px ${NEON_PINK}` }}>{deedData.area || "—"} م²</p>
                  </div>
                </div>

                {/* MIDDLE: Pulse / Radar */}
                <div
                  className="rounded-xl p-3 relative flex flex-col items-center justify-center"
                  style={{
                    background: "rgba(0,8,20,0.7)",
                    border: `1px solid ${NEON_PINK}60`,
                    boxShadow: `inset 0 0 18px ${NEON_PINK}15, 0 0 14px ${NEON_PINK}25`,
                  }}
                >
                  <p className="text-[9px] font-bold tracking-widest mb-2 self-start" style={{ color: `${NEON_PINK}aa` }}>
                    02 · PULSE MATCH
                  </p>
                  <div className="relative w-40 h-40 my-1">
                    {/* pulse rings */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full"
                        style={{ border: `1.5px solid ${NEON_PINK}`, boxShadow: `0 0 12px ${NEON_PINK}` }}
                        initial={{ scale: 0.4, opacity: 0.8 }}
                        animate={{ scale: 1, opacity: 0 }}
                        transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.8, ease: "easeOut" }}
                      />
                    ))}
                    {/* radar sweep */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, ${NEON_PINK}55 30deg, transparent 60deg)`,
                        maskImage: "radial-gradient(circle, black 60%, transparent 100%)",
                      }}
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    {/* center disk */}
                    <div
                      className="absolute inset-6 rounded-full flex flex-col items-center justify-center"
                      style={{
                        background: `radial-gradient(circle, ${NEON_PINK}25 0%, rgba(0,8,20,0.95) 70%)`,
                        border: `1.5px solid ${NEON_PINK}`,
                        boxShadow: `0 0 18px ${NEON_PINK}, inset 0 0 18px ${NEON_PINK}40`,
                      }}
                    >
                      <p className="text-2xl font-black" style={{ color: "#fff", textShadow: `0 0 10px ${NEON_PINK}` }}>100%</p>
                      <p className="text-[9px] font-bold mt-0.5" style={{ color: NEON_PINK }}>MATCH</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <Radio className="w-3 h-3 animate-pulse" style={{ color: NEON_PINK }} />
                    <span className="text-[10px] font-bold" style={{ color: NEON_PINK }}>تطابق رقمي مكتمل</span>
                  </div>
                </div>

                {/* RIGHT: Stylized Map */}
                <div
                  className="rounded-xl p-3 relative overflow-hidden"
                  style={{
                    background: "rgba(0,8,20,0.7)",
                    border: `1px solid ${NEON_PINK}60`,
                    boxShadow: `inset 0 0 18px ${NEON_PINK}15, 0 0 14px ${NEON_PINK}25`,
                  }}
                >
                  <p className="text-[9px] font-bold tracking-widest mb-2" style={{ color: `${NEON_PINK}aa` }}>
                    03 · GEO LOCATOR
                  </p>
                  <div
                    className="relative h-44 rounded-lg overflow-hidden"
                    style={{
                      background: "radial-gradient(ellipse at center, #002a4a 0%, #000814 80%)",
                      border: `1px solid ${NEON_PINK}40`,
                    }}
                  >
                    {/* map grid */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 180" preserveAspectRatio="none">
                      <defs>
                        <pattern id="mapgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 20 0 L 0 0 0 20" fill="none" stroke={`${NEON_PINK}30`} strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="200" height="180" fill="url(#mapgrid)" />
                      {/* roads */}
                      <path d="M 0 90 Q 80 70 200 100" stroke={`${NEON_PINK}80`} strokeWidth="1" fill="none" />
                      <path d="M 100 0 Q 90 80 110 180" stroke={`${NEON_PINK}60`} strokeWidth="1" fill="none" />
                      <path d="M 30 30 L 170 150" stroke={`${NEON_PINK}40`} strokeWidth="0.6" fill="none" strokeDasharray="3 3" />
                      {/* district blobs */}
                      <path d="M 60 60 Q 80 50 95 70 Q 90 95 70 90 Z" fill={`${NEON_PINK}15`} stroke={`${NEON_PINK}50`} strokeWidth="0.6" />
                      <path d="M 120 100 Q 145 95 150 120 Q 130 135 115 125 Z" fill={`${NEON_PINK}10`} stroke={`${NEON_PINK}40`} strokeWidth="0.6" />
                    </svg>

                    {/* glowing pin */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
                      <motion.div
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                        className="absolute -inset-3 rounded-full"
                        style={{ background: `${NEON_PINK}40`, filter: "blur(8px)" }}
                      />
                      <MapPin className="w-7 h-7 relative" style={{ color: NEON_PINK, fill: NEON_PINK, filter: `drop-shadow(0 0 10px ${NEON_PINK})` }} />
                    </div>

                    {/* coordinates label */}
                    <div
                      className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded text-center"
                      style={{
                        background: "rgba(0,8,20,0.85)",
                        border: `1px solid ${NEON_PINK}50`,
                      }}
                    >
                      <p className="text-[10px] font-extrabold" style={{ color: "#fff", textShadow: `0 0 6px ${NEON_PINK}` }}>
                        {deedData.district || "—"} · {deedData.city || "—"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom 4 icon summary */}
              <div className="relative grid grid-cols-4 gap-2 mt-4">
                {[
                  { key: "deedNumber" as const, label: "رقم الوثيقة", icon: FileText },
                  { key: "owner" as const, label: "المالك", icon: User },
                  { key: "area" as const, label: "المساحة", icon: Ruler },
                  { key: "district" as const, label: "الموقع", icon: MapPin },
                ].map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="rounded-lg p-2 text-center"
                    style={{
                      background: "rgba(0,8,20,0.8)",
                      border: `1px solid ${NEON_PINK}60`,
                      boxShadow: `inset 0 0 10px ${NEON_PINK}15, 0 0 8px ${NEON_PINK}20`,
                    }}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 4px ${NEON_PINK})` }} />
                    <p className="text-[9px]" style={{ color: `${NEON_PINK}aa` }}>{label}</p>
                    <p className="text-[10px] font-bold truncate mt-0.5" style={{ color: "#fff", textShadow: `0 0 4px ${NEON_PINK}` }}>
                      {deedData[key] || "—"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="relative mt-3 pt-2 flex items-center justify-between" style={{ borderTop: `1px dashed ${NEON_PINK}50` }}>
                <p className="text-[9px]" style={{ color: `${NEON_PINK}aa` }}>© عُتيبي ذكي Hub — منصة برمجية مرخصة</p>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 4px ${NEON_PINK})` }} />
                  <span className="text-[9px] font-bold" style={{ color: NEON_PINK }}>VERIFIED</span>
                </div>
              </div>
            </div>

            {/* Inline editable correction row (dynamic, not table) */}
            <div
              className="rounded-xl p-3"
              style={{
                background: "rgba(0,8,20,0.7)",
                border: `1px solid ${NEON_PINK}40`,
              }}
            >
              <p className="text-[10px] font-bold mb-2" style={{ color: `${NEON_PINK}cc` }}>
                تعديل البيانات المستخرجة (اختياري)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "owner" as const, ph: "اسم المالك" },
                  { key: "deedNumber" as const, ph: "رقم الوثيقة" },
                  { key: "area" as const, ph: "المساحة" },
                  { key: "district" as const, ph: "الحي" },
                  { key: "city" as const, ph: "المدينة" },
                ]).map(({ key, ph }) => (
                  <input
                    key={key}
                    type="text"
                    value={deedData[key]}
                    placeholder={ph}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="bg-transparent outline-none text-xs font-bold font-cairo rounded px-2 py-1.5"
                    style={{
                      color: "#fff",
                      border: `1px solid ${NEON_PINK}50`,
                      textShadow: `0 0 6px ${NEON_PINK}`,
                    }}
                  />
                ))}
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
