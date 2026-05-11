import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Upload, Sparkles, Download, Loader2, Type, Wand2, Image as ImageIcon, Sun } from "lucide-react";
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
  const [brightness, setBrightness] = useState(105);
  const [contrast, setContrast] = useState(110);
  const [saturate, setSaturate] = useState(115);
  const [brief, setBrief] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const handleFile = (f: File) => {
    const url = URL.createObjectURL(f);
    setImgUrl(url);
  };
  const handleLogo = (f: File) => {
    const url = URL.createObjectURL(f);
    setLogoUrl(url);
  };

  // Render canvas whenever inputs change
  useEffect(() => {
    if (!imgUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      const W = 1080;
      const H = Math.round((img.height / img.width) * W);
      canvas.width = W;
      canvas.height = H;

      // Lighting / enhancement filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%)`;
      ctx.drawImage(img, 0, 0, W, H);
      ctx.filter = "none";

      // dark gradient overlay (bottom)
      const grad = ctx.createLinearGradient(0, H * 0.35, 0, H);
      grad.addColorStop(0, "rgba(2,6,23,0)");
      grad.addColorStop(1, "rgba(2,6,23,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // accent bar
      ctx.fillStyle = accent;
      ctx.fillRect(W - 80, H - H * 0.45, 12, H * 0.4);

      // text
      ctx.direction = "rtl";
      ctx.textAlign = "right";
      ctx.fillStyle = "#ffffff";

      const padR = 60;
      let y = H - 220;

      ctx.font = "bold 78px Cairo, system-ui, sans-serif";
      ctx.shadowColor = accent;
      ctx.shadowBlur = 24;
      ctx.fillText(headline || "", W - padR, y);
      ctx.shadowBlur = 0;

      y += 70;
      ctx.font = "500 36px Cairo, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.92)";
      const words = (subline || "").split(" ");
      let line = "";
      const maxW = W - padR - 100;
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW) {
          ctx.fillText(line, W - padR, y);
          y += 46;
          line = w;
        } else line = test;
      }
      if (line) { ctx.fillText(line, W - padR, y); y += 46; }

      // CTA pill
      y += 22;
      const ctaText = cta || "";
      ctx.font = "bold 34px Cairo, system-ui, sans-serif";
      const tw = ctx.measureText(ctaText).width;
      const padX = 36, padY = 18;
      const pillW = tw + padX * 2, pillH = 34 + padY * 2;
      const px = W - padR - pillW;
      const py = y;
      ctx.fillStyle = accent;
      const r = pillH / 2;
      ctx.beginPath();
      ctx.moveTo(px + r, py);
      ctx.arcTo(px + pillW, py, px + pillW, py + pillH, r);
      ctx.arcTo(px + pillW, py + pillH, px, py + pillH, r);
      ctx.arcTo(px, py + pillH, px, py, r);
      ctx.arcTo(px, py, px + pillW, py, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0b0613";
      ctx.fillText(ctaText, W - padR - padX, py + padY + 30);

      // brand watermark
      ctx.font = "600 22px Cairo, system-ui, sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.textAlign = "left";
      ctx.fillText("عُتيبي ذكي 🤖", 32, 44);

      // Optional logo (top-right)
      const drawLogo = (logo: HTMLImageElement) => {
        const logoH = 110;
        const logoW = (logo.width / logo.height) * logoH;
        const lx = W - 32 - logoW;
        const ly = 32;
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        const pad = 12;
        ctx.fillRect(lx - pad, ly - pad, logoW + pad * 2, logoH + pad * 2);
        ctx.drawImage(logo, lx, ly, logoW, logoH);
      };
      if (logoUrl) {
        if (logoImgRef.current && logoImgRef.current.src === logoUrl) {
          drawLogo(logoImgRef.current);
        } else {
          const lg = new Image();
          lg.crossOrigin = "anonymous";
          lg.onload = () => { logoImgRef.current = lg; drawLogo(lg); };
          lg.src = logoUrl;
        }
      }
    };
    img.src = imgUrl;
  }, [imgUrl, logoUrl, headline, subline, cta, accent, brightness, contrast, saturate]);

  const generateCopy = async () => {
    if (!brief.trim()) {
      toast.error("اكتب وصفاً موجزاً للإعلان");
      return;
    }
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
    } finally {
      setAiLoading(false);
    }
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
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur">
        <button onClick={() => navigate("/")} className="text-xs text-primary flex items-center gap-1">
          <ArrowRight className="w-4 h-4" /> الرئيسية
        </button>
        <h1 className="text-base font-bold text-primary">معالج الوسائط وصناعة الإعلانات</h1>
        <div className="w-12" />
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

          {/* Logo upload */}
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
            <canvas ref={canvasRef} className="w-full rounded-lg border border-border" />
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
            <Type className="w-4 h-4 text-primary" /> تحرير النصوص يدوياً
          </h3>
          <Field label="العنوان الرئيسي" value={headline} onChange={setHeadline} />
          <Field label="العنوان الفرعي" value={subline} onChange={setSubline} />
          <Field label="زر الدعوة (CTA)" value={cta} onChange={setCta} />
          <div className="flex items-center gap-3">
            <label className="text-[11px] text-muted-foreground">لون التمييز</label>
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-8 w-14 rounded border border-border bg-transparent" />
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

const Slider = ({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <label className="text-[11px] text-muted-foreground">{label}</label>
      <span className="text-[11px] text-primary font-bold">{value}%</span>
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
