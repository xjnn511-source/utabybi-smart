import DashboardHeader from "@/components/DashboardHeader";
import BrainCard from "@/components/BrainCard";
import SmartRadar from "@/components/SmartRadar";
import VoiceCard from "@/components/VoiceCard";
import ContentCard from "@/components/ContentCard";
import VideoMontageCard from "@/components/VideoMontageCard";
import AiVideoEditor from "@/components/AiVideoEditor";
import BlessingCalculator from "@/components/BlessingCalculator";
import SubscriptionRow from "@/components/SubscriptionRow";
import AiChatbot from "@/components/AiChatbot";
import AppSidebar from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col max-w-md mx-auto relative">
          <DashboardHeader />

          <SidebarTrigger className="fixed top-3 left-3 z-50 w-9 h-9 rounded-lg bg-card border border-border text-primary hover:bg-secondary">
            <Menu className="w-4 h-4" />
          </SidebarTrigger>

          <main className="space-y-8 p-3 mt-2">
            <SmartRadar />
            <BrainCard />
            <AiVideoEditor />
            <ContentCard />
            <VideoMontageCard />
            <VoiceCard />
            <BlessingCalculator />
          </main>

          <section id="subscription-section" className="mt-8 pb-2">
            <h2 className="text-xs font-bold text-foreground px-4 mb-3">الباقات والحلول التقنية</h2>
            <SubscriptionRow />
          </section>

          {/* Legal Disclaimer */}
          <div className="mx-4 mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-[8px] text-muted-foreground leading-relaxed text-center">
              ⚖️ إخلاء مسؤولية قانوني: هذا التطبيق أداة برمجية مساعدة تعمل بالذكاء الاصطناعي ولا يُعدّ مستنداً رسمياً أو بديلاً عن الاستشارة المتخصصة.
              المسؤولية النهائية عن دقة البيانات تقع على عاتق المستخدم وحده.
            </p>
            <p className="text-[8px] text-muted-foreground/50 text-center mt-1">
              ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يُعرّض صاحبه للمساءلة القانونية.
            </p>
          </div>

          <Footer />

          <AiChatbot />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
