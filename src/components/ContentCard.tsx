import { Sparkles, Upload, Wand2, CheckCircle, Video, Send, RefreshCw, Edit3, Film, Zap, Image as ImageIcon, Star, Layout } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Stage = "prompt" | "planning" | "approve" | "uploading" | "rendering" | "polling" | "done" | "error";
type Template = "cinematic" | "fast_cuts" | "slideshow" | "product" | "story";

interface Plan {
  title: string;
  hook: string;
  script: string[];
  template: Template;
  cta: string;
}

const TEMPLATE_META: Record<Template, { label: string; icon: any }> = {
  cinematic: { label: "سينمائي فاخر", icon: Film },
  fast_cuts: { label: "قطع سريعة - تيك توك", icon: Zap },
  slideshow: { label: "عرض صور", icon: ImageIcon },
  product: { label: "عرض منتج", icon: Star },
  story: { label: "قصة قصيرة", icon: Layout },
};

const BRAND_TAG = "Produced by Utaybi Smart · عُتيبي ذكي";

const SUGGESTIONS = [
  "إعلان تيك توك سريع لفيلا فاخرة في الرياض",
  "جولة سينمائية لشقة تمليك في جدة",
  "عرض مشروع سكني جديد للمستثمرين",
  "قصة قصيرة عن خدمة استشارات عقارية",
];

const safePath = (f: File) => {
  const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || (f.type.startsWith("image/") ? "jpg" : "mp4");
  return `uploads/${Date.now()}_${crypto.randomUUID()}.${ext}`;
};

