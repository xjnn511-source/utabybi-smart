import DashboardHeader from "@/components/DashboardHeader";
import BrainCard from "@/components/BrainCard";
import SmartRadar from "@/components/SmartRadar";
import VoiceCard from "@/components/VoiceCard";
import ContentCard from "@/components/ContentCard";
import BlessingCalculator from "@/components/BlessingCalculator";
import SubscriptionRow from "@/components/SubscriptionRow";
import AiChatbot from "@/components/AiChatbot";
import AppSidebar from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col max-w-md mx-auto relative">
          <DashboardHeader />

          {/* Sidebar trigger */}
          <SidebarTrigger className="fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-card border border-border text-primary hover:bg-secondary">
            <Menu className="w-4 h-4" />
          </SidebarTrigger>

          <main className="space-y-3 p-3">
            <SmartRadar />
            <BrainCard />
            <ContentCard />
            <VoiceCard />
            <BlessingCalculator />
          </main>

          <section className="mt-3 pb-2">
            <h2 className="text-xs font-bold text-foreground px-4 mb-2">الباقات والاشتراكات</h2>
            <SubscriptionRow />
          </section>

          <footer className="text-center pb-6 px-4">
            <p className="text-[9px] text-muted-foreground">
              عُتيبي ذكي Ai — منصتك الذكية للحلول العقارية
            </p>
          </footer>

          <AiChatbot />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
