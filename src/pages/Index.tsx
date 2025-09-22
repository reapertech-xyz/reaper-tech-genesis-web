
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import ShortcutsSection from "@/components/ShortcutsSection";
import ShopSection from "@/components/ShopSection";
import Web3Section from "@/components/Web3Section";
import Footer from "@/components/Footer";
import ThiingsIcon from "@/components/ThiingsIcon";

type PageData = {
  title: string;
  slug: string;
  headerTitle?: string;
  shop?: {
    title?: string;
    description?: string;
  };
  web3?: {
    cta?: string;
  };
};

const Index = () => {
  const [page, setPage] = useState<PageData | null>(null);

  useEffect(() => {
    import("../../content/pages/index.json").then(mod => setPage(mod.default)).catch(err => console.error("Failed to load page content:", err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title={page?.headerTitle} />
      
      {/* Hero Section */}
      <section className="bg-black text-white py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center mb-8 space-x-8">
            <ThiingsIcon name="blackCat" size={100} className="animate-pulse" />
            <ThiingsIcon name="gradientHoodie" size={120} />
            <ThiingsIcon name="purpleCatMystic" size={100} className="animate-pulse" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold font-mono mb-6">
            <span className="text-cyan-400">Grim</span><span className="text-orange-500">Ai</span>
          </h1>
          
          <p className="text-gray-400 text-lg mb-4 font-mono">
            (in development)
          </p>
          
          <div className="max-w-4xl mx-auto">
            <blockquote className="text-xl md:text-2xl leading-relaxed">
              <span className="text-cyan-400">"The future belongs to those who understand that </span>
              <span className="text-orange-500">technology is not just a tool, but a gateway to infinite possibilities."</span>
            </blockquote>
          </div>
        </div>
      </section>

      <ShortcutsSection />
      <ShopSection title={page?.shop?.title} description={page?.shop?.description} />
      <Web3Section cta={page?.web3?.cta} />
      <Footer />
    </div>
  );
};

export default Index;
