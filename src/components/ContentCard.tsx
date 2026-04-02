import { FileText, Sparkles } from "lucide-react";
import { useState } from "react";

const ContentCard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [posterReady, setPosterReady] = useState(false);

  const handleCreate = () => {
    setIsCreating(true);
    setPosterReady(false);
    setTimeout(() => {
      setIsCreating(false);
      setPosterReady(true);
    }, 3500);
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Creative Content AI Generator</h2>
          <p className="text-[10px] text-muted-foreground">إنشاء محتوى تسويقي احترافي بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="aspect-[4/3] max-h-40 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
        {isCreating ? (
          <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
            <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] text-muted-foreground">جاري إنشاء المحتوى التسويقي...</p>
          </div>
        ) : posterReady ? (
          <div className="absolute inset-0 bg-primary/5 flex flex-col items-center justify-center p-3">
            <Sparkles className="w-7 h-7 text-primary mb-2" />
            <p className="text-xs text-primary font-bold text-center">محتوى تسويقي احترافي جاهز</p>
            <p className="text-[10px] text-muted-foreground mt-1">جاهز للتحميل والمشاركة</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-[10px] text-muted-foreground">معاينة المحتوى التسويقي</p>
          </div>
        )}
      </div>

      <button
        onClick={handleCreate}
        className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2"
      >
        <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
        {isCreating ? "جاري التصميم..." : "إنشاء محتوى تسويقي احترافي"}
      </button>
      <span className="watermark">عُتيبي ذكي Ai 🤖</span>
    </div>
  );
};

export default ContentCard;
