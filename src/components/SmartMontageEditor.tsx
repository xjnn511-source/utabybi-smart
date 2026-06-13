import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle, Send, Loader2, Clock, Film, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Stage = "editor" | "uploading" | "queued" | "rendering" | "done" | "error";

const BRAND_TAG = "Produced by Utaybi Smart · عُتيبي ذكي";

const safePath = (f: File) => {
  const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `editor/${Date.now()}_${crypto.randomUUID()}.${ext}`;
};

const SmartMontageEditor = () => {
  const [stage, setStage] = useState<Stage>("editor");
  const [script, setScript] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [useVoice, setUseVoice] = useState(true);
  const [voiceText, setVoiceText] = useState("");
  const mediaRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!jobId) return;
    const ch = supabase
      .channel(`editor_job_${jobId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "video_jobs", filter: `id=eq.${jobId}` },
        (payload) => {
          const row = payload.new as any;
          if (row.status === "rendering") setStage("rendering");
          if (row.status === "done" && row.result_url) {
            setResultUrl(row.result_url);
            setStage("done");
            toast({ title: "المحتوى جاهز! 🎬" });
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

  const handleMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = Array.from(e.target.files || []).find(
      (x) => x.type.startsWith("image/") || x.type.startsWith("video/"),
    );
    if (!f) {
      toast({ title: "ارفع صورة أو فيديو", variant: "destructive" });
      return;
    }
    setMedia(f);
  };

  const produce = async () => {
    if (!script.trim() || !media) {
      toast({ title: "أدخل أمر المونتاج وارفع الوسائط", variant: "destructive" });
      return;
    }
    const { data: pre } = await supabase.auth.getUser();
    if (!pre.user) {
      toast({ title: "سجّل الدخول أولاً", description: "الإنتاج يتطلب حساباً مسجّلاً." });
      window.location.href = "/auth";
      return;
    }
    setErrMsg(null);
    setStage("uploading");
    try {
      const path = safePath(media);
      const { error: upErr } = await supabase.storage.from("media").upload(path, media, { upsert: true });
      if (upErr) throw upErr;
      const media_url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
      const is_video = media.type.startsWith("video/");

      // Generate the owner's cloned voiceover (Voice ID locked server-side) when enabled.
      let voice_url: string | null = null;
      if (useVoice) {
        const narration = (voiceText.trim() || script.trim()).slice(0, 600);
        toast({ title: "توليد التعليق الصوتي بصوتك...", description: "صوت مستنسخ خاص بك" });
        const { data: tts, error: ttsErr } = await supabase.functions.invoke("tts-voice", {
          body: { text: narration, upload: true },
        });
        if (ttsErr) throw new Error(ttsErr.message);
        if (!tts?.ok) throw new Error(tts?.error || "فشل توليد الصوت");
        voice_url = tts.audio_url || null;
      }

      toast({ title: "المخرج الذكي يصمم السيناريو...", description: "خطة مونتاج متعددة المشاهد" });
      const { data: plan, error: planErr } = await supabase.functions.invoke("ai-montage-planner", {
        body: { prompt: script.trim(), media_url, is_video, voice_url },
      });
      if (planErr) throw new Error(planErr.message);
      if (!plan?.ok) throw new Error(plan?.error || "فشل تخطيط المونتاج");

      const { data, error } = await supabase
        .from("video_jobs")
        .insert({
          user_id: pre.user.id,
          prompt: `${script.trim()}\n${BRAND_TAG}`,
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
      toast({ title: "في قائمة الانتظار", description: "المحرك يصنع المحتوى الآن." });
    } catch (e: any) {
      console.error(e);
      setErrMsg(e.message || "خطأ غير معروف");
      setStage("error");
    }
  };

  const reset = () => {
    setStage("editor");
    setScript("");
    setMedia(null);
    setResultUrl(null);
    setJobId(null);
    setErrMsg(null);
    if (mediaRef.current) mediaRef.current.value = "";
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-[0_0_18px_hsl(var(--primary)/0.5)]">
          <Film className="w-5 h-5 text-white" strokeWidth={2.2} />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-foreground">المحرر الذكي للمونتاج وصناعة المحتوى</h2>
          <p className="text-[10px] text-muted-foreground">أرسل أمر المونتاج · يصمم · ينفّذ · ينتج</p>
        </div>
        {stage !== "editor" && (
          <button onClick={reset} className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-primary">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {stage === "editor" && (
        <div className="space-y-3">
          <textarea
            className="w-full h-32 p-4 text-xs bg-secondary/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
            onChange={(e) => setScript(e.target.value)}
            value={script}
            placeholder="اكتب أمر المونتاج... مثال: ركّب فيديو إعلاني سينمائي لتطبيقي مع موسيقى وانتقالات سريعة"
          />
          <input ref={mediaRef} type="file" accept="image/*,video/*" onChange={handleMedia} className="hidden" />
          <button
            onClick={() => mediaRef.current?.click()}
            className="w-full h-14 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10"
          >
            <Upload className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-bold">{media ? media.name : "ارفع صورة أو فيديو للمونتاج"}</span>
          </button>
          <button
            onClick={produce}
            disabled={!script.trim() || !media}
            className="w-full h-11 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" /> نفّذ المونتاج الآن
          </button>
          <p className="text-[9px] text-muted-foreground text-center">حد يومي: إنتاج واحد لكل مستخدم</p>
        </div>
      )}

      {stage === "uploading" && (
        <div className="py-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold">رفع الوسائط وتجهيز السيناريو...</p>
        </div>
      )}

      {stage === "queued" && (
        <div className="py-6 flex flex-col items-center gap-3">
          <Clock className="w-7 h-7 text-primary animate-pulse" />
          <p className="text-xs font-bold">في قائمة الانتظار للمعالجة</p>
          <p className="text-[10px] text-muted-foreground text-center">سيبدأ الإنتاج خلال دقيقة وستظهر النتيجة هنا تلقائياً</p>
        </div>
      )}

      {stage === "rendering" && (
        <div className="py-8 flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs font-bold">المحرك يصنع المحتوى الآن...</p>
        </div>
      )}

      {stage === "done" && (
        <div className="space-y-3">
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex flex-col items-center gap-2">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <p className="text-xs font-bold text-green-400">المحتوى جاهز للنشر</p>
            <p className="text-[9px] text-muted-foreground">{BRAND_TAG}</p>
          </div>
          <div className="flex gap-2">
            {resultUrl && (
              <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2">
                مشاهدة / تحميل
              </a>
            )}
            <button onClick={reset} className="flex-1 h-10 bg-secondary border border-border text-xs font-bold rounded-[var(--radius)] hover:border-primary">
              مشروع جديد
            </button>
          </div>
        </div>
      )}

      {stage === "error" && (
        <div className="space-y-3">
          <p className="text-[11px] text-destructive text-center py-4">{errMsg || "حدث خطأ، حاول مرة أخرى"}</p>
          <button onClick={reset} className="w-full h-10 btn-neon text-xs">إعادة المحاولة</button>
        </div>
      )}

      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default SmartMontageEditor;
