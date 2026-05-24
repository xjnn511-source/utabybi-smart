import { FileText, Sparkles, Upload, Scissors, Volume2, CheckCircle, Video } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type RenderStatus = "idle" | "uploading" | "processing" | "done" | "error";

const ContentCard = () => {
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "يجب اختيار ملف فيديو", variant: "destructive" });
      return;
    }
    setFileName(file.name);
    setStatus("uploading");
    try {
      const path = `videos/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("deeds").upload(path, file);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("deeds").getPublicUrl(path);

      setStatus("processing");
      const { data, error } = await supabase.functions.invoke("creatomate-render", {
        body: { source_url: urlData.publicUrl, modifications: { volume: "100%" } },
      });
      if (error) throw error;

      if (data?.[0]?.url) {
        setResultUrl(data[0].url);
      }
      setStatus("done");
      toast({ title: "تم تنفيذ المونتاج الذكي بنجاح! 🎬" });
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      toast({ title: "حدث خطأ أثناء المعالجة", description: err.message, variant: "destructive" });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const reset = () => {
    setStatus("idle");
    setFileName("");
    setResultUrl(null);
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">مولّد الحلول البرمجية الإبداعية</h2>
          <p className="text-[10px] text-muted-foreground">المونتاج الذكي بأنظمة برمجية مؤتمتة</p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />

      <div className="aspect-[4/3] max-h-40 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        {status === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">ارفع فيديو لبدء المونتاج الذكي</p>
          </div>
        )}
        {status === "uploading" && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <Upload className="w-6 h-6 text-primary animate-bounce" />
            <p className="text-[10px] text-muted-foreground">جاري رفع الفيديو...</p>
            <p className="text-[9px] text-muted-foreground/70">{fileName}</p>
          </div>
        )}
        {status === "processing" && (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-primary animate-pulse" />
              <Volume2 className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <p className="text-[10px] text-muted-foreground">جاري المونتاج الذكي...</p>
          </div>
        )}
        {status === "done" && (
          <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center p-3">
            <CheckCircle className="w-7 h-7 text-green-600 mb-2" />
            <p className="text-xs text-green-700 font-bold text-center">المونتاج جاهز 🎬</p>
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
              <Video className="w-3.5 h-3.5" /> تحميل الفيديو
            </a>
          )}
          <button onClick={reset} className="flex-1 h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:border-primary transition-all">
            <Sparkles className="w-3.5 h-3.5" /> فيديو جديد
          </button>
        </div>
      ) : (
        <button
          onClick={handleClick}
          disabled={!isPaid || status !== "idle"}
          style={!isPaid ? { pointerEvents: "none", opacity: 0.5 } : undefined}
          className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {!isPaid ? <Lock className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />}
          {status === "uploading" ? "جاري الرفع..." : status === "processing" ? "جاري المونتاج..." : "توليد حلول برمجية احترافية"}
        </button>
      )}
      {!isPaid && (
        <p className="text-[9px] text-muted-foreground/70 text-center mt-2">🔒 مغلق — يفعّل بعد رفع إيصال التحويل</p>
      )}
      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default ContentCard;
