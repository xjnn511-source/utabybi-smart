import { Palette, Sparkles } from "lucide-react";
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
    <div className="card-clean p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
          <Palette className="w-5 h-5 text-accent-foreground" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">صانع المحتوى العقاري</h2>
          <p className="text-xs text-text-dim">تصميم تلقائي لبوسترات سناب وتيكتوك</p>
        </div>
      </div>

      <div className="aspect-[9/16] max-h-48 rounded-lg overflow-hidden mb-4 relative bg-secondary border border-border">
        {isCreating ? (
          <div className="absolute inset-0 flex flex-col gap-3 p-4 items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-text-dim">جاري إنشاء التصميم...</p>
          </div>
        ) : posterReady ? (
          <div className="absolute inset-0 bg-accent flex flex-col items-center justify-center p-4">
            <Sparkles className="w-8 h-8 text-primary mb-2" />
            <p className="text-sm text-primary font-medium text-center">بوستر عقاري جاهز</p>
            <p className="text-xs text-text-dim mt-1">٩:١٦ — جاهز للنشر</p>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-text-dim">معاينة التصميم</p>
          </div>
        )}
      </div>

      <button
        onClick={handleCreate}
        className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="w-4 h-4" strokeWidth={2} />
        {isCreating ? "جاري التصميم التلقائي..." : "إنشاء بوستر تلقائي"}
      </button>
    </div>
  );
};

export default ContentCard;
