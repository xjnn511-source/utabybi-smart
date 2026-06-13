import { useState } from "react";
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
import ServiceQuickGrid from "@/components/ServiceQuickGrid";
import BottomNav from "@/components/BottomNav";
import DeedAnalyzer from "@/components/DeedAnalyzer";
import AiEnginePortal from "@/components/AiEnginePortal";
import PaymentActivation from "@/components/PaymentActivation";
import LockGate from "@/components/LockGate";
import SmartMontageEditor from "@/components/SmartMontageEditor";
import SmartWelcome from "@/components/SmartWelcome";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu, LayoutGrid } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col max-w-md mx-auto relative pb-20">
          <DashboardHeader />

          <SidebarTrigger className="fixed top-4 left-3 z-50 w-9 h-9 rounded-lg bg-card border border-primary/20 text-primary hover:bg-secondary">
            <Menu className="w-4 h-4" />
          </SidebarTrigger>

          {/* News Ticker */}
          <div className="bg-card/80 border-b border-border overflow-hidden py-2.5">
            <div className="animate-marquee whitespace-nowrap flex gap-10 text-[11px] font-bold text-primary">
              <span>✨ تم تحديث دقة محرك قراءة الوثائق إلى 99.8%</span>
              <span>🚀 تسريع عمليات معالجة الصكوك التقنية</span>
              <span>📊 معالجة 10,000 نقطة بيانات لتحديث السوق</span>
              <span>✨ تم تحديث دقة محرك قراءة الوثائق إلى 99.8%</span>
              <span>🚀 تسريع عمليات معالجة الصكوك التقنية</span>
            </div>
          </div>

          <main className="space-y-8 p-4 mt-4">
            {/* ترحيب ذكي تلقائي بصوت المالك */}
            <SmartWelcome />

            {/* بوابة الدفع والتفعيل — لا يتم فك القفل إلا بعد رفع الإيصال */}
            <section id="activation-section">
              <PaymentActivation />
            </section>

            {/* جميع الأدوات الحالية مقفلة حتى التحقق من الإيصال */}
            <LockGate label="لوحة الأدوات مقفلة">
              <div className="space-y-8">
                {/* Quick Access Grid */}
                <ServiceQuickGrid />

                {/* نظام معالجة الوثائق */}
                <DeedAnalyzer />

                {/* بوابة المحركات البرمجية */}
                <AiEnginePortal />

                {/* Digital Compliance Section */}
                <ComplianceSection />

                {/* عنوان محركات المعالجة */}
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  محركات المعالجة والأنظمة البرمجية المؤتمتة
                </h2>

                <SmartRadar />
                <BrainCard />
                <AiVideoEditor />
                <ContentCard />
                <VideoMontageCard />
                <VoiceCard />
                <NewsTicker />

                {/* المحرر الذكي للمونتاج وصناعة المحتوى */}
                <SmartMontageEditor />
              </div>
            </LockGate>

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
              ⚖️ إخلاء مسؤولية قانوني: هذا التطبيق منصة برمجية مساعدة تعمل بأنظمة برمجية مؤتمتة لمعالجة البيانات وتوليد
              الحلول، ولا يُعدّ بديلاً عن الاستشارة المتخصصة. المسؤولية النهائية عن دقة البيانات تقع على عاتق المستخدم
              وحده.
            </p>
            <p className="text-[8px] text-muted-foreground/50 text-center mt-1">
              ⚠️ صوت "عُتيبي ذكي" محمي بعلامة مائية رقمية. الاستخدام غير المصرح به يُعرّض صاحبه للمساءلة القانونية.
            </p>
          </div>

          <Footer />

          <AiChatbot />
          <BottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
