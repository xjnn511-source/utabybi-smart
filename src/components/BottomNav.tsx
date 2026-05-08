import { Home, Radio, FileSearch, Scissors } from "lucide-react";

const tabs = [
  { id: "home", icon: Home, label: "الرئيسية" },
  { id: "radar", icon: Radio, label: "نظام الفحص" },
  { id: "analyze", icon: FileSearch, label: "المعالج الرقمي" },
  { id: "editor", icon: Scissors, label: "محرك الأتمتة" },
];

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const cyan = "hsl(180 100% 50%)";
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t max-w-md mx-auto" style={{ borderColor: "hsl(var(--deed-cyan) / 0.2)" }}>
      <div className="flex items-center justify-around py-2 px-2">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "border shadow-[0_0_15px_hsla(180,100%,50%,0.2)]"
                  : "hover:opacity-80"
              }`}
              style={isActive ? { color: cyan, background: "hsla(180,100%,50%,0.1)", borderColor: "hsla(180,100%,50%,0.25)" } : { color: "hsl(var(--muted-foreground))" }}
            >
              <Icon className="w-5 h-5" style={isActive ? { filter: `drop-shadow(0 0 6px ${cyan})` } : undefined} />
              <span className="text-[9px] font-bold text-center">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
