import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, TrendingUp, MousePointerClick, Eye, DollarSign, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface TikTokAd {
  id: string;
  name: string;
  spend: number;
  clicks: number;
  reach: number;
  date: string;
}

const BUDGET_LIMIT = 250;

const TikTokDashboard = () => {
  const navigate = useNavigate();
  const [ads, setAds] = useState<TikTokAd[]>(() => {
    const stored = localStorage.getItem("tiktok_ads");
    return stored ? JSON.parse(stored) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", spend: "", clicks: "", reach: "" });

  useEffect(() => {
    localStorage.setItem("tiktok_ads", JSON.stringify(ads));
  }, [ads]);

  const totalSpend = ads.reduce((s, a) => s + a.spend, 0);
  const totalClicks = ads.reduce((s, a) => s + a.clicks, 0);
  const totalReach = ads.reduce((s, a) => s + a.reach, 0);
  const remaining = BUDGET_LIMIT - totalSpend;

  const handleAdd = () => {
    if (!form.name || !form.spend) {
      toast({ title: "أدخل اسم الإعلان والمبلغ", variant: "destructive" });
      return;
    }
    const spend = Number(form.spend);
    if (totalSpend + spend > BUDGET_LIMIT) {
      toast({ title: `تجاوزت الميزانية! المتبقي ${remaining} ر.س`, variant: "destructive" });
      return;
    }
    setAds([
      ...ads,
      {
        id: Date.now().toString(),
        name: form.name,
        spend,
        clicks: Number(form.clicks) || 0,
        reach: Number(form.reach) || 0,
        date: new Date().toLocaleDateString("ar-SA"),
      },
    ]);
    setForm({ name: "", spend: "", clicks: "", reach: "" });
    setShowForm(false);
    toast({ title: "تم إضافة الإعلان ✓" });
  };

  const handleDelete = (id: string) => {
    setAds(ads.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">لوحة إعلانات TikTok 📱</h1>
          <p className="text-xs text-muted-foreground">تتبع الإنفاق والنقرات والوصول</p>
        </div>
        <button onClick={() => navigate("/")} className="text-xs text-primary flex items-center gap-1 hover:underline">
          <ArrowRight className="w-3 h-3" />
          الرئيسية
        </button>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-neon p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalSpend}</p>
            <p className="text-[10px] text-muted-foreground">إنفاق (ر.س)</p>
          </div>
          <div className="card-neon p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-600">{remaining}</p>
            <p className="text-[10px] text-muted-foreground">متبقي من {BUDGET_LIMIT} ر.س</p>
          </div>
          <div className="card-neon p-4 text-center">
            <MousePointerClick className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalClicks.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">نقرات</p>
          </div>
          <div className="card-neon p-4 text-center">
            <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xl font-bold text-foreground">{totalReach.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">وصول</p>
          </div>
        </div>

        {/* Budget Bar */}
        <div className="card-neon p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-foreground">ميزانية الإنفاق</span>
            <span className="text-[10px] text-muted-foreground">{totalSpend}/{BUDGET_LIMIT} ر.س</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min((totalSpend / BUDGET_LIMIT) * 100, 100)}%`,
                backgroundColor: totalSpend > BUDGET_LIMIT * 0.8 ? "hsl(0 84% 60%)" : "hsl(var(--primary))",
              }}
            />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full h-10 btn-neon text-xs flex items-center justify-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة إعلان جديد
        </button>

        {/* Form */}
        {showForm && (
          <div className="card-neon p-4 space-y-3">
            <input
              placeholder="اسم الإعلان"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <div className="grid grid-cols-3 gap-2">
              <input
                placeholder="الإنفاق (ر.س)"
                type="number"
                value={form.spend}
                onChange={(e) => setForm({ ...form, spend: e.target.value })}
                className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <input
                placeholder="النقرات"
                type="number"
                value={form.clicks}
                onChange={(e) => setForm({ ...form, clicks: e.target.value })}
                className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
              <input
                placeholder="الوصول"
                type="number"
                value={form.reach}
                onChange={(e) => setForm({ ...form, reach: e.target.value })}
                className="w-full bg-input border border-border rounded-lg py-2.5 px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>
            <button onClick={handleAdd} className="w-full h-9 btn-neon text-xs">
              حفظ الإعلان
            </button>
          </div>
        )}

        {/* Ads Table */}
        <div className="card-neon overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-secondary">
            <h2 className="text-sm font-bold text-foreground">الإعلانات ({ads.length})</h2>
          </div>
          {ads.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">الاسم</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">الإنفاق</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">النقرات</th>
                    <th className="px-3 py-2 text-right text-muted-foreground font-medium">الوصول</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                      <td className="px-3 py-2.5 text-foreground">{ad.name}</td>
                      <td className="px-3 py-2.5 text-foreground">{ad.spend} ر.س</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{ad.clicks}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{ad.reach.toLocaleString()}</td>
                      <td className="px-2 py-2.5">
                        <button onClick={() => handleDelete(ad.id)} className="text-destructive hover:text-destructive/80">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center py-8 text-xs text-muted-foreground">لا توجد إعلانات بعد</p>
          )}
        </div>
      </main>

      <footer className="text-center pb-6 px-4 mt-8">
        <p className="text-[9px] text-muted-foreground">عُتيبي ذكي Ai 🤖 – تتبع إعلانات TikTok</p>
      </footer>
    </div>
  );
};

export default TikTokDashboard;
