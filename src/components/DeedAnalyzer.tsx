import { useState, useRef } from "react";
import {
  FileSearch, ShieldCheck, MapPin, Ruler, FileText, User,
  Loader2, Zap, CheckCircle, UploadCloud, AlertCircle, Edit3, Sparkles, Radio,
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

// No hardcoded data — extraction comes 100% from the uploaded image

const DeedAnalyzer = () => {
  const [state, setState] = useState<AnalysisState>("idle");
  const [scanProgress, setScanProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [deedData, setDeedData] = useState<DeedData | null>(null);
  const [editMode, setEditMode] = useState(false);
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
          setEditMode(true); // open edit mode so user can correct any OCR mistake
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

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "linear-gradient(160deg, #020617 0%, #061226 60%, #03161a 100%)",
        border: "1px solid rgba(34, 211, 238, 0.25)",
        boxShadow: "0 0 40px -8px rgba(34, 211, 238, 0.25), inset 0 0 30px -10px rgba(16, 185, 129, 0.08)",
      }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,211,238,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: "rgba(34, 211, 238, 0.08)",
            border: "1px solid rgba(34, 211, 238, 0.5)",
            boxShadow: "0 0 18px rgba(34, 211, 238, 0.45)",
          }}
        >
          <FileSearch className="w-5 h-5" style={{ color: "#22d3ee", filter: "drop-shadow(0 0 6px #22d3ee)" }} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h2
            className="text-sm font-extrabold"
            style={{ color: "#22d3ee", textShadow: "0 0 10px rgba(34,211,238,0.6)" }}
          >
            معالجة البيانات العقارية التقنية
          </h2>
          <p className="text-[10px]" style={{ color: "rgba(167, 243, 208, 0.7)" }}>
            منصة الأتمتة البرمجية للوثائق العقارية — Enterprise Edition
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
          style={{
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.5)",
            color: "#34d399",
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
                background: "rgba(2, 6, 23, 0.6)",
                border: file ? "2px dashed rgba(16,185,129,0.6)" : "2px dashed rgba(34,211,238,0.4)",
                boxShadow: file
                  ? "inset 0 0 25px rgba(16,185,129,0.15)"
                  : "inset 0 0 25px rgba(34,211,238,0.1)",
              }}
            >
              {file ? (
                <div className="text-center">
                  <CheckCircle className="w-9 h-9 mx-auto mb-2" style={{ color: "#10b981", filter: "drop-shadow(0 0 8px #10b981)" }} />
                  <p className="text-xs font-bold" style={{ color: "#a7f3d0" }}>{file.name}</p>
                  <p className="text-[9px] mt-1" style={{ color: "rgba(167,243,208,0.5)" }}>
                    {(file.size / 1024).toFixed(0)} كيلوبايت — اضغط لتغيير الملف
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-9 h-9 mx-auto mb-2 animate-pulse" style={{ color: "#22d3ee", filter: "drop-shadow(0 0 8px #22d3ee)" }} />
                  <p className="text-xs font-bold" style={{ color: "#22d3ee" }}>ارفع صورة الوثيقة العقارية</p>
                  <p className="text-[9px] mt-1" style={{ color: "rgba(34,211,238,0.6)" }}>صور فقط — حد أقصى 10 ميجابايت</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLaunch}
              className="w-full h-12 text-sm font-extrabold rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                color: "#020617",
                boxShadow: "0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(16,185,129,0.25)",
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
              background: "rgba(2, 6, 23, 0.7)",
              border: "1px solid rgba(34,211,238,0.4)",
              boxShadow: "inset 0 0 40px rgba(34,211,238,0.1)",
            }}
          >
            <div className="absolute inset-0 overflow-hidden">
              <div
                className="absolute w-full h-1"
                style={{
                  background: "linear-gradient(90deg, transparent, #22d3ee, transparent)",
                  boxShadow: "0 0 20px #22d3ee",
                  animation: "scanMove 2s ease-in-out infinite",
                }}
              />
            </div>
            <div className="relative z-10 text-center space-y-4">
              <div
                className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(34,211,238,0.1)",
                  border: "1px solid rgba(34,211,238,0.6)",
                  boxShadow: "0 0 30px rgba(34,211,238,0.5)",
                }}
              >
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#22d3ee" }} />
              </div>
              <p className="text-sm font-bold" style={{ color: "#22d3ee", textShadow: "0 0 10px #22d3ee" }}>
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
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: "#10b981" }} />
                    ) : (
                      <Zap className="w-3.5 h-3.5 animate-pulse" style={{ color: "#22d3ee" }} />
                    )}
                    <span className="text-[11px]" style={{ color: "rgba(167,243,208,0.85)" }}>{step}</span>
                  </motion.div>
                ))}
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(34,211,238,0.1)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #22d3ee, #10b981)",
                    boxShadow: "0 0 12px #22d3ee",
                  }}
                  initial={{ width: "0%" }}
                  animate={{ width: `${scanProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] font-mono" style={{ color: "#22d3ee" }}>{scanProgress}%</p>
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
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.5)",
                boxShadow: "0 0 20px rgba(16,185,129,0.2)",
              }}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" style={{ color: "#10b981", filter: "drop-shadow(0 0 6px #10b981)" }} />
                <span className="text-xs font-bold" style={{ color: "#34d399" }}>
                  تمت المعالجة البرمجية بنجاح
                </span>
              </div>
              <span className="text-[10px] font-extrabold" style={{ color: "#22d3ee" }}>
                Enterprise SaaS
              </span>
            </div>

            {/* Two-column: Data Panel + Map */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* Editable Neon Data Panel */}
              <div className="md:col-span-3 space-y-2.5">
                {[
                  { key: "deedNumber" as const, label: "رقم الوثيقة", icon: FileText, color: "#22d3ee" },
                  { key: "owner" as const, label: "المالك", icon: User, color: "#10b981" },
                  { key: "area" as const, label: "المساحة", icon: Ruler, color: "#22d3ee" },
                  { key: "district" as const, label: "الحي", icon: MapPin, color: "#10b981" },
                  { key: "city" as const, label: "المدينة", icon: MapPin, color: "#22d3ee" },
                ].map(({ key, label, icon: Icon, color }) => (
                  <div
                    key={key}
                    className="rounded-lg p-2.5 transition-all"
                    style={{
                      background: "rgba(2,6,23,0.7)",
                      border: `1px solid ${color}40`,
                      boxShadow: `inset 0 0 12px ${color}15, 0 0 8px ${color}20`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Icon className="w-3 h-3" style={{ color, filter: `drop-shadow(0 0 4px ${color})` }} />
                      <p className="text-[10px] font-bold" style={{ color: `${color}cc` }}>{label}</p>
                    </div>
                    <input
                      type="text"
                      value={deedData[key]}
                      placeholder="—"
                      onChange={(e) => updateField(key, e.target.value)}
                      className="w-full bg-transparent outline-none text-sm font-bold font-cairo focus:ring-1 rounded px-1 py-0.5"
                      style={{
                        color: "#a7f3d0",
                        textShadow: `0 0 6px ${color}80`,
                      }}
                    />
                    {key === "district" && deedData.district === "" && (
                      <p className="text-[9px] mt-1" style={{ color: "rgba(34,211,238,0.6)" }}>
                        لم يتم استخراج الحي — يرجى الإدخال يدوياً
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Map */}
              <div
                className="md:col-span-2 relative rounded-lg overflow-hidden min-h-[260px]"
                style={{
                  background: "linear-gradient(135deg, #020617 0%, #052028 100%)",
                  border: "1px solid rgba(34,211,238,0.4)",
                  boxShadow: "0 0 20px rgba(34,211,238,0.25), inset 0 0 30px rgba(34,211,238,0.08)",
                }}
              >
                {/* Map grid pattern */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(34,211,238,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.2) 1px, transparent 1px)",
                    backgroundSize: "18px 18px",
                  }}
                />
                {/* Stylized streets */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 260" preserveAspectRatio="none">
                  <path d="M 0 80 L 200 90" stroke="#22d3ee" strokeWidth="0.4" opacity="0.5" />
                  <path d="M 0 160 L 200 150" stroke="#22d3ee" strokeWidth="0.4" opacity="0.5" />
                  <path d="M 60 0 L 70 260" stroke="#22d3ee" strokeWidth="0.4" opacity="0.5" />
                  <path d="M 140 0 L 130 260" stroke="#22d3ee" strokeWidth="0.4" opacity="0.5" />
                  {/* Neighborhood polygon with neon pulse */}
                  <polygon
                    points="55,75 145,82 138,165 62,160"
                    fill="rgba(16,185,129,0.12)"
                    stroke="#10b981"
                    strokeWidth="1.5"
                    style={{
                      filter: "drop-shadow(0 0 6px #10b981)",
                      animation: "pulseGlow 2s ease-in-out infinite",
                    }}
                  />
                </svg>

                {/* Glowing pin */}
                <div
                  className="absolute"
                  style={{
                    top: "46%",
                    left: "50%",
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="relative">
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        background: "#22d3ee",
                        width: "16px",
                        height: "16px",
                      }}
                    />
                    <MapPin
                      className="w-6 h-6 relative"
                      style={{ color: "#22d3ee", filter: "drop-shadow(0 0 8px #22d3ee)" }}
                      fill="#22d3ee"
                    />
                  </div>
                </div>

                {/* Map label */}
                <div
                  className="absolute bottom-2 left-2 right-2 rounded p-2 text-center"
                  style={{
                    background: "rgba(2,6,23,0.85)",
                    border: "1px solid rgba(34,211,238,0.4)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <p className="text-[10px] font-bold" style={{ color: "#22d3ee", textShadow: "0 0 6px #22d3ee" }}>
                    {deedData.district} - {deedData.city}
                  </p>
                  <p className="text-[8px] mt-0.5" style={{ color: "rgba(167,243,208,0.6)" }}>
                    خريطة برمجية تفاعلية
                  </p>
                </div>

                {/* Corner brackets */}
                {[
                  { top: 6, left: 6, borders: "border-t border-l" },
                  { top: 6, right: 6, borders: "border-t border-r" },
                  { bottom: 6, left: 6, borders: "border-b border-l" },
                  { bottom: 6, right: 6, borders: "border-b border-r" },
                ].map((c, i) => (
                  <div
                    key={i}
                    className={`absolute w-3 h-3 ${c.borders}`}
                    style={{
                      ...c,
                      borderColor: "#22d3ee",
                      boxShadow: "0 0 6px #22d3ee",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                className="w-full h-12 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                style={{
                  background: "linear-gradient(135deg, #06b6d4 0%, #10b981 100%)",
                  color: "#020617",
                  boxShadow: "0 0 30px rgba(34,211,238,0.5), 0 0 60px rgba(16,185,129,0.3)",
                }}
              >
                <Sparkles className="w-4 h-4" strokeWidth={2.5} />
                توليد البطاقة الترويجية الذكية
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "rgba(34,211,238,0.08)",
                    border: "1px solid rgba(34,211,238,0.5)",
                    color: "#22d3ee",
                    boxShadow: "0 0 12px rgba(34,211,238,0.2)",
                  }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {editMode ? "حفظ التعديلات" : "تعديل البيانات المستخرجة"}
                </button>
                <button
                  onClick={handleReset}
                  className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: "rgba(2,6,23,0.7)",
                    border: "1px solid rgba(167,243,208,0.3)",
                    color: "#a7f3d0",
                  }}
                >
                  معالجة وثيقة جديدة
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <span className="watermark" style={{ color: "rgba(34,211,238,0.4)" }}>عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default DeedAnalyzer;
