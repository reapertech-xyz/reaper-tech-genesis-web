
import Header from "@/components/Header";
import ShortcutsSection from "@/components/ShortcutsSection";
import ShopSection from "@/components/ShopSection";
import Web3Section from "@/components/Web3Section";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <ShortcutsSection />
      <ShopSection />
      <Web3Section />
      <Footer />
    </div>
  );
};

export default Index;
