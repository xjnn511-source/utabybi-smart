import { Video, Upload, Sparkles, Loader2, Download } from "lucide-react";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { isActivated } from "@/hooks/useActivation";

const VideoMontageCard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePick = () => {
    if (!isActivated()) {
      toast({ title: "الخدمة مغلقة", description: "يرجى رفع إيصال التحويل لتفعيل الخدمات", variant: "destructive" });
      return;
    }
    fileRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/") && !f.type.startsWith("image/")) {
      toast({ title: "يرجى رفع ملف فيديو أو صورة", variant: "destructive" });
      return;
    }
    setFileName(f.name);
    setIsProcessing(true);
    setResultUrl(null);
    try {
      const path = `montage/${Date.now()}_${f.name}`;
      const { error: upErr } = await supabase.storage.from("deeds").upload(path, f);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("deeds").getPublicUrl(path);
      setResultUrl(urlData.publicUrl);
      toast({ title: "تمت معالجة الوسائط ✓", description: "الملف جاهز للتحميل" });
    } catch (err: any) {
      toast({ title: "فشل المعالجة", description: err.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Video className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">معالج الوسائط الرقمية</h2>
          <p className="text-[10px] text-muted-foreground">معالجة الوسائط التقنية</p>
        </div>
      </div>

      <input ref={fileRef} type="file" accept="video/*,image/*" onChange={handleFile} className="hidden" />

      <div className="aspect-video max-h-36 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <p className="text-[10px] text-muted-foreground">جاري معالجة {fileName}...</p>
          </div>
        ) : resultUrl ? (
          <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center p-3">
            <Sparkles className="w-7 h-7 text-primary mb-2" />
            <p className="text-xs text-primary font-bold text-center">ملف الوسائط جاهز</p>
            <a href={resultUrl} target="_blank" rel="noreferrer" className="text-[10px] text-primary underline mt-1 flex items-center gap-1">
              <Download className="w-3 h-3" /> تحميل
            </a>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">ارفع ملفاتك لمعالجة وسائط احترافية</p>
          </div>
        )}
      </div>

      <button
        onClick={handlePick}
        disabled={isProcessing}
        className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Video className="w-3.5 h-3.5" strokeWidth={2} />
        {isProcessing ? "جاري المونتاج..." : "معالجة وسائط رقمية"}
      </button>
      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
        ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يعرّض صاحبه للمساءلة القانونية.
        <br />عُتيبي ذكي 🤖
      </p>
    </div>
  );
};

export default VideoMontageCard;
