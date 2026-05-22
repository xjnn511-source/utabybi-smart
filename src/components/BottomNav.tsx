import { useNavigate, useLocation } from "react-router-dom";
import { Home, Zap, Cpu, Search } from "lucide-react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "الرئيسية", path: "/" },
    { icon: Zap, label: "محرك الأتمتة", path: "/automation" },
    { icon: Cpu, label: "المعالج الرقمي", path: "/digital-processor" },
    { icon: Search, label: "نظام الفحص", path: "/" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 py-3 px-6 flex justify-between items-center z-[9999]">
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`flex flex-col items-center gap-1 transition-all ${
            location.pathname === item.path ? "text-cyan-400" : "text-slate-400"
          }`}
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
