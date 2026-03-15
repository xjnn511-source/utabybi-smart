import DashboardHeader from "@/components/DashboardHeader";
import BrainCard from "@/components/BrainCard";
import VoiceCard from "@/components/VoiceCard";
import ContentCard from "@/components/ContentCard";
import BlessingCalculator from "@/components/BlessingCalculator";
import SubscriptionRow from "@/components/SubscriptionRow";
import AiChatbot from "@/components/AiChatbot";

const Index = () => {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <DashboardHeader />

      <main className="space-y-4 px-4 pb-4">
        <BrainCard />
        <VoiceCard />
        <ContentCard />
        <BlessingCalculator />
      </main>

      <section className="mt-4">
        <h2 className="text-base font-light text-foreground px-4 mb-3">الاشتراكات</h2>
        <SubscriptionRow />
      </section>

      <footer className="text-center pb-8 px-4">
        <p className="text-[10px] text-text-dim/40 font-thin">
          عقاراتك، تُدار بذكاء العتبان
        </p>
      </footer>

      <AiChatbot />
    </div>
  );
};

export default Index;
