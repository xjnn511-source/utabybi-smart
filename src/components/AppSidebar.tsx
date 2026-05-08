import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Home, FileSearch, Megaphone, Radio, Calculator, CreditCard, Video, LayoutDashboard, Shield, Scissors, TrendingUp } from "lucide-react";
import logo from "@/assets/logo.png";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "الرئيسية", icon: Home, path: "/" },
  { title: "لوحة التحكم", icon: LayoutDashboard, path: "/dashboard" },
  { title: "معالج البيانات المنطقي", icon: FileSearch, path: "/" },
  { title: "محرك الأتمتة الصامتة", icon: Scissors, path: "/" },
  { title: "محرك أتمتة النصوص", icon: Megaphone, path: "/" },
  { title: "نظام المؤشرات الرقمية", icon: Radio, path: "/" },
  { title: "وحدة معالجة الوسائط المتعددة", icon: Video, path: "/" },
  { title: "نظام تقييم المؤشرات الرقمية", icon: TrendingUp, path: "/tiktok" },
  { title: "الحاسبة الرقمية", icon: Calculator, path: "/" },
  { title: "الاشتراكات", icon: CreditCard, path: "/" },
];

const AppSidebar = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();
        setIsAdmin(!!data);
      }
    };
    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-accent p-0.5">
            <img src={logo} alt="عتيبي ذكي" className="w-full h-full rounded-lg object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-sidebar-foreground">عُتيبي ذكي 🤖</h2>
            <p className="text-[10px] text-sidebar-foreground/60">القائمة الرئيسية</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">التنقل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => navigate(item.path)}
                    className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => navigate("/admin")}
                    className="text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent"
                  >
                    <Shield className="w-4 h-4" />
                    <span>لوحة تحكم المدير</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
