import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Sparkles, Download, Loader2, Type, Wand2, Image as ImageIcon, Sun, Move } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AdCopy {
  headline: string;
  subline: string;
  cta: string;
}

const MediaStudio = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const logoRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [headline, setHeadline] = useState("عُتيبي ذكي");
  const [subline, setSubline] = useState("منصتك الذكية للحلول العقارية");
  const [cta, setCta] = useState("اتصل الآن");
  const [accent, setAccent] = useState("#bf5af2");
  const [textColor, setTextColor] = useState("#ffffff");
  const [fontSize, setFontSize] = useState(44); // headline base size (px on 1080 width)
  const [showPlate, setShowPlate] = useState(true);
  const [textPos, setTextPos] = useState({ x: 0.5, y: 0.78 }); // ratios
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(110);
  const [saturate, setSaturate] = useState(115);
  const [brief, setBrief] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ w: 1080, h: 1080 });
  const draggingRef = useRef(false);

  const handleFile = (f: File) => setImgUrl(URL.createObjectURL(f));
  const handleLogo = (f: File) => setLogoUrl(URL.createObjectURL(f));

  // Render canvas
  useEffect(() => {
    if (!imgUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = (img: HTMLImageElement) => {
      const W = 1080;
      const H = Math.round((img.height / img.width) * W);
      canvas.width = W;
      canvas.height = H;
      setCanvasSize({ w: W, h: H });

      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.filter = "none";

      // Compute text block dimensions
      const headSize = fontSize * 2; // scale up for canvas
      const subSize = Math.round(headSize * 0.45);
      const ctaSize = Math.round(headSize * 0.5);

      ctx.direction = "rtl";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Wrap subline
      ctx.font = `500 ${subSize}px Cairo, system-ui, sans-serif`;
      const maxW = W * 0.78;
      const subWords = (subline || "").split(" ");
      const subLines: string[] = [];
      let line = "";
      for (const w of subWords) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW) {
          if (line) subLines.push(line);
          line = w;
        } else line = test;
      }
      if (line) subLines.push(line);

      // Measure widths
      ctx.font = `bold ${headSize}px Cairo, system-ui, sans-serif`;
      const headW = ctx.measureText(headline || "").width;
      ctx.font = `500 ${subSize}px Cairo, system-ui, sans-serif`;
      const subW = subLines.reduce((m, l) => Math.max(m, ctx.measureText(l).width), 0);
      ctx.font = `bold ${ctaSize}px Cairo, system-ui, sans-serif`;
      const ctaW = ctx.measureText(cta || "").width;

      const blockW = Math.max(headW, subW, ctaW + 80);
      const headLine = headSize * 1.05;
      const subLineH = subSize * 1.25;
      const ctaH = ctaSize * 1.6;
      const gap = headSize * 0.35;
      const blockH = (headline ? headLine : 0) + subLines.length * subLineH + (cta ? ctaH + gap : 0) + gap;

      const cx = textPos.x * W;
      const cy = textPos.y * H;
      const bx = cx - blockW / 2 - 28;
      const by = cy - blockH / 2 - 18;
      const bw = blockW + 56;
      const bh = blockH + 36;

      // Plate
      if (showPlate) {
        ctx.fillStyle = "rgba(2,6,23,0.5)";
        const r = 18;
        ctx.beginPath();
        ctx.moveTo(bx + r, by);
        ctx.arcTo(bx + bw, by, bx + bw, by + bh, r);
        ctx.arcTo(bx + bw, by + bh, bx, by + bh, r);
        ctx.arcTo(bx, by + bh, bx, by, r);
        ctx.arcTo(bx, by, bx + bw, by, r);
        ctx.closePath();
        ctx.fill();
      }

      let yCursor = by + 24 + headSize / 2;

      // Headline
      if (headline) {
        ctx.font = `bold ${headSize}px Cairo, system-ui, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.shadowColor = "rgba(0,0,0,0.55)";
        ctx.shadowBlur = 10;
        ctx.fillText(headline, cx, yCursor);
        ctx.shadowBlur = 0;
        yCursor += headLine * 0.6 + gap * 0.5;
      }

      // Subline
      if (subLines.length) {
        ctx.font = `500 ${subSize}px Cairo, system-ui, sans-serif`;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.92;
        for (const l of subLines) {
          ctx.fillText(l, cx, yCursor + subSize / 2);
          yCursor += subLineH;
        }
        ctx.globalAlpha = 1;
      }

      // CTA pill
      if (cta) {
        yCursor += gap * 0.4;
        const padX = ctaSize * 0.9;
        const pillH = ctaSize * 1.5;
        const pillW = ctaW + padX * 2;
        const px = cx - pillW / 2;
        const py = yCursor;
        const rr = pillH / 2;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.moveTo(px + rr, py);
        ctx.arcTo(px + pillW, py, px + pillW, py + pillH, rr);
        ctx.arcTo(px + pillW, py + pillH, px, py + pillH, rr);
        ctx.arcTo(px, py + pillH, px, py, rr);
        ctx.arcTo(px, py, px + pillW, py, rr);
        ctx.closePath();
        ctx.fill();
        ctx.font = `bold ${ctaSize}px Cairo, system-ui, sans-serif`;
        ctx.fillStyle = "#0b0613";
        ctx.fillText(cta, cx, py + pillH / 2 + 2);
      }

      // Watermark
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      ctx.font = "600 22px Cairo, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.fillText("عُتيبي ذكي 🤖", 28, 40);

      // Logo
      const drawLogo = (lg: HTMLImageElement) => {
        const lh = 96;
        const lw = (lg.width / lg.height) * lh;
        const lx = W - 28 - lw;
        const ly = 28;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        ctx.fillRect(lx - 10, ly - 10, lw + 20, lh + 20);
        ctx.drawImage(lg, lx, ly, lw, lh);
      };
      if (logoUrl) {
        if (logoImgRef.current && logoImgRef.current.src.endsWith(logoUrl.split("/").pop() || "")) {
          drawLogo(logoImgRef.current);
        } else {
          const lg = new Image();
          lg.crossOrigin = "anonymous";
          lg.onload = () => { logoImgRef.current = lg; drawLogo(lg); };
          lg.src = logoUrl;
        }
      }
    };

    if (imgRef.current && imgRef.current.src === imgUrl) {
      render(imgRef.current);
    } else {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => { imgRef.current = img; render(img); };
      img.src = imgUrl;
    }
  }, [imgUrl, logoUrl, headline, subline, cta, accent, textColor, fontSize, showPlate, textPos, brightness, contrast, saturate]);

  // Drag & drop text
  const handlePointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTextPos({ x: Math.min(0.95, Math.max(0.05, x)), y: Math.min(0.95, Math.max(0.05, y)) });
  };

  const generateCopy = async () => {
    if (!brief.trim()) { toast.error("اكتب وصفاً موجزاً للإعلان"); return; }
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { type: "ad_copy", prompt: brief },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const raw = (data?.text || "").trim();
      const match = raw.match(/\{[\s\S]*\}/);
      const json: AdCopy = match ? JSON.parse(match[0]) : { headline: raw, subline: "", cta: "اعرف أكثر" };
      setHeadline(json.headline || headline);
      setSubline(json.subline || subline);
      setCta(json.cta || cta);
      toast.success("تم توليد نص الإعلان");
    } catch (e: any) {
      toast.error(e?.message || "فشل توليد النص");
    } finally { setAiLoading(false); }
  };

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `ad-${Date.now()}.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-background font-cairo notranslate pb-24" dir="rtl">
      <header className="relative bg-card border-b border-border px-4 py-3 flex items-center justify-center sticky top-0 z-30 backdrop-blur">
        <button onClick={() => navigate("/")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-primary flex items-center gap-1 hover:text-primary/80 transition-colors">
          <ArrowRight className="w-4 h-4" /> الرئيسية
        </button>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-[34px] h-[34px] rounded-xl bg-primary/10 p-0.5 border border-primary/30 glow-gold">
            <img src={logo} alt="عتيبي ذكي" className="w-full h-full rounded-lg object-cover" />
          </div>
          <span className="text-[10px] font-bold text-primary/80 tracking-wide">معالج الوسائط</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-5">
        {/* Upload */}
        <div className="card-neon p-4">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-28 border-2 border-dashed border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition"
          >
            <Upload className="w-6 h-6 text-primary" />
            <span className="text-sm text-foreground font-bold">{imgUrl ? "تغيير الصورة" : "ارفع صورة الإعلان"}</span>
            <span className="text-[10px] text-muted-foreground">PNG / JPG حتى 5MB</span>
          </button>

          <input ref={logoRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])} />
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => logoRef.current?.click()}
              className="flex-1 h-10 rounded-lg border border-border bg-secondary text-xs flex items-center justify-center gap-2 text-foreground hover:border-primary"
            >
              <ImageIcon className="w-4 h-4 text-primary" />
              {logoUrl ? "تغيير الشعار" : "إضافة شعار / لوقو"}
            </button>
            {logoUrl && (
              <button onClick={() => setLogoUrl(null)} className="h-10 px-3 rounded-lg border border-border text-[11px] text-muted-foreground hover:text-destructive">
                إزالة
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {imgUrl && (
          <div className="card-neon p-3">
            <div className="relative">
              <canvas
                ref={canvasRef}
                onPointerDown={(e) => { draggingRef.current = true; (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId); handlePointer(e); }}
                onPointerMove={(e) => { if (draggingRef.current) handlePointer(e); }}
                onPointerUp={() => { draggingRef.current = false; }}
                className="w-full rounded-lg border border-border touch-none cursor-move"
              />
              <div className="absolute top-2 left-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-[10px] text-primary flex items-center gap-1 pointer-events-none">
                <Move className="w-3 h-3" /> اسحب لتحريك النص
              </div>
            </div>
            <button onClick={download} className="mt-3 w-full h-11 btn-neon text-sm flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> تنزيل التصميم النهائي
            </button>
          </div>
        )}

        {/* AI Brief */}
        <div className="card-neon p-4 space-y-3">
          <label className="text-xs font-bold text-foreground flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" /> توليد نص الإعلان بالذكاء الاصطناعي
          </label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            rows={3}
            placeholder="مثال: عرض رمضاني على باقات منصة عُتيبي ذكي بخصم 30% للشركات السعودية"
            className="w-full bg-secondary border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-primary"
          />
          <button onClick={generateCopy} disabled={aiLoading} className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-60">
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {aiLoading ? "جاري الصياغة..." : "اقترح عنواناً ووصفاً ودعوة"}
          </button>
        </div>

        {/* Manual editor */}
        <div className="card-neon p-4 space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" /> تحرير النصوص
          </h3>
          <Field label="العنوان الرئيسي" value={headline} onChange={setHeadline} />
          <Field label="العنوان الفرعي" value={subline} onChange={setSubline} />
          <Field label="زر الدعوة (CTA)" value={cta} onChange={setCta} />

          <Slider label="حجم الخط" value={fontSize} min={20} max={90} onChange={setFontSize} unit="px" />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted-foreground">لون النص</label>
              <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="h-8 w-12 rounded border border-border bg-transparent" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-muted-foreground">لون الزر</label>
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-8 w-12 rounded border border-border bg-transparent" />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={showPlate} onChange={(e) => setShowPlate(e.target.checked)} className="accent-primary" />
            خلفية شفافة خلف النص لزيادة الوضوح
          </label>

          <div className="text-[10px] text-muted-foreground bg-secondary/50 rounded p-2 border border-border">
            💡 اضغط واسحب على الصورة في المعاينة لتحريك النص إلى المكان الذي تريده.
          </div>
        </div>

        {/* Image enhancement */}
        {imgUrl && (
          <div className="card-neon p-4 space-y-3">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <Sun className="w-4 h-4 text-primary" /> تحسين الإضاءة والألوان
            </h3>
            <Slider label="السطوع" value={brightness} min={50} max={160} onChange={setBrightness} />
            <Slider label="التباين" value={contrast} min={50} max={160} onChange={setContrast} />
            <Slider label="تشبع الألوان" value={saturate} min={0} max={200} onChange={setSaturate} />
            <button
              onClick={() => { setBrightness(100); setContrast(100); setSaturate(100); }}
              className="text-[11px] text-primary hover:underline"
            >إعادة الافتراضي</button>
          </div>
        )}
      </main>
    </div>
  );
};

const Slider = ({ label, value, min, max, onChange, unit = "%" }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; unit?: string }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <span className="text-[11px] text-primary font-bold">{value}{unit}</span>
    </div>
    <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full accent-primary" />
  </div>
);

const Field = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div>
    <label className="text-[11px] text-muted-foreground block mb-1">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
    />
  </div>
);

export default MediaStudio;
