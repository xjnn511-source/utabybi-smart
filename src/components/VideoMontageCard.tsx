import { Video, Upload, Sparkles } from "lucide-react";
import { useState } from "react";

const VideoMontageCard = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(false);

  const handleCreate = () => {
    setIsProcessing(true);
    setResult(false);
    setTimeout(() => {
      setIsProcessing(false);
      setResult(true);
    }, 4000);
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <Video className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">صانع فيديوهات المونتاج Ai</h2>
          <p className="text-[10px] text-muted-foreground">مونتاج فيديو احترافي بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="aspect-video max-h-36 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        {isProcessing ? (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] text-muted-foreground">جاري إنشاء الفيديو...</p>
          </div>
        ) : result ? (
          <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center p-3">
            <Sparkles className="w-7 h-7 text-primary mb-2" />
            <p className="text-xs text-primary font-bold text-center">فيديو المونتاج جاهز</p>
            <p className="text-[10px] text-muted-foreground mt-1">جاهز للتحميل والمشاركة</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <Upload className="w-5 h-5 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">ارفع صور العقار لإنشاء فيديو</p>
          </div>
        )}
      </div>

      <button
        onClick={handleCreate}
        disabled={isProcessing}
        className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Video className="w-3.5 h-3.5" strokeWidth={2} />
        {isProcessing ? "جاري المونتاج..." : "إنشاء فيديو مونتاج Ai"}
      </button>
      <span className="watermark">عُتيبي ذكي Ai 🤖</span>
    </div>
  );
};

export default VideoMontageCard;
