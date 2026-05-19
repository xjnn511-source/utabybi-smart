import { FileText, Sparkles, Loader2, Copy, RotateCcw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ContentCard = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [generated, setGenerated] = useState<string>("");

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-marketing-text", {
        body: {},
      });
      if (error) throw error;
      const text = (data as any)?.text?.trim();
      if (!text) throw new Error("لم يُرجع المحرك أي نص");
      setGenerated(text);
      toast({ title: "تم توليد النص التسويقي ✨" });
    } catch (e: any) {
      toast({
        title: "تعذر التوليد",
        description: e?.message || "حاول مجدداً",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generated);
    toast({ title: "تم نسخ النص" });
  };

  return (
    <div className="card-neon p-5 relative">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">مولّد النص التسويقي العقاري</h2>
          <p className="text-[10px] text-muted-foreground">نص جاهز للتعليق الصوتي بنبرة سعودية فخمة</p>
        </div>
      </div>

      {generated ? (
        <div className="space-y-3">
          <textarea
            dir="rtl"
            value={generated}
            onChange={(e) => setGenerated(e.target.value)}
            rows={7}
            className="w-full p-4 rounded-xl border-2 border-primary/30 bg-background text-sm text-foreground leading-loose resize-y focus:outline-none focus:ring-2 focus:ring-primary/40 font-cairo shadow-[inset_0_0_20px_rgba(191,90,242,0.05)]"
          />
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={copy}
              className="h-10 rounded-lg border border-primary/40 bg-primary/10 text-primary text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20"
            >
              <Copy className="w-3.5 h-3.5" /> نسخ
            </button>
            <button
              onClick={handleCreate}
              disabled={isCreating}
              className="h-10 rounded-lg bg-secondary border border-border text-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:border-primary disabled:opacity-60"
            >
              {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              توليد جديد
            </button>
            <button
              onClick={() => setGenerated("")}
              className="h-10 rounded-lg bg-secondary border border-border text-muted-foreground text-xs font-bold hover:border-primary hover:text-primary"
            >
              مسح
            </button>
          </div>
          <p className="text-[9px] text-muted-foreground/70 text-center">
            النص قابل للتعديل قبل إرساله لمحرك الصوت
          </p>
        </div>
      ) : (
        <>
          <div className="aspect-[4/3] max-h-40 rounded-lg overflow-hidden mb-3 relative bg-secondary border border-border">
            {isCreating ? (
              <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <p className="text-[10px] text-muted-foreground">جاري توليد النص التسويقي...</p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                <Sparkles className="w-6 h-6 text-primary/60" />
                <p className="text-[10px] text-muted-foreground">
                  اضغط الزر لتوليد نص تسويقي جاهز للقراءة والمشاركة
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />}
            {isCreating ? "جاري التوليد..." : "توليد حلول برمجية احترافية"}
          </button>
        </>
      )}

      <span className="watermark">عُتيبي ذكي 🤖</span>
    </div>
  );
};

export default ContentCard;
