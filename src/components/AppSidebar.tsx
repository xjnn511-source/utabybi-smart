import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, Home, FileSearch, Megaphone, Radio, Calculator, CreditCard } from "lucide-react";
import logo from "@/assets/logo.png";
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
  { title: "الرئيسية", icon: Home, id: "home" },
  { title: "محلل الصكوك", icon: FileSearch, id: "analyzer" },
  { title: "صانع العروض", icon: Megaphone, id: "offers" },
  { title: "مُحلل السوق الذكي", icon: Radio, id: "radar" },
  { title: "حاسبة البركة", icon: Calculator, id: "calculator" },
  { title: "الاشتراكات", icon: CreditCard, id: "subscriptions" },
];

const AppSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <Sidebar side="right" collapsible="offcanvas">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-background p-0.5 border border-border">
            <img src={logo} alt="عتيبي ذكي" className="w-full h-full rounded-lg object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-bold neon-text">عُتيبي ذكي Ai</h2>
            <p className="text-[10px] text-muted-foreground">القائمة الرئيسية</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">التنقل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton className="text-foreground hover:text-primary">
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
