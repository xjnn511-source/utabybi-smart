import { Video, Upload, Scissors, Volume2, Sparkles, CheckCircle, ShieldAlert } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { isActivated } from "@/hooks/useActivation";

type RenderStatus = "idle" | "uploading" | "processing" | "done" | "error";

const AiVideoEditor = () => {
  const [status, setStatus] = useState<RenderStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    };
    checkAdmin();
  }, []);

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
      const { error: uploadError } = await supabase.storage
        .from("deeds")
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("deeds").getPublicUrl(path);

      setStatus("processing");

      const { data, error } = await supabase.functions.invoke("creatomate-render", {
        body: {
          source_url: urlData.publicUrl,
          modifications: {
            volume: "100%",
          },
        },
      });

      if (error) throw error;

      if (data?.[0]?.url) {
        setResultUrl(data[0].url);
        setStatus("done");
        toast({ title: "تم تحرير الفيديو بنجاح! 🎬" });
      } else if (data?.[0]?.status === "planned" || data?.[0]?.status === "rendering") {
        setStatus("done");
        toast({ title: "تم إرسال الفيديو للمعالجة! ستصلك النتيجة قريباً 🎬" });
      } else {
        setStatus("done");
        toast({ title: "تمت المعالجة بنجاح!" });
      }
    } catch (err: any) {
      console.error("Video processing error:", err);
      setStatus("error");
      toast({
        title: "حدث خطأ أثناء المعالجة",
        description: err.message || "حاول مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const reset = () => {
    setStatus("idle");
    setFileName("");
    setResultUrl(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // Loading state
  if (isAdmin === null) {
    return (
      <div className="card-neon p-5 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Scissors className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">المُحرر البرمجي الصامت 🎬</h2>
            <p className="text-[10px] text-muted-foreground">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  // Non-admin: show locked card
  if (!isAdmin) {
    return (
      <div className="card-neon p-5 relative opacity-75">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
            <Scissors className="w-5 h-5 text-primary" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">المُحرر البرمجي الصامت 🎬</h2>
            <p className="text-[10px] text-muted-foreground">حذف الصمت + صوت احترافي بأنظمة برمجية مؤتمتة</p>
          </div>
        </div>
        <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-2">
          <ShieldAlert className="w-8 h-8 text-muted-foreground" />
          <p className="text-xs text-muted-foreground font-bold">خاصية حصرية للمدير</p>
          <p className="text-[10px] text-muted-foreground">هذه الأداة متاحة فقط لمالك المنصة</p>
        </div>
        <span className="watermark">عُتيبي ذكي 🤖</span>
      </div>
    );
  }

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Scissors className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">المُحرر البرمجي الصامت 🎬</h2>
          <p className="text-[10px] text-muted-foreground">حذف الصمت + صوت احترافي بأنظمة برمجية مؤتمتة</p>
        </div>
        <span className="mr-auto text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
          مدير ✓
        </span>
      </div>

      <input
        type="file"
        ref={fileRef}
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="aspect-video max-h-36 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        {status === "idle" && (
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 transition-colors"
          >
            <Upload className="w-6 h-6 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">ارفع فيديو لتحريره بأنظمة برمجية مؤتمتة</p>
          </button>
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
            <p className="text-[10px] text-muted-foreground">جاري حذف الصمت وإضافة الصوت...</p>
            <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: "60%" }} />
            </div>
          </div>
        )}

        {status === "done" && (
          <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center p-3">
            <CheckCircle className="w-7 h-7 text-green-600 mb-2" />
            <p className="text-xs text-green-700 font-bold text-center">تم تحرير الفيديو بنجاح! 🎬</p>
            <p className="text-[10px] text-muted-foreground mt-1">جاهز للتحميل والمشاركة</p>
          </div>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-[10px] text-destructive">حدث خطأ، حاول مرة أخرى</p>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {status === "done" || status === "error" ? (
          <>
            {resultUrl && (
              <a
                href={resultUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2"
              >
                <Video className="w-3.5 h-3.5" />
                تحميل الفيديو
              </a>
            )}
            <button onClick={reset} className="flex-1 h-10 bg-secondary border border-border text-foreground text-xs font-bold rounded-[var(--radius)] flex items-center justify-center gap-2 hover:border-primary transition-all">
              <Sparkles className="w-3.5 h-3.5" />
              فيديو جديد
            </button>
          </>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={status !== "idle"}
            className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Scissors className="w-3.5 h-3.5" strokeWidth={2} />
            {status === "idle" ? "ارفع فيديو وحرّره بأنظمة برمجية مؤتمتة" : "جاري المعالجة..."}
          </button>
        )}
      </div>

      {/* Voice Brand Protection Notice */}
      <p className="text-[8px] text-muted-foreground/50 text-center mt-2 leading-relaxed">
        ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يعرّض صاحبه للمساءلة القانونية.
        <br />عُتيبي ذكي 🤖
      </p>

      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default AiVideoEditor;
