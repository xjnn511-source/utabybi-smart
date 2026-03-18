import DashboardHeader from "@/components/DashboardHeader";
import BrainCard from "@/components/BrainCard";
import SmartRadar from "@/components/SmartRadar";
import VoiceCard from "@/components/VoiceCard";
import ContentCard from "@/components/ContentCard";
import BlessingCalculator from "@/components/BlessingCalculator";
import SubscriptionRow from "@/components/SubscriptionRow";
import AiChatbot from "@/components/AiChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-secondary max-w-md mx-auto relative">
      <DashboardHeader />

      <main className="space-y-4 p-4">
        <SmartRadar />
        <BrainCard />
        <VoiceCard />
        <ContentCard />
        <BlessingCalculator />
      </main>

      <section className="mt-4 pb-2">
        <h2 className="text-sm font-bold text-foreground px-4 mb-3">الاشتراكات</h2>
        <SubscriptionRow />
      </section>

      <footer className="text-center pb-8 px-4">
        <p className="text-[10px] text-text-dim">
          منصتك الذكية للحلول العقارية المبتكرة
        </p>
      </footer>

      <AiChatbot />
    </div>
  );
};

export default Index;
