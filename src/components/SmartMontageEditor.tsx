import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle, Send, Loader2, Clock, Film, RefreshCw, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { executeAutomatedMontage } from "@/lib/automateMontage";


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
      const narration = useVoice ? voiceText.trim().slice(0, 600) : "";
      setStage("rendering");
      toast({ title: "المحرك يصنع المحتوى الآن...", description: "تحليل الأمر · سيناريو · مونتاج" });
      const url = await executeAutomatedMontage(media, narration, 30, script.trim());

      setResultUrl(url);
      setStage("done");
      toast({ title: "المحتوى جاهز! 🎬" });
    } catch (e: any) {
      console.error(e);
      setErrMsg(e.message || "خطأ غير معروف");
      setStage("error");
    }
  };


  const reset = () => {
    setStage("editor");
    setScript("");
    setVoiceText("");
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

          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-primary" /> دمج صوتي الشخصي (مستنسخ)
              </span>
              <input
                type="checkbox"
                checked={useVoice}
                onChange={(e) => setUseVoice(e.target.checked)}
                className="w-4 h-4 accent-[hsl(var(--primary))]"
              />
            </label>
            {useVoice && (
              <textarea
                className="w-full h-16 p-3 text-[11px] bg-secondary/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
                onChange={(e) => setVoiceText(e.target.value)}
                value={voiceText}
                maxLength={600}
                placeholder="نص التعليق الصوتي (اختياري) — يُستخدم أمر المونتاج تلقائياً إن تُرك فارغاً. حد 600 حرف لتوفير الرصيد."
              />
            )}
          </div>

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
