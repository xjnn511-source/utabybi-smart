import DashboardHeader from "@/components/DashboardHeader";
import BrainCard from "@/components/BrainCard";
import SmartRadar from "@/components/SmartRadar";
import VoiceCard from "@/components/VoiceCard";
import ContentCard from "@/components/ContentCard";
import VideoMontageCard from "@/components/VideoMontageCard";
import AiVideoEditor from "@/components/AiVideoEditor";
import NewsTicker from "@/components/BlessingCalculator";
import SubscriptionRow from "@/components/SubscriptionRow";
import AiChatbot from "@/components/AiChatbot";
import AppSidebar from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import ComplianceSection from "@/components/ComplianceSection";
import SubscriptionCTA from "@/components/SubscriptionCTA";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, LayoutGrid } from "lucide-react";

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
            {/* Digital Compliance Section */}
            <ComplianceSection />

            {/* AI Engines Section Header */}
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-primary" />
              محركات المعالجة والذكاء الاصطناعي
            </h2>

            <SmartRadar />
            <BrainCard />
            <AiVideoEditor />
            <ContentCard />
            <VideoMontageCard />
            <VoiceCard />
            <NewsTicker />

            {/* Subscription CTA */}
            <SubscriptionCTA />
          </main>

          <section id="subscription-section" className="mt-8 pb-2">
            <h2 className="text-xs font-bold text-foreground px-4 mb-3">الباقات والحلول البرمجية</h2>
            <SubscriptionRow />
          </section>

          {/* Legal Disclaimer */}
          <div className="mx-4 mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-[8px] text-muted-foreground leading-relaxed text-center">
              ⚖️ إخلاء مسؤولية قانوني: هذا التطبيق منصة برمجية مساعدة تعمل بالذكاء الاصطناعي لتحليل البيانات وإنشاء المحتوى، ولا يُعدّ بديلاً عن الاستشارة المتخصصة.
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