const ContentCard = () => {
  const [stage, setStage] = useState<Stage>("prompt");
  const [prompt, setPrompt] = useState("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const generatePlan = async () => {
    if (!prompt.trim()) {
      toast({ title: "اكتب طلبك التسويقي أولاً", variant: "destructive" });
      return;
    }
    setStage("planning");
    try {
      const { data, error } = await supabase.functions.invoke("ai-marketing-director", {
        body: { prompt },
      });
      if (error) throw error;
      if (!data?.plan) throw new Error("لم يتم استلام خطة");
      setPlan(data.plan);
      setStage("approve");
    } catch (e: any) {
      console.error(e);
      toast({ title: "فشل التوليد", description: e.message, variant: "destructive" });
      setStage("prompt");
    }
  };

  const pollRender = async (id: string, attempts = 0): Promise<string | null> => {
    if (attempts > 40) return null;
    await new Promise((r) => setTimeout(r, 3000));
    const { data } = await supabase.functions.invoke("creatomate-status", { body: { id } });
    if (data?.status === "succeeded" && data?.url) return data.url;
    if (data?.status === "failed") throw new Error(data?.error_message || "Render failed");
    return pollRender(id, attempts + 1);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).filter(
      (f) => f.type.startsWith("video/") || f.type.startsWith("image/")
    );
    if (!selected.length) return;
    setFiles(selected);
  };

  const generateVideo = async () => {
    if (!plan) return;
    if (!files.length) {
      toast({ title: "ارفع صور أو فيديوهات أولاً", variant: "destructive" });
      return;
    }
    setStage("uploading");
    try {
      const urls: string[] = [];
      for (const f of files) {
        const path = safePath(f);
        const { error } = await supabase.storage.from("media").upload(path, f, { upsert: true });
        if (error) throw error;
        urls.push(supabase.storage.from("media").getPublicUrl(path).data.publicUrl);
      }
      setStage("rendering");
      const { data, error } = await supabase.functions.invoke("creatomate-render", {
        body: {
          media_urls: urls,
          template: plan.template,
          title: plan.title,
          subtitle: `${plan.cta}  ·  ${BRAND_TAG}`,
          aspect: "vertical",
        },
      });
      if (error) throw error;
      const render = Array.isArray(data) ? data[0] : data;
      if (!render?.id) throw new Error("فشل بدء المعالجة");

      if (render.status === "succeeded" && render.url) {
        setResultUrl(render.url);
        setStage("done");
      } else {
        setStage("polling");
        const url = await pollRender(render.id);
        setResultUrl(url || render.url);
        setStage("done");
      }
      toast({ title: "الفيديو الإعلاني جاهز! 🎬" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "حدث خطأ", description: e.message, variant: "destructive" });
      setStage("error");
    }
  };

  const reset = () => {
    setStage("prompt");
    setPrompt("");
    setPlan(null);
    setFiles([]);
    setResultUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-[0_0_18px_hsl(var(--primary)/0.5)]">
          <Wand2 className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">مساعد التسويق الذكي</h2>
          <p className="text-[10px] text-muted-foreground">اكتب فكرتك · يكتبها · يصممها · ينتجها</p>
        </div>
        {stage !== "prompt" && (
          <button onClick={reset} className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* STAGE: PROMPT */}
      {stage === "prompt" && (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب فكرة الإعلان... مثال: إعلان تيك توك سريع لفيلا فاخرة"
            rows={3}
            className="w-full p-3 text-xs bg-secondary/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
          />
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="text-[9px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20"
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={generatePlan} className="w-full h-11 btn-neon text-xs flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> اكتب الخطة بالذكاء الاصطناعي
          </button>
        </div>
      )}

      {/* STAGE: PLANNING */}
      {stage === "planning" && (
        <div className="py-10 flex flex-col items-center gap-3">
          <Wand2 className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-xs text-muted-foreground">المخرج الذكي يكتب السكربت ويختار القالب...</p>
        </div>
      )}

      {/* STAGE: APPROVE */}
      {stage === "approve" && plan && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/30">
            <p className="text-[9px] text-muted-foreground mb-1">القالب المختار</p>
            <div className="flex items-center gap-2 mb-3">
              {(() => {
                const Icon = TEMPLATE_META[plan.template].icon;
                return <Icon className="w-4 h-4 text-primary" />;
              })()}
              <span className="text-xs font-bold text-foreground">{TEMPLATE_META[plan.template].label}</span>
            </div>
            <p className="text-[9px] text-muted-foreground mb-1">العنوان على الفيديو</p>
            <input
              value={plan.title}
              onChange={(e) => setPlan({ ...plan, title: e.target.value })}
              className="w-full h-8 px-2 mb-2 text-xs bg-background/60 border border-border rounded text-foreground focus:outline-none focus:border-primary"
            />
            <p className="text-[9px] text-muted-foreground mb-1">السيناريو</p>
            <ul className="space-y-1 mb-2">
              {plan.script.map((s, i) => (
                <li key={i} className="text-[10px] text-foreground/90 flex gap-1.5">
                  <span className="text-primary font-bold">{i + 1}.</span> {s}
                </li>
              ))}
            </ul>
            <p className="text-[9px] text-muted-foreground mb-1">دعوة الإجراء</p>
            <input
              value={plan.cta}
              onChange={(e) => setPlan({ ...plan, cta: e.target.value })}
              className="w-full h-8 px-2 text-xs bg-background/60 border border-border rounded text-foreground focus:outline-none focus:border-primary"
            />
          </div>

          {/* Upload */}
          <input ref={fileRef} type="file" accept="video/*,image/*" multiple onChange={handleFiles} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-16 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10"
          >
            <Upload className="w-4 h-4 text-primary" />
            <p className="text-[10px] text-foreground font-bold">
              {files.length ? `${files.length} ملف جاهز` : "ارفع صور / فيديوهات"}
            </p>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setStage("prompt")}
              className="h-10 px-3 bg-secondary border border-border rounded-[var(--radius)] text-[10px] font-bold text-muted-foreground hover:border-primary flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> تعديل
            </button>
            <button
              onClick={generateVideo}
              disabled={!files.length}
              className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> أنتج الفيديو الآن
            </button>
          </div>
        </div>
      )}

      {/* STAGE: PROCESSING */}
      {(stage === "uploading" || stage === "rendering" || stage === "polling") && (
        <div className="py-8 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            {stage === "uploading" ? (
              <Upload className="w-6 h-6 text-primary animate-bounce" />
            ) : (
              <Film className="w-6 h-6 text-primary animate-pulse" />
            )}
          </div>
          <p className="text-xs text-foreground font-bold">
            {stage === "uploading" ? "رفع الملفات..." : stage === "rendering" ? "بدء المونتاج الذكي..." : "إنتاج الفيديو الإعلاني..."}
          </p>
          <div className="w-40 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-blue-500 animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}

      {/* STAGE: DONE */}
      {stage === "done" && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <p className="text-xs font-bold text-green-400">الفيديو الإعلاني جاهز للنشر</p>
            <p className="text-[9px] text-muted-foreground">{BRAND_TAG}</p>
          </div>
          <div className="flex gap-2">
            {resultUrl && (
              <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2">
                <Video className="w-3.5 h-3.5" /> مشاهدة / تحميل
              </a>
            )}
            <button onClick={reset} className="flex-1 h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:border-primary">
              <Sparkles className="w-3.5 h-3.5" /> إعلان جديد
            </button>
          </div>
        </div>
      )}

      {stage === "error" && (
        <div className="space-y-3">
          <p className="text-[11px] text-destructive text-center py-4">حدث خطأ، حاول مرة أخرى</p>
          <button onClick={reset} className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> إعادة المحاولة
          </button>
        </div>
      )}

      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default ContentCard;
