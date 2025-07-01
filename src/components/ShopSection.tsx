
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ThiingsIcon from "./ThiingsIcon";

const ShopSection = ({
  title,
  description
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <section className="bg-gray-900 text-white py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-cyan-400 flex items-center">
              <ThiingsIcon name="orangeCatTech" size={40} className="mr-4" />
              {title || "Coming Soon: New Shop + Payments via Pi Network!"}
            </h2>
            
            <p className="text-2xl text-gray-200 flex items-center">
              <ThiingsIcon name="smartphone" size={24} className="mr-3" />
              Your one-stop shop for premium electronics accessories & servicing is now here!
            </p>

            <p className="text-2xl text-gray-200 flex items-center">
              <ThiingsIcon name="gameController" size={24} className="mr-3" />
              {description || "Discover a wide range of products, including charging adapters, durable cables, high-quality screen protectors, and more."}
            </p>

            <p className="text-2xl text-gray-200 flex items-center">
              <ThiingsIcon name="blockchain" size={24} className="mr-3" />
              Enjoy secure card payments via Stripe, or crypto payments with your web3 wallet(s), even with Pi Network
(through escrow service only: Coinskro.com)
Each option ensures flexible, smooth, and protected shopping experiences!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/shop">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-gray-50 font-mono px-6 py-3 rounded-lg w-full sm:w-auto flex items-center">
                  <ThiingsIcon name="blueCatHeart" size={20} className="mr-2" />
                  ACCESSORIES
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" className="bg-gray-300 border-orange-500 text-orange-500 hover:bg-gray-800 hover:text-orange-800 font-mono px-6 py-3 rounded-lg w-full sm:w-auto flex items-center">
                  <ThiingsIcon name="yellowCatSun" size={20} className="mr-2" />
                  SERVICES
                </Button>
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-xl"></div>
              <img src="/lovable-uploads/bd222062-3e34-4686-9281-e8f428f4c6df.png" alt="Electronics Accessories & Services Shop" className="relative w-full max-w-md lg:max-w-lg object-contain rounded-lg border border-cyan-500/30" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopSection;
