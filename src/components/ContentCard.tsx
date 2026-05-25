import { FileText, Sparkles, Upload, Scissors, CheckCircle, Video, Image as ImageIcon, Film, Zap, Star, Layout } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type RenderStatus = "idle" | "uploading" | "processing" | "polling" | "done" | "error";
type Template = "cinematic" | "fast_cuts" | "slideshow" | "product" | "story";

const TEMPLATES: { id: Template; label: string; icon: any; desc: string }[] = [
  { id: "cinematic", label: "سينمائي", icon: Film, desc: "تدرّج لوني فخم + انتقالات ناعمة" },
  { id: "fast_cuts", label: "قطع سريعة", icon: Zap, desc: "إيقاع تيك توك / ريلز" },
  { id: "slideshow", label: "عرض صور", icon: ImageIcon, desc: "Ken Burns + موسيقى صامتة" },
  { id: "product", label: "عرض منتج", icon: Star, desc: "إبراز التفاصيل + Zoom" },
  { id: "story", label: "قصة قصيرة", icon: Layout, desc: "عنوان علوي + قطع متتالية" },
];

const ContentCard = () => {
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [files, setFiles] = useState<File[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [template, setTemplate] = useState<Template>("cinematic");
  const [title, setTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pollRender = async (id: string, attempts = 0): Promise<string | null> => {
    if (attempts > 40) return null; // ~2min
    await new Promise((r) => setTimeout(r, 3000));
    const { data } = await supabase.functions.invoke("creatomate-status", { body: { id } });
    if (data?.status === "succeeded" && data?.url) return data.url;
    if (data?.status === "failed") throw new Error(data?.error_message || "Render failed");
    return pollRender(id, attempts + 1);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    const valid = selected.filter((f) => f.type.startsWith("video/") || f.type.startsWith("image/"));
    if (!valid.length) {
      toast({ title: "اختر صور أو فيديوهات فقط", variant: "destructive" });
      return;
    }
    setFiles(valid);
    setStatus("uploading");
    try {
      const urls: string[] = [];
      for (const f of valid) {
        const path = `uploads/${Date.now()}_${f.name.replace(/\s+/g, "_")}`;
        const { error } = await supabase.storage.from("media").upload(path, f, { upsert: true });
        if (error) throw error;
        urls.push(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
      }

      setStatus("processing");
      const { data, error } = await supabase.functions.invoke("creatomate-render", {
        body: {
          media_urls: urls,
          template,
          title: title || undefined,
          aspect: "vertical",
        },
      });
      if (error) throw error;
      const render = Array.isArray(data) ? data[0] : data;
      if (!render?.id) throw new Error("لم يتم بدء المعالجة");

      if (render.url && render.status === "succeeded") {
        setResultUrl(render.url);
        setStatus("done");
        toast({ title: "تم المونتاج! 🎬" });
      } else {
        setStatus("polling");
        const url = await pollRender(render.id);
        if (url) {
          setResultUrl(url);
          setStatus("done");
          toast({ title: "تم المونتاج بنجاح! 🎬" });
        } else {
          // Still rendering — give user the URL anyway (Creatomate will fill it)
          setResultUrl(render.url || null);
          setStatus("done");
          toast({ title: "المعالجة تستغرق وقتاً إضافياً. الرابط جاهز قريباً." });
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      toast({ title: "حدث خطأ", description: err.message, variant: "destructive" });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const reset = () => {
    setStatus("idle");
    setFiles([]);
    setResultUrl(null);
  };

  const busy = status === "uploading" || status === "processing" || status === "polling";

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">مولّد الحلول البرمجية الإبداعية</h2>
          <p className="text-[10px] text-muted-foreground">قوالب احترافية بأسلوب CapCut · صور أو فيديو</p>
        </div>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-5 gap-1.5 mb-3">
        {TEMPLATES.map((t) => {
          const Icon = t.icon;
          const active = template === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTemplate(t.id)}
              disabled={busy}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border text-[9px] font-bold transition-all ${
                active
                  ? "border-primary bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.35)]"
                  : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="leading-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
      <p className="text-[9px] text-muted-foreground/80 text-center mb-3">
        {TEMPLATES.find((t) => t.id === template)?.desc}
      </p>

      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={busy}
        placeholder="عنوان على الفيديو (اختياري)"
        className="w-full h-9 px-3 mb-3 text-xs bg-secondary/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary"
      />

      <input
        ref={fileRef}
        type="file"
        accept="video/*,image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="aspect-[9/16] max-h-56 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        {status === "idle" && (
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-7 h-7 text-primary" />
            <p className="text-[11px] text-foreground font-bold">ارفع صور أو فيديوهات</p>
            <p className="text-[9px] text-muted-foreground">يمكن اختيار عدة ملفات</p>
          </button>
        )}
        {status === "uploading" && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <Upload className="w-6 h-6 text-primary animate-bounce" />
            <p className="text-[10px] text-muted-foreground">جاري رفع {files.length} ملف...</p>
          </div>
        )}
        {(status === "processing" || status === "polling") && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <Scissors className="w-6 h-6 text-primary animate-pulse" />
            <p className="text-[10px] text-muted-foreground">
              {status === "processing" ? "بدء المونتاج الذكي..." : "يتم إنتاج الفيديو..."}
            </p>
            <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-blue-500 animate-pulse" style={{ width: "70%" }} />
            </div>
          </div>
        )}
        {status === "done" && (
          <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center p-3">
            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-xs text-green-400 font-bold text-center">الفيديو جاهز 🎬</p>
          </div>
        )}
        {status === "error" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[10px] text-destructive">حدث خطأ، حاول مرة أخرى</p>
          </div>
        )}
      </div>

      {status === "done" || status === "error" ? (
        <div className="flex gap-2">
          {resultUrl && (
            <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2">
              <Video className="w-3.5 h-3.5" /> تحميل / مشاهدة
            </a>
          )}
          <button onClick={reset} className="flex-1 h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:border-primary transition-all">
            <Sparkles className="w-3.5 h-3.5" /> مونتاج جديد
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
          {status === "uploading" ? "جاري الرفع..." : busy ? "جاري المونتاج..." : "ابدأ المونتاج الذكي"}
        </button>
      )}
      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default ContentCard;
