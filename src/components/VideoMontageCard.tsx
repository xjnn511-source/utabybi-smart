import { Video, Upload, Download, Share2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Phase = "idle" | "uploading" | "processing" | "result" | "error";

const VideoMontageCard = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "يجب اختيار ملف فيديو", variant: "destructive" });
      return;
    }

    setFileName(file.name);
    setPhase("uploading");
    setErrorMsg("");

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `montage/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage.from("deeds").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (upErr) throw upErr;

      // Signed URL (deeds bucket is private) — long enough for Creatomate to fetch
      const { data: signed, error: signErr } = await supabase.storage
        .from("deeds")
        .createSignedUrl(path, 60 * 60);
      if (signErr || !signed?.signedUrl) throw signErr || new Error("تعذر إنشاء رابط آمن للفيديو");

      setPhase("processing");
      const { data, error } = await supabase.functions.invoke("creatomate-render", {
        body: {
          source_url: signed.signedUrl,
          modifications: { volume: "100%" },
        },
      });
      if (error) throw new Error(error.message || "فشل محرك المونتاج");

      const url = (data as any)?.url || (Array.isArray(data) && (data as any)[0]?.url) || null;
      if (!url) throw new Error("لم يُرجع المحرك رابط الفيديو النهائي");

      setResultUrl(url);
      setPhase("result");
      toast({ title: "تم! الفيديو جاهز 🎬" });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "فشل المعالجة");
      setPhase("error");
    }
  };

  const reset = () => {
    setPhase("idle");
    setResultUrl(null);
    setFileName("");
    setErrorMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const share = async () => {
    if (!resultUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "فيديو من عُتيبي ذكي", url: resultUrl });
      } catch {}
    } else {
      await navigator.clipboard.writeText(resultUrl);
      toast({ title: "تم نسخ رابط الفيديو" });
    }
  };

  // ============ RESULT VIEW (replaces card) ============
  if (phase === "result" && resultUrl) {
    return (
      <div className="card-neon p-4 relative">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-foreground">الفيديو النهائي 🎬</h2>
          <button onClick={reset} className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowRight className="w-3 h-3" /> رجوع
          </button>
        </div>

        <div className="mx-auto bg-black rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_rgba(191,90,242,0.25)]" style={{ aspectRatio: "9 / 16", maxWidth: "260px" }}>
          <video
            ref={videoRef}
            src={resultUrl}
            controls
            playsInline
            className="w-full h-full object-cover bg-black"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <a
            href={resultUrl}
            download={`utaybi-montage-${Date.now()}.mp4`}
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 btn-neon text-xs flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            تحميل
          </a>
          <button
            onClick={share}
            className="h-10 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            مشاركة
          </button>
        </div>

        <p className="text-[8px] text-muted-foreground/60 text-center mt-3 leading-relaxed">
          ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يعرّض صاحبه للمساءلة القانونية.
        </p>
      </div>
    );
  }

  // ============ DEFAULT / WORKING VIEW ============
  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Video className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">معالج الوسائط الرقمية</h2>
          <p className="text-[10px] text-muted-foreground">رفع فيديو ومعالجته بمقاس 9:16</p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="video/*" className="hidden" onChange={handleFile} />

      <div className="aspect-video max-h-36 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        {phase === "idle" && (
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-5 h-5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">اختر فيديو لرفعه ومعالجته</p>
          </button>
        )}
        {phase === "uploading" && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <Upload className="w-5 h-5 text-primary animate-bounce" />
            <p className="text-[10px] text-muted-foreground">جاري الرفع... {fileName}</p>
          </div>
        )}
        {phase === "processing" && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-[10px] text-muted-foreground">المحرك يعالج الفيديو الآن...</p>
          </div>
        )}
        {phase === "error" && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center p-3 text-center">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-[10px] text-destructive">{errorMsg}</p>
          </div>
        )}
      </div>

      <button
        onClick={() => (phase === "error" ? reset() : fileRef.current?.click())}
        disabled={phase === "uploading" || phase === "processing"}
        className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <Video className="w-3.5 h-3.5" strokeWidth={2} />
        {phase === "idle" && "معالجة وسائط رقمية"}
        {phase === "uploading" && "جاري الرفع..."}
        {phase === "processing" && "جاري المونتاج..."}
        {phase === "error" && "حاول مجدداً"}
      </button>

      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
        ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يعرّض صاحبه للمساءلة القانونية.
        <br />عُتيبي ذكي 🤖
      </p>
    </div>
  );
};

export default VideoMontageCard;
