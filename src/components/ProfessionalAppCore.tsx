import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle, Send, Loader2, ShieldCheck, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// إعدادات الربط التقني
const CONFIG = {
  BANK_IBAN: "SA3780000322608016224462", // Otaibi Tech Solutions
  BANK_NAME: "Otaibi Tech Solutions — عُتيبي ذكي Hub",
};

type Stage = "verify" | "editor" | "uploading" | "queued" | "rendering" | "done" | "error";

const BRAND_TAG = "Produced by Utaybi Smart · عُتيبي ذكي";

const safePath = (f: File) => {
  const ext = f.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  return `receipts/${Date.now()}_${crypto.randomUUID()}.${ext}`;
};

export const ProfessionalAppCore = () => {
  const [stage, setStage] = useState<Stage>("verify");
  const [script, setScript] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const receiptRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<HTMLInputElement>(null);

  // متابعة حالة المهمة لحظياً
  useEffect(() => {
    if (!jobId) return;
    const ch = supabase
      .channel(`pro_job_${jobId}`)
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

  const handleReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    toast({ title: "تم استلام إيصال التحويل ✅", description: "تم تفعيل المحرر." });
    setStage("editor");
  };

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

  const sendToVideoProduction = async () => {
    if (!script.trim() || !media) {
      toast({ title: "أدخل السكربت وارفع وسائط العقار", variant: "destructive" });
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

      toast({ title: "المخرج الذكي يصمم السيناريو...", description: "خطة مونتاج متعددة المشاهد" });
      const { data: plan, error: planErr } = await supabase.functions.invoke("ai-montage-planner", {
        body: { prompt: script.trim(), media_url, is_video },
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
      toast({ title: "في قائمة الانتظار", description: "المحرك يصنع الفيديو الآن." });
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
    <div dir="rtl" className="notranslate min-h-screen bg-background text-foreground flex items-start justify-center p-4">
      <div className="w-full max-w-md space-y-5 mt-6">
        <div className="text-center space-y-1">
          <h1 className="text-lg font-bold text-foreground">المحرر الاحترافي — عُتيبي ذكي</h1>
          <p className="text-[11px] text-muted-foreground">توليد حلول برمجية احترافية · محرك الإنتاج المرئي</p>
        </div>

        {/* مرحلة التحقق البنكي */}
        {stage === "verify" && (
          <div className="card-neon p-5 space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <ShieldCheck className="w-5 h-5" />
              <p className="text-xs font-bold">تفعيل المحرر عبر التحويل البنكي</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              يرجى رفع إيصال التحويل البنكي لـ {CONFIG.BANK_NAME} لتفعيل المحرر.
            </p>
            <div className="p-3 rounded-lg bg-secondary/60 border border-border">
              <p className="text-[10px] text-muted-foreground">رقم الآيبان (IBAN)</p>
              <p className="text-xs font-bold text-primary tracking-wide">{CONFIG.BANK_IBAN}</p>
            </div>
            <input ref={receiptRef} type="file" accept="image/*,application/pdf" onChange={handleReceipt} className="hidden" />
            <button
              onClick={() => receiptRef.current?.click()}
              className="w-full h-12 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10"
            >
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-bold">رفع إيصال التحويل البنكي</span>
            </button>
          </div>
        )}

        {/* مرحلة المحرر */}
        {stage === "editor" && (
          <div className="card-neon p-5 space-y-3">
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <p className="text-xs font-bold">تم التفعيل — المحرر جاهز</p>
            </div>
            <textarea
              className="w-full h-40 p-4 text-xs bg-secondary/60 border border-border rounded-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary resize-none"
              onChange={(e) => setScript(e.target.value)}
              value={script}
              placeholder="أدخل بيانات الصك أو فكرتك لتحويلها لسكربت إعلاني..."
            />
            <input ref={mediaRef} type="file" accept="image/*,video/*" onChange={handleMedia} className="hidden" />
            <button
              onClick={() => mediaRef.current?.click()}
              className="w-full h-14 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center gap-1 hover:bg-primary/10"
            >
              <Upload className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold">{media ? media.name : "ارفع صورة أو فيديو للعقار"}</span>
            </button>
            <button
              onClick={sendToVideoProduction}
              disabled={!script.trim() || !media}
              className="w-full h-11 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" /> إرسال للإنتاج المرئي
            </button>
            <p className="text-[9px] text-muted-foreground text-center">حد يومي: إنتاج واحد لكل مستخدم</p>
          </div>
        )}

        {stage === "uploading" && (
          <div className="card-neon p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold">رفع الوسائط وتجهيز السيناريو...</p>
          </div>
        )}

        {stage === "queued" && (
          <div className="card-neon p-6 flex flex-col items-center gap-3">
            <Clock className="w-7 h-7 text-primary animate-pulse" />
            <p className="text-xs font-bold">في قائمة الانتظار للمعالجة</p>
            <p className="text-[10px] text-muted-foreground text-center">سيبدأ الإنتاج خلال دقيقة وستظهر النتيجة هنا تلقائياً</p>
          </div>
        )}

        {stage === "rendering" && (
          <div className="card-neon p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs font-bold">المحرك يصنع الفيديو الآن...</p>
          </div>
        )}

        {stage === "done" && (
          <div className="card-neon p-5 space-y-3">
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <p className="text-xs font-bold text-green-400">الفيديو الإعلاني جاهز للنشر</p>
              <p className="text-[9px] text-muted-foreground">{BRAND_TAG}</p>
            </div>
            <div className="flex gap-2">
              {resultUrl && (
                <a href={resultUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2">
                  مشاهدة / تحميل
                </a>
              )}
              <button onClick={reset} className="flex-1 h-10 bg-secondary border border-border text-xs font-bold rounded-[var(--radius)] hover:border-primary">
                إعلان جديد
              </button>
            </div>
          </div>
        )}

        {stage === "error" && (
          <div className="card-neon p-5 space-y-3">
            <p className="text-[11px] text-destructive text-center py-2">{errMsg || "حدث خطأ، حاول مرة أخرى"}</p>
            <button onClick={reset} className="w-full h-10 btn-neon text-xs">إعادة المحاولة</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalAppCore;
