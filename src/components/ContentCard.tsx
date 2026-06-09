import { Sparkles, Upload, Wand2, CheckCircle, Video, Send, RefreshCw, Image as ImageIcon, Clock, LogIn } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Stage = "prompt" | "uploading" | "queued" | "rendering" | "done" | "error";

const BRAND_TAG = "Produced by Utaybi Smart · عُتيبي ذكي";

const SUGGESTIONS = [
  "إعلان تيك توك سريع لفيلا فاخرة في الرياض",
  "جولة سينمائية لشقة تمليك في جدة",
  "عرض مشروع سكني جديد للمستثمرين",
  "قصة قصيرة عن خدمة استشارات عقارية",
];

const safePath = (f: File) => {
  const ext =
    f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ||
    (f.type.startsWith("image/") ? "jpg" : "mp4");
  return `uploads/${Date.now()}_${crypto.randomUUID()}.${ext}`;
};

const ContentCard = () => {
  const [stage, setStage] = useState<Stage>("prompt");
  const [prompt, setPrompt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onCmd = (e: Event) => {
      const detail = (e as CustomEvent).detail as { prompt?: string };
      if (!detail?.prompt) return;
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      setPrompt(detail.prompt);
      toast({ title: "تم نقل أمرك للمونتاج الذكي", description: "ارفع صورة العقار ثم اضغط إنتاج الفيديو." });
    };
    window.addEventListener("utaybi:command", onCmd);
    return () => window.removeEventListener("utaybi:command", onCmd);
  }, []);

  // Realtime subscription on the current job
  useEffect(() => {
    if (!jobId) return;
    const ch = supabase
      .channel(`video_job_${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "video_jobs", filter: `id=eq.${jobId}` },
        (payload) => {
          const row = payload.new as any;
          if (row.status === "rendering") setStage("rendering");
          if (row.status === "done" && row.result_url) {
            setResultUrl(row.result_url);
            setStage("done");
            toast({ title: "الفيديو الإعلاني جاهز! 🎬" });
          }
          if (row.status === "failed") {
            setErrMsg(row.error || "فشل الإنتاج");
            setStage("error");
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [jobId]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []).find(
      (f) => f.type.startsWith("image/") || f.type.startsWith("video/"),
    );
    if (!selected) {
      toast({ title: "ارفع صورة أو فيديو", variant: "destructive" });
      return;
    }
    setFile(selected);
  };

  const enqueue = async () => {
    if (!prompt.trim() || !file) return;
    setErrMsg(null);
    setStage("uploading");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("سجّل الدخول أولاً");

      const path = safePath(file);
      const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const media_url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
      const is_video = file.type.startsWith("video/");

      // 1) Ask the AI montage planner to design a multi-scene timeline
      toast({ title: "المخرج الذكي يصمم السيناريو...", description: "خطة مونتاج من 5 مشاهد" });
      const { data: plan, error: planErr } = await supabase.functions.invoke("ai-montage-planner", {
        body: { prompt: prompt.trim(), media_url, is_video },
      });
      if (planErr) throw new Error(planErr.message);
      if (!plan?.ok) throw new Error(plan?.error || "فشل تخطيط المونتاج");

      // 2) Queue the job with the dynamic source
      const { data, error } = await supabase
        .from("video_jobs")
        .insert({
          user_id: auth.user.id,
          prompt: `${prompt.trim()}\n${BRAND_TAG}`,
          image_url: media_url,
          source: plan.source,
        })
        .select()
        .single();

      if (error) {
        if (error.message?.includes("row-level security") || error.code === "42501") {
          throw new Error("لقد استخدمت إنتاجك اليومي (1/يوم). جرّب غداً.");
        }
        throw error;
      }

      setJobId(data.id);
      setStage("queued");
      toast({ title: "في قائمة الانتظار", description: "المحرك يصنع الفيديو الآن." });
    } catch (e: any) {
      console.error(e);
      setErrMsg(e.message || "خطأ غير معروف");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("prompt");
    setPrompt("");
    setFile(null);
    setResultUrl(null);
    setJobId(null);
    setErrMsg(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div ref={cardRef} className="card-neon p-5 relative">
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

      {stage === "prompt" && (
        <div className="space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="اكتب أمرك مباشرة... مثال: إعلان تيك توك سريع لفيلا فاخرة في الرياض"
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
          <input ref={fileRef} type="file" accept="image/*,video/*" onChange={handleFiles} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-16 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10"
          >
            <Upload className="w-4 h-4 text-primary" />
            <p className="text-[10px] text-foreground font-bold">
              {file ? file.name : "ارفع صورة أو فيديو للعقار"}
            </p>
            <p className="text-[9px] text-muted-foreground">JPG · PNG · MP4 · MOV</p>
          </button>
          <button
            onClick={enqueue}
            disabled={!prompt.trim() || !file}
            className="w-full h-11 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" /> أنتج الفيديو الآن
          </button>
          <p className="text-[9px] text-muted-foreground text-center">حد يومي: إنتاج واحد لكل مستخدم</p>
        </div>
      )}

      {stage === "uploading" && (
        <div className="py-8 flex flex-col items-center gap-3">
          <Upload className="w-8 h-8 text-primary animate-bounce" />
          <p className="text-xs text-foreground font-bold">رفع الصورة...</p>
        </div>
      )}

      {stage === "queued" && (
        <div className="py-6 flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-xs text-foreground font-bold">في قائمة الانتظار للمعالجة</p>
          <p className="text-[10px] text-muted-foreground">سيبدأ الإنتاج خلال دقيقة وستظهر النتيجة هنا تلقائياً</p>
        </div>
      )}

      {stage === "rendering" && (
        <div className="py-8 flex flex-col items-center gap-3">
          <ImageIcon className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-xs text-foreground font-bold">المحرك يصنع الفيديو الآن...</p>
          <div className="w-40 h-1.5 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-blue-500 animate-pulse" style={{ width: "70%" }} />
          </div>
        </div>
      )}

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
          <p className="text-[11px] text-destructive text-center py-4">{errMsg || "حدث خطأ، حاول مرة أخرى"}</p>
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
