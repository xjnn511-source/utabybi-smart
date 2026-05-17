import { Copy, Download, FileText, Sparkles, Wand2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { speakOtaibi } from "@/lib/otaibiVoice";

type SolutionMode = "ad" | "deed" | "plan";

const MODES: Record<SolutionMode, { label: string; placeholder: string }> = {
  ad: {
    label: "إعلان عقاري",
    placeholder: "مثال: فيلا في الرياض حي النرجس، ٤ غرف، ٣٥٠ متر، قريبة من الخدمات، سعر منافس",
  },
  deed: {
    label: "تحليل صك",
    placeholder: "مثال: رقم الصك 12345، المساحة 600م، المالك أحمد، مدينة جدة، حي الشاطئ",
  },
  plan: {
    label: "خطة تشغيل",
    placeholder: "مثال: أريد خطة تسويق لعقار تجاري خلال ٧ أيام مع محتوى سناب وتيك توك",
  },
};

const parseFields = (text: string) => {
  const normalized = text.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
  const area = normalized.match(/(\d+(?:\.\d+)?)\s*(?:متر|م٢|m2|م)/i)?.[1] || "غير محددة";
  const price = normalized.match(/(?:سعر|بقيمة|ريال)\D{0,12}([\d,]+)/i)?.[1] || "حسب التفاوض";
  const city = normalized.match(/(?:في|مدينة)\s+([\u0600-\u06FF\s]{2,18})(?:،|,|\.|$)/)?.[1]?.trim() || "السوق المحلي";
  const district = normalized.match(/(?:حي|بحي)\s+([\u0600-\u06FF\s]{2,18})(?:،|,|\.|$)/)?.[1]?.trim() || "موقع مميز";
  const deedNumber = normalized.match(/(?:صك|الصك|رقم)\D{0,8}([\d/-]{3,})/)?.[1] || "غير محدد";
  return { area, price, city, district, deedNumber };
};

const buildSolution = (mode: SolutionMode, input: string) => {
  const { area, price, city, district, deedNumber } = parseFields(input);
  const lines = input.split(/[\n،,.]+/).map((line) => line.trim()).filter(Boolean);
  const keywords = Array.from(new Set(input.match(/[\u0600-\u06FF]{4,}/g) || [])).slice(0, 8);

  if (mode === "deed") {
    return [
      "تقرير تحليل الصك البرمجي:",
      `• رقم الصك: ${deedNumber}`,
      `• الموقع المستنتج: ${city} — ${district}`,
      `• المساحة: ${area} م²`,
      `• حالة البيانات: ${deedNumber !== "غير محدد" && area !== "غير محددة" ? "صالحة للمراجعة الأولية" : "تحتاج استكمال بيانات"}`,
      "• الإجراء التالي: مطابقة رقم الصك والمساحة مع الوثائق الرسمية قبل الإفراغ أو الإعلان.",
    ].join("\n");
  }

  if (mode === "plan") {
    return [
      "خطة تشغيل عقارية عملية:",
      "اليوم 1: تجهيز صور العقار وكتابة ثلاث زوايا بيع رئيسية.",
      `اليوم 2: بناء عرض يركز على ${district} وميزة الموقع في ${city}.`,
      "اليوم 3: إنتاج فيديو قصير من الصور مع تعليق صوتي واضح ودعوة للتواصل.",
      "اليوم 4: نشر إعلانين بصيغتين مختلفتين واختبار الاستجابة.",
      "اليوم 5-7: متابعة العملاء، قياس النقرات، وتعديل الرسالة حسب الأسئلة المتكررة.",
      `نقاط التركيز: ${keywords.length ? keywords.join("، ") : "السعر، الموقع، المساحة، الثقة"}.`,
    ].join("\n");
  }

  return [
    `عنوان الإعلان: فرصة عقارية في ${district}`,
    `امتلك عقارك في ${city} بمساحة ${area} م² وبسعر ${price}.`,
    "مزايا العرض:",
    `• موقع واضح: ${district}.`,
    `• مساحة مناسبة: ${area} م².`,
    "• صياغة تسويقية جاهزة للنشر في منصات التواصل.",
    "• دعوة إجراء: للحجز والمعاينة تواصل الآن واحصل على التفاصيل الكاملة.",
  ].join("\n");
};

const ContentCard = () => {
  const [mode, setMode] = useState<SolutionMode>("ad");
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const activeMode = useMemo(() => MODES[mode], [mode]);

  const handleCreate = async () => {
    if (input.trim().length < 12) {
      toast({ title: "أدخل وصفاً حقيقياً ليتم تحليله", variant: "destructive" });
      return;
    }
    setIsProcessing(true);
    try {
      const output = buildSolution(mode, input.trim());
      setResult(output);
      await speakOtaibi(`تم تنفيذ المعالجة البرمجية. ${output}`, { profile: "majestic" });
      toast({ title: "تمت المعالجة النصية فعلياً" });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    toast({ title: "تم نسخ النتيجة" });
  };

  const downloadResult = () => {
    if (!result) return;
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `otaibi-solution-${mode}-${Date.now()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">مولّد الحلول البرمجية الإبداعية</h2>
          <p className="text-[10px] text-muted-foreground">يعالج النص المدخل ويُخرج نتيجة حقيقية قابلة للنسخ والتنزيل</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {(Object.keys(MODES) as SolutionMode[]).map((key) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`h-9 rounded-[var(--radius)] text-[10px] font-bold border transition-all ${mode === key ? "btn-neon border-primary" : "bg-secondary border-border text-foreground hover:border-primary"}`}
          >
            {MODES[key].label}
          </button>
        ))}
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={activeMode.placeholder}
        rows={4}
        className="w-full bg-secondary border border-border rounded-lg p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary mb-3 resize-none"
      />

      {result ? (
        <div className="rounded-lg border border-border bg-secondary/50 p-3 mb-3">
          <pre className="whitespace-pre-wrap text-[11px] leading-relaxed text-foreground font-cairo">{result}</pre>
          <div className="flex gap-2 mt-3">
            <button onClick={copyResult} className="flex-1 h-8 bg-background border border-border rounded-[var(--radius)] text-[10px] text-primary font-bold flex items-center justify-center gap-1">
              <Copy className="w-3 h-3" /> نسخ
            </button>
            <button onClick={downloadResult} className="flex-1 h-8 bg-background border border-border rounded-[var(--radius)] text-[10px] text-primary font-bold flex items-center justify-center gap-1">
              <Download className="w-3 h-3" /> تنزيل
            </button>
          </div>
        </div>
      ) : (
        <div className="aspect-[4/3] max-h-32 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border flex flex-col items-center justify-center p-3">
          <Wand2 className="w-7 h-7 text-primary mb-2" />
          <p className="text-[10px] text-muted-foreground text-center">اكتب بيانات العقار أو الصك ليتم استخراج نتيجة فعلية من النص.</p>
        </div>
      )}

      <button onClick={handleCreate} disabled={isProcessing} className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50">
        <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
        {isProcessing ? "جاري تنفيذ المعالجة..." : "تشغيل المعالج النصي"}
      </button>
      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default ContentCard;