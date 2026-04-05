import { Home, Radio, FileSearch, Scissors } from "lucide-react";

const tabs = [
  { id: "home", icon: Home, label: "الرئيسية" },
  { id: "radar", icon: Radio, label: "الرادار" },
  { id: "analyze", icon: FileSearch, label: "تحليل الصك" },
  { id: "editor", icon: Scissors, label: "المحرر" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-primary/20 max-w-md mx-auto">
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary bg-primary/10 border border-primary/25 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                  : "text-muted-foreground hover:text-primary/70"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "icon-glow" : ""}`} />
              <span className="text-[9px] font-bold text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
