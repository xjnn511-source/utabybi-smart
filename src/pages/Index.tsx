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
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <DashboardHeader />

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
        <p className="text-[9px] text-text-dim">
          عُتيبي ذكي Ai — منصتك الذكية للحلول العقارية
        </p>
      </footer>

      <AiChatbot />
    </div>
  );
};

export default Index;
