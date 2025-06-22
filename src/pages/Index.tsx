import { useEffect, useState } from "react";

import Header from "@/components/Header";
import ShortcutsSection from "@/components/ShortcutsSection";
import ShopSection from "@/components/ShopSection";
import Web3Section from "@/components/Web3Section";
import Footer from "@/components/Footer";

type PageData = {
  title: string;
  slug: string;
};

const Index = () => {
  const [page, setPage] = useState<PageData | null>(null);

  useEffect(() => {
    import("../../content/pages/index.json")
      .then((mod) => setPage(mod.default))
      .catch((err) => console.error("Failed to load page content:", err));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      {page && (
        <div className="px-6 py-4 text-center">
          <h1 className="text-3xl font-bold">{page.title}</h1>
          <p className="text-sm text-gray-400 mt-2">Slug: {page.slug}</p>
        </div>
      )}
      <ShortcutsSection />
      <ShopSection />
      <Web3Section />
      <Footer />
    </div>
  );
};

export default Index;
