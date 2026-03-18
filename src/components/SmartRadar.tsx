import { Mic, Radar, Search } from "lucide-react";
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
    <div className="card-clean p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Radar className="w-5 h-5 text-primary-foreground" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">رادار الإعلانات الذكي</h2>
          <p className="text-xs text-text-dim">ابحث عن أفضل الفرص العقارية بالذكاء الاصطناعي</p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">الميزانية (ريال)</label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="مثال: 500,000"
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">المدن المستهدفة</label>
          <input
            type="text"
            value={cities}
            onChange={(e) => setCities(e.target.value)}
            placeholder="مثال: الرياض، جدة، الدمام"
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-text-dim focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleVoice}
          className={`w-12 h-12 rounded-lg border flex items-center justify-center transition-colors ${
            isListening
              ? "bg-destructive border-destructive text-destructive-foreground"
              : "bg-secondary border-border text-text-dim hover:border-primary hover:text-primary"
          }`}
        >
          <Mic className="w-5 h-5" strokeWidth={2} />
        </button>

        <button
          onClick={handleLaunch}
          disabled={isSearching}
          className="flex-1 h-12 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          <Search className="w-4 h-4" strokeWidth={2} />
          {isSearching ? "جاري البحث..." : "أطلق الرادار"}
        </button>
      </div>

      {isSearching && (
        <div className="mt-4 p-4 rounded-lg bg-accent border border-border text-center">
          <p className="text-sm text-accent-foreground">جاري البحث في الإعلانات العقارية...</p>
        </div>
      )}
    </div>
  );
};

export default SmartRadar;
