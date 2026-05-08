import { useState, useRef } from "react";
import {
  FileSearch, ShieldCheck, FileText,
  Loader2, Zap, CheckCircle, UploadCloud, Edit3, Radio, Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import DeedVisualDashboard from "@/components/DeedVisualDashboard";

type AnalysisState = "idle" | "scanning" | "done" | "error";

interface DeedData {
  deedNumber: string;
  area: string;
  owner: string;
  city: string;
  district: string;
}

// Neon palette — strict app theme via semantic HSL tokens (cyan/black only)
const NEON_PINK = "hsl(var(--deed-cyan))";   // cyan (kept name to minimize diff)
const NEON_PURPLE = "hsl(var(--deed-blue))"; // neon blue
const NEON_VIOLET = "hsl(var(--accent))"; // app blue accent
const DEED_BG = "hsl(var(--deed-bg))";
const DEED_TEXT = "hsl(var(--deed-text))";
const cyanA = (alpha: number) => `hsl(var(--deed-cyan) / ${alpha})`;
const blueA = (alpha: number) => `hsl(var(--deed-blue) / ${alpha})`;

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
          try { localStorage.setItem("utaybi.deedData", JSON.stringify(data.data)); } catch {}
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

  // === Strong Arabic normalization layer (pre-export) ===
  // Reduces encoding/glyph mismatches across PDF/PNG renderers by unifying
  // letter variants, stripping invisible marks, and converting digits.
  const sanitizeArabic = (raw: string): string => {
    if (!raw) return "";
    let s = String(raw);
    // Unicode canonical composition (joins decomposed marks)
    try { s = s.normalize("NFKC"); } catch {}
    // Strip BOM, zero-width, bidi controls, and replacement char
    s = s.replace(/[\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF\uFFFC\uFFFD]/g, "");
    // Convert Arabic-Indic & Persian digits to ASCII
    s = s.replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660));
    s = s.replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));
    // Alef forms (incl. Wasla / superscript) -> bare Alef
    s = s.replace(/[\u0622\u0623\u0625\u0671\u0672\u0673]/g, "\u0627");
    // Alef Maksura -> Yeh; Persian/Urdu Yeh & alt forms -> Arabic Yeh
    s = s.replace(/[\u0649\u06CC\u064A\u06D2\u0626]/g, "\u064A");
    // Persian/Urdu Kaf variants -> Arabic Kaf
    s = s.replace(/[\u06A9\u06AA\u06AB\u0762\u0763\u0764]/g, "\u0643");
    // Heh variants -> standard Heh
    s = s.replace(/[\u06C1\u06BE\u06D5]/g, "\u0647");
    // Taa Marbouta -> Heh (common normalization to reduce variance)
    s = s.replace(/\u0629/g, "\u0647");
    // Waw with Hamza -> Waw
    s = s.replace(/\u0624/g, "\u0648");
    // Standalone Hamza removal
    s = s.replace(/\u0621/g, "");
    // Remove Tatweel & all Arabic diacritics (tashkeel) incl. Quranic marks
    s = s.replace(/\u0640/g, "");
    s = s.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "");
    // Normalize punctuation: Arabic comma/semicolon/question -> ASCII
    s = s.replace(/\u060C/g, ",").replace(/\u061B/g, ";").replace(/\u061F/g, "?");
    // Collapse whitespace (incl. NBSP / thin spaces)
    s = s.replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, " ");
    s = s.replace(/\s+/g, " ").trim();
    return s;
  };

  const formatNumber = (raw: string): string => {
    const s = sanitizeArabic(raw).replace(/[^\d.,]/g, "").replace(/,/g, "");
    if (!s) return "";
    const n = Number(s);
    return Number.isFinite(n) ? n.toLocaleString("en-US") : s;
  };

  const sanitizeDeedForExport = (d: DeedData): DeedData => ({
    deedNumber: sanitizeArabic(d.deedNumber).replace(/[^\d/-]/g, "").slice(0, 30),
    area: formatNumber(d.area).slice(0, 20),
    owner: sanitizeArabic(d.owner).slice(0, 80),
    city: sanitizeArabic(d.city).slice(0, 50),
    district: sanitizeArabic(d.district).slice(0, 60),
  });

  const runPreExportAudit = async (): Promise<void> => {
    if (!deedData) return;
    const cleaned = sanitizeDeedForExport(deedData);
    const missing: string[] = [];
    if (!cleaned.owner) missing.push("اسم المالك");
    if (!cleaned.deedNumber) missing.push("رقم الصك");
    if (!cleaned.area) missing.push("المساحة");
    if (!cleaned.district && !cleaned.city) missing.push("الموقع");
    const changed =
      cleaned.owner !== deedData.owner ||
      cleaned.deedNumber !== deedData.deedNumber ||
      cleaned.area !== deedData.area ||
      cleaned.district !== deedData.district ||
      cleaned.city !== deedData.city;
    if (changed) {
      setDeedData(cleaned);
      try { localStorage.setItem("utaybi.deedData", JSON.stringify(cleaned)); } catch {}
      toast({ title: "تم التدقيق التلقائي", description: "تنسيق الأرقام والكتابة العربية" });
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      await new Promise((r) => requestAnimationFrame(() => r(null)));
    }
    if (missing.length) {
      toast({ title: "حقول ناقصة", description: `يُفضّل إكمال: ${missing.join("، ")}`, variant: "destructive" });
    }
  };

  const handleDownload = async () => {
    if (!deedPanelRef.current) return;
    await runPreExportAudit();
    try {
      const dataUrl = await toPng(deedPanelRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: DEED_BG,
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

  const handleDownloadPdf = async () => {
    if (!deedPanelRef.current) return;
    await runPreExportAudit();
    try {
      const dataUrl = await toPng(deedPanelRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: DEED_BG,
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      pdf.setFillColor(0, 8, 20);
      pdf.rect(0, 0, pageW, pageH, "F");

      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2 - 12;
      const ratio = img.width / img.height;
      let w = maxW;
      let h = w / ratio;
      if (h > maxH) { h = maxH; w = h * ratio; }
      const x = (pageW - w) / 2;
      pdf.addImage(dataUrl, "PNG", x, margin, w, h, undefined, "FAST");

      pdf.setTextColor(0, 255, 255);
      pdf.setFontSize(9);
      pdf.text("UTAYBI SMART AI HUB - DIGITAL DEED CARD", pageW / 2, pageH - 6, { align: "center" });
      pdf.setTextColor(170, 170, 170);
      pdf.setFontSize(7);
      pdf.text(
        `Deed: ${deedData?.deedNumber || "-"}   |   ${new Date().toLocaleString("en-GB")}`,
        pageW / 2, pageH - 2, { align: "center" }
      );
      pdf.save(`utaybi-deed-${deedData?.deedNumber || "document"}.pdf`);
      toast({ title: "تم تصدير الوثيقة كملف PDF", description: "جودة طباعة عالية" });
    } catch (err: any) {
      toast({ title: "فشل تصدير PDF", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: "linear-gradient(160deg, hsl(var(--deed-bg)) 0%, hsl(var(--deed-navy)) 55%, hsl(var(--deed-bg)) 100%)",
        border: `1px solid ${cyanA(0.25)}`,
        boxShadow: `0 0 40px -8px ${cyanA(0.25)}, inset 0 0 30px -10px ${blueA(0.13)}`,
      }}
    >
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--deed-cyan) / 0.09) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--deed-cyan) / 0.09) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header */}
      <div className="relative flex items-center gap-3 mb-5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{
            background: cyanA(0.06),
            border: `1px solid ${cyanA(0.5)}`,
            boxShadow: `0 0 18px ${cyanA(0.44)}`,
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
          <p className="text-[10px]" style={{ color: blueA(0.8) }}>
            منصة الأتمتة البرمجية للوثائق العقارية — Utaybi Smart AI
          </p>
        </div>
        <div
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold"
          style={{
            background: blueA(0.13),
            border: `1px solid ${blueA(0.5)}`,
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
                background: "hsl(var(--deed-bg) / 0.72)",
                border: file ? `2px dashed ${blueA(0.5)}` : `2px dashed ${cyanA(0.38)}`,
                boxShadow: file
                  ? `inset 0 0 25px ${blueA(0.15)}`
                  : `inset 0 0 25px ${cyanA(0.09)}`,
              }}
            >
              {file ? (
                <div className="text-center">
                  <CheckCircle className="w-9 h-9 mx-auto mb-2" style={{ color: NEON_PURPLE, filter: `drop-shadow(0 0 8px ${NEON_PURPLE})` }} />
                  <p className="text-xs font-bold" style={{ color: DEED_TEXT }}>{file.name}</p>
                  <p className="text-[9px] mt-1" style={{ color: blueA(0.6) }}>
                    {(file.size / 1024).toFixed(0)} كيلوبايت — اضغط لتغيير الملف
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <UploadCloud className="w-9 h-9 mx-auto mb-2 animate-pulse" style={{ color: NEON_PINK, filter: `drop-shadow(0 0 8px ${NEON_PINK})` }} />
                  <p className="text-xs font-bold" style={{ color: NEON_PINK }}>ارفع صورة الوثيقة العقارية</p>
                  <p className="text-[9px] mt-1" style={{ color: cyanA(0.6) }}>صور فقط — حد أقصى 10 ميجابايت</p>
                </div>
              )}
            </div>

            <button
              onClick={handleLaunch}
              className="w-full h-12 text-sm font-extrabold rounded-xl flex items-center justify-center gap-3 transition-all hover:scale-[1.01]"
              style={{
                background: `linear-gradient(135deg, ${NEON_PINK} 0%, ${NEON_VIOLET} 100%)`,
                color: "hsl(var(--deed-bg))",
                boxShadow: `0 0 30px ${cyanA(0.5)}, 0 0 60px ${blueA(0.25)}`,
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
              background: "hsl(var(--deed-bg) / 0.74)",
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
                  background: cyanA(0.09),
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
                    <span className="text-[11px]" style={{ color: DEED_TEXT }}>{step}</span>
                  </motion.div>
                ))}
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: cyanA(0.09) }}>
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
                background: cyanA(0.06),
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

            <div ref={deedPanelRef}>
              <DeedVisualDashboard deed={deedData} />
            </div>

            {/* Inline editable correction row (dynamic, not table) */}
            <div
              className="rounded-xl p-3"
              style={{
                background: "hsl(var(--deed-bg) / 0.74)",
                border: `1px solid ${NEON_PINK}40`,
              }}
            >
              <p className="text-[10px] font-bold mb-2" style={{ color: cyanA(0.8) }}>
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
                      color: DEED_TEXT,
                      border: `1px solid ${NEON_PINK}50`,
                      textShadow: `0 0 6px ${NEON_PINK}`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownload}
                  className="h-12 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{
                    background: `linear-gradient(135deg, ${NEON_PINK} 0%, ${NEON_VIOLET} 100%)`,
                    color: DEED_BG,
                    boxShadow: `0 0 25px ${NEON_PINK}80`,
                  }}
                >
                  <Download className="w-4 h-4" strokeWidth={2.5} />
                  تحميل PNG
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="h-12 text-sm font-extrabold rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                  style={{
                    background: "hsl(var(--deed-bg) / 0.85)",
                    color: NEON_PINK,
                    border: `1.5px solid ${NEON_PINK}`,
                    boxShadow: `0 0 25px ${NEON_PINK}55, inset 0 0 14px ${NEON_PINK}25`,
                  }}
                >
                  <FileText className="w-4 h-4" strokeWidth={2.5} />
                  تصدير PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toast({ title: "تم تأكيد البيانات", description: "تم حفظ المدخلات النهائية للمعالجة البرمجية" })}
                  className="h-10 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: cyanA(0.09),
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
                    background: "hsl(var(--deed-bg) / 0.74)",
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

      <span className="watermark" style={{ color: cyanA(0.4) }}>عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default DeedAnalyzer;
