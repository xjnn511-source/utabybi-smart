import { Mic, BarChart3, Search } from "lucide-react";
import { useState } from "react";

const SmartRadar = () => {
  const [budget, setBudget] = useState("");
  const [cities, setCities] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTimeout(() => setIsListening(false), 3000);
    }
  };

  const handleLaunch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 3000);
  };

  return (
    <div className="card-neon p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
          <BarChart3 className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">مُحلل السوق الذكي Ai</h2>
          <p className="text-[10px] text-muted-foreground">حلّل السوق العقاري بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">الميزانية (ريال)</label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="مثال: 500,000"
            className="w-full h-9 px-3 rounded-lg border border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-[10px] font-medium text-muted-foreground mb-1 block">المدن المستهدفة</label>
          <input
            type="text"
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder="مثال: الرياض، جدة، الدمام"
            className="w-full h-9 px-3 rounded-lg border border-border bg-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleVoice}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-all ${
            isListening
              ? "bg-destructive/10 border-destructive text-destructive animate-pulse"
              : "bg-secondary border-border text-muted-foreground hover:border-primary hover:text-primary"
          }`}
        >
          <Mic className="w-4 h-4" strokeWidth={2} />
        </button>

        <button
          onClick={handleLaunch}
          disabled={isSearching}
          className="flex-1 h-10 btn-neon text-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Search className="w-3.5 h-3.5" strokeWidth={2} />
          {isSearching ? "جاري التحليل..." : "أطلق المحلل الذكي"}
        </button>
      </div>

      {isSearching && (
        <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <p className="text-xs text-primary">جاري تحليل السوق العقاري...</p>
        </div>
      )}
    </div>
  );
};

export default SmartRadar;
