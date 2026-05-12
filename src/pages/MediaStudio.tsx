import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight, Upload, Music, Plus, Trash2, Download, Loader2,
  Film, Type, Image as ImageIcon, Play, Square,
} from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

interface Slide {
  id: string;
  url: string;
  caption: string;
  duration: number; // seconds
  img?: HTMLImageElement;
}

const W = 1080;
const H = 1920;
const FPS = 30;

const MediaStudio = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const audioFileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  const [slides, setSlides] = useState<Slide[]>([]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioName, setAudioName] = useState<string>("");
  const [accent, setAccent] = useState("#bf5af2");
  const [brandTitle, setBrandTitle] = useState("عُتيبي ذكي");
  const [brandSub, setBrandSub] = useState("منصة العقار الذكية");
  const [rendering, setRendering] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [progress, setProgress] = useState(0);
  const stopRef = useRef<() => void>(() => {});

  const totalDuration = slides.reduce((s, x) => s + x.duration, 0);

  // Add image slide
  const onPickImages = (files: FileList) => {
    const arr: Slide[] = [];
    Array.from(files).forEach((f) => {
      const url = URL.createObjectURL(f);
      arr.push({ id: crypto.randomUUID(), url, caption: "", duration: 3 });
    });
    setSlides((s) => [...s, ...arr]);
  };

  // Preload images
  useEffect(() => {
    slides.forEach((sl) => {
      if (sl.img) return;
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => {
        setSlides((cur) => cur.map((c) => (c.id === sl.id ? { ...c, img: im } : c)));
      };
      im.src = sl.url;
    });
  }, [slides.length]);

  // Audio upload
  const onPickAudio = (f: File) => {
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    setAudioName(f.name);
    if (audioElRef.current) audioElRef.current.src = url;
  };

  // Draw a single frame at time t (seconds, global)
  const drawFrame = (ctx: CanvasRenderingContext2D, t: number) => {
    // background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, W, H);

    // determine current slide
    let acc = 0;
    let active: Slide | null = null;
    let localT = 0;
    for (const s of slides) {
      if (t < acc + s.duration) {
        active = s;
        localT = t - acc;
        break;
      }
      acc += s.duration;
    }
    if (!active) {
      active = slides[slides.length - 1] || null;
      localT = active ? active.duration : 0;
    }
    if (!active || !active.img) return;

    const dur = active.duration;
    const p = Math.min(1, Math.max(0, localT / dur));

    // Ken Burns zoom-in
    const zoom = 1.05 + p * 0.12;
    const panX = (p - 0.5) * 60;
    const panY = (p - 0.5) * 30;

    // cover-fit
    const ir = active.img.width / active.img.height;
    const cr = W / H;
    let dw, dh;
    if (ir > cr) {
      dh = H * zoom;
      dw = dh * ir;
    } else {
      dw = W * zoom;
      dh = dw / ir;
    }
    const dx = (W - dw) / 2 + panX;
    const dy = (H - dh) / 2 + panY;
    ctx.drawImage(active.img, dx, dy, dw, dh);

    // top dark gradient (for brand)
    const gradTop = ctx.createLinearGradient(0, 0, 0, 320);
    gradTop.addColorStop(0, "rgba(2,6,23,0.85)");
    gradTop.addColorStop(1, "rgba(2,6,23,0)");
    ctx.fillStyle = gradTop;
    ctx.fillRect(0, 0, W, 320);

    // bottom dark gradient (for caption)
    const gradBot = ctx.createLinearGradient(0, H - 700, 0, H);
    gradBot.addColorStop(0, "rgba(2,6,23,0)");
    gradBot.addColorStop(1, "rgba(2,6,23,0.92)");
    ctx.fillStyle = gradBot;
    ctx.fillRect(0, H - 700, W, 700);

    // Brand block (top-right RTL)
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(0,0,0,0.6)";
    ctx.shadowBlur = 12;
    ctx.font = "900 56px Cairo, system-ui, sans-serif";
    ctx.fillText(brandTitle, W - 60, 130);
    ctx.font = "600 30px Cairo, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(brandSub, W - 60, 180);
    ctx.shadowBlur = 0;

    // accent ribbon under brand
    ctx.fillStyle = accent;
    ctx.fillRect(W - 60 - 220, 200, 220, 6);

    // Caption (synced fade per slide)
    if (active.caption) {
      const fadeIn = Math.min(1, p / 0.12);
      const fadeOut = Math.min(1, (1 - p) / 0.12);
      const alpha = Math.min(fadeIn, fadeOut);
      ctx.globalAlpha = alpha;

      ctx.textAlign = "center";
      const baseSize = 76;
      ctx.font = `900 ${baseSize}px Cairo, system-ui, sans-serif`;

      // wrap
      const maxW = W - 160;
      const words = active.caption.split(" ");
      const lines: string[] = [];
      let cur = "";
      for (const w of words) {
        const test = cur ? cur + " " + w : w;
        if (ctx.measureText(test).width > maxW) {
          if (cur) lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);

      const lineH = baseSize * 1.18;
      const blockH = lines.length * lineH + 60;
      const cy = H - 280;
      const top = cy - blockH;

      // plate
      ctx.fillStyle = "rgba(2,6,23,0.55)";
      const plateX = 60;
      const plateW = W - 120;
      ctx.beginPath();
      const r = 28;
      ctx.moveTo(plateX + r, top);
      ctx.arcTo(plateX + plateW, top, plateX + plateW, top + blockH, r);
      ctx.arcTo(plateX + plateW, top + blockH, plateX, top + blockH, r);
      ctx.arcTo(plateX, top + blockH, plateX, top, r);
      ctx.arcTo(plateX, top, plateX + plateW, top, r);
      ctx.closePath();
      ctx.fill();

      // accent left bar
      ctx.fillStyle = accent;
      ctx.fillRect(plateX + plateW - 8, top + 24, 6, blockH - 48);

      // text
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowBlur = 8;
      let yy = top + 40 + baseSize * 0.85;
      for (const ln of lines) {
        ctx.fillText(ln, W / 2, yy);
        yy += lineH;
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    // progress bar
    const barH = 6;
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(0, H - 8, W, barH);
    ctx.fillStyle = accent;
    const overall = totalDuration > 0 ? Math.min(1, t / totalDuration) : 0;
    ctx.fillRect(0, H - 8, W * overall, barH);

    // small watermark bottom-left
    ctx.textAlign = "left";
    ctx.font = "600 22px Cairo, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fillText("عُتيبي ذكي 🤖", 36, H - 36);
  };

  // Live preview animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    if (slides.length === 0 || !slides[0].img) {
      ctx.fillStyle = "#0b1220";
      ctx.fillRect(0, 0, W, H);
      return;
    }
    drawFrame(ctx, 0);
  }, [slides, accent, brandTitle, brandSub]);

  const playPreview = () => {
    if (slides.length === 0 || totalDuration === 0) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    setPreviewing(true);
    const start = performance.now();
    const audio = audioElRef.current;
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }
    let raf = 0;
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      if (t >= totalDuration) {
        drawFrame(ctx, totalDuration);
        setPreviewing(false);
        if (audio) audio.pause();
        return;
      }
      drawFrame(ctx, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    stopRef.current = () => {
      cancelAnimationFrame(raf);
      setPreviewing(false);
      if (audio) audio.pause();
    };
  };

  const renderVideo = async () => {
    if (slides.length === 0) { toast.error("أضف صوراً أولاً"); return; }
    if (slides.some((s) => !s.img)) { toast.error("جاري تحميل الصور..."); return; }
    if (totalDuration < 1) { toast.error("المدة قصيرة جداً"); return; }

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const stream = canvas.captureStream(FPS);

    // Mix audio if provided
    let audioCtx: AudioContext | null = null;
    let audioEl: HTMLAudioElement | null = null;
    if (audioUrl) {
      try {
        audioCtx = new AudioContext();
        audioEl = new Audio(audioUrl);
        audioEl.crossOrigin = "anonymous";
        const src = audioCtx.createMediaElementSource(audioEl);
        const dest = audioCtx.createMediaStreamDestination();
        src.connect(dest);
        src.connect(audioCtx.destination);
        dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
      } catch (e) {
        console.error("audio mix failed", e);
      }
    }

    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 6_000_000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    setRendering(true);
    setProgress(0);

    const done = new Promise<Blob>((resolve) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });

    recorder.start(100);
    if (audioEl) {
      try { await audioCtx!.resume(); } catch {}
      audioEl.currentTime = 0;
      try { await audioEl.play(); } catch {}
    }
    const start = performance.now();
    let raf = 0;
    await new Promise<void>((resolve) => {
      const loop = () => {
        const t = (performance.now() - start) / 1000;
        if (t >= totalDuration) {
          drawFrame(ctx, totalDuration);
          setProgress(100);
          resolve();
          return;
        }
        drawFrame(ctx, t);
        setProgress(Math.round((t / totalDuration) * 100));
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });
    cancelAnimationFrame(raf);
    if (audioEl) audioEl.pause();
    setTimeout(() => recorder.stop(), 200);

    const blob = await done;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `otaibi-montage-${Date.now()}.webm`;
    a.click();
    setRendering(false);
    toast.success("تم إنشاء الفيديو بنجاح");
    if (audioCtx) audioCtx.close();
  };

  const updateSlide = (id: string, patch: Partial<Slide>) => {
    setSlides((cur) => cur.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };
  const removeSlide = (id: string) => setSlides((cur) => cur.filter((s) => s.id !== id));
  const moveSlide = (id: string, dir: -1 | 1) => {
    setSlides((cur) => {
      const i = cur.findIndex((s) => s.id === id);
      if (i < 0) return cur;
      const j = i + dir;
      if (j < 0 || j >= cur.length) return cur;
      const copy = [...cur];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };

  return (
    <div className="min-h-screen bg-background font-cairo notranslate pb-24" dir="rtl">
      <header className="relative bg-card border-b border-border px-4 py-3 flex items-center justify-center sticky top-0 z-30 backdrop-blur">
        <button onClick={() => navigate("/")} className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-primary flex items-center gap-1 hover:text-primary/80">
          <ArrowRight className="w-4 h-4" /> الرئيسية
        </button>
        <div className="flex flex-col items-center gap-1.5">
          <div className="w-[34px] h-[34px] rounded-xl bg-primary/10 p-0.5 border border-primary/30 glow-gold">
            <img src={logo} alt="عتيبي ذكي" className="w-full h-full rounded-lg object-cover" />
          </div>
          <span className="text-[10px] font-bold text-primary/80 tracking-wide">صانع المونتاج العقاري</span>
        </div>
      </header>

      <audio ref={audioElRef} hidden />

      <main className="max-w-2xl mx-auto p-4 space-y-5">
        {/* Hero Info */}
        <div className="card-neon p-4 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/15 border border-primary/40 flex items-center justify-center shrink-0">
            <Film className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-extrabold text-foreground">مولّد الفيديو العقاري (9:16)</h2>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              مقاس عمودي جاهز للسناب والتيك توك (1080×1920). أضف الصور، صوت عُتيبي المسجّل، ونصوصاً متزامنة، ثم نزّل الفيديو النهائي.
            </p>
          </div>
        </div>

        {/* Voice upload */}
        <div className="card-neon p-4 space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Music className="w-4 h-4 text-primary" /> صوت عُتيبي المسجّل (التعليق الصوتي)
          </h3>
          <input ref={audioFileRef} type="file" accept="audio/*" hidden onChange={(e) => e.target.files?.[0] && onPickAudio(e.target.files[0])} />
          <button
            onClick={() => audioFileRef.current?.click()}
            className="w-full h-12 border border-dashed border-primary/40 rounded-lg text-xs text-foreground hover:bg-primary/5 flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4 text-primary" />
            {audioUrl ? `تم الرفع: ${audioName}` : "ارفع ملف صوت (mp3 / wav / m4a)"}
          </button>
          <p className="text-[10px] text-muted-foreground">
            المدة الكلية للفيديو ستتوافق مع مجموع مدد الصور أدناه — اضبط المدد لتطابق طول الصوت.
          </p>
        </div>

        {/* Brand */}
        <div className="card-neon p-4 space-y-3">
          <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
            <Type className="w-4 h-4 text-primary" /> هوية الفيديو
          </h3>
          <Field label="اسم العلامة (أعلى الفيديو)" value={brandTitle} onChange={setBrandTitle} />
          <Field label="الوصف القصير" value={brandSub} onChange={setBrandSub} />
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-muted-foreground">لون التمييز</label>
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-8 w-14 rounded border border-border bg-transparent" />
          </div>
        </div>

        {/* Slides */}
        <div className="card-neon p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" /> مشاهد الفيديو ({slides.length})
            </h3>
            <span className="text-[10px] text-muted-foreground">المدة الكلية: {totalDuration.toFixed(1)} ث</span>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => e.target.files && onPickImages(e.target.files)} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-12 border border-dashed border-primary/40 rounded-lg text-xs text-foreground hover:bg-primary/5 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-primary" /> أضف صور للمشاهد
          </button>

          <div className="space-y-3">
            {slides.map((s, i) => (
              <div key={s.id} className="border border-border rounded-lg p-3 bg-secondary/40 space-y-2">
                <div className="flex items-center gap-3">
                  <img src={s.url} alt="" className="w-14 h-20 object-cover rounded border border-border" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-primary font-bold">المشهد {i + 1}</span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => moveSlide(s.id, -1)} className="text-[10px] px-2 py-1 rounded border border-border hover:border-primary">▲</button>
                        <button onClick={() => moveSlide(s.id, 1)} className="text-[10px] px-2 py-1 rounded border border-border hover:border-primary">▼</button>
                        <button onClick={() => removeSlide(s.id)} className="text-destructive p-1 hover:bg-destructive/10 rounded">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <input
                      value={s.caption}
                      onChange={(e) => updateSlide(s.id, { caption: e.target.value })}
                      placeholder="نص المشهد (يظهر متزامناً مع الصوت)"
                      className="w-full bg-background border border-border rounded px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] text-muted-foreground">المدة (ثانية)</label>
                      <input
                        type="number" min={1} max={20} step={0.5}
                        value={s.duration}
                        onChange={(e) => updateSlide(s.id, { duration: Math.max(1, parseFloat(e.target.value) || 1) })}
                        className="w-20 bg-background border border-border rounded px-2 py-1 text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="card-neon p-3 space-y-3">
          <div className="relative bg-black rounded-lg overflow-hidden mx-auto" style={{ maxWidth: 280 }}>
            <canvas ref={canvasRef} className="w-full h-auto block" style={{ aspectRatio: "9/16" }} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {!previewing ? (
              <button onClick={playPreview} disabled={slides.length === 0} className="h-11 rounded-lg bg-secondary border border-border text-xs font-bold flex items-center justify-center gap-2 hover:border-primary disabled:opacity-50">
                <Play className="w-4 h-4 text-primary" /> معاينة
              </button>
            ) : (
              <button onClick={() => stopRef.current()} className="h-11 rounded-lg bg-secondary border border-destructive text-xs font-bold flex items-center justify-center gap-2 text-destructive">
                <Square className="w-4 h-4" /> إيقاف
              </button>
            )}
            <button
              onClick={renderVideo}
              disabled={rendering || slides.length === 0}
              className="h-11 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {rendering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {rendering ? `جاري الإنشاء... ${progress}%` : "تنزيل الفيديو (WebM)"}
            </button>
          </div>
          {rendering && (
            <div className="h-1.5 bg-secondary rounded overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <p className="text-[10px] text-muted-foreground text-center">
            النتيجة: فيديو عمودي 1080×1920 جاهز للنشر على السناب وتيك توك وريلز.
          </p>
        </div>
      </main>
    </div>
  );
};

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
