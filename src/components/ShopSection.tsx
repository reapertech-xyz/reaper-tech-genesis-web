import { Button } from "@/components/ui/button";
const ShopSection = () => {
  return <section className="bg-gray-900 text-white py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-cyan-400">
              Coming Soon: New Shop + Payments via Pi Network!
            </h2>
            
            <p className="text-2xl text-gray-200">
              Your one-stop shop for premium electronics accessories & servicing is coming soon!
            </p>

            <p className="text-2xl text-gray-200">
              Discover a wide range of products, including charging adapters, durable cables, high-quality screen protectors, and more.
            </p>

            <p className="text-2xl text-gray-200">
              Enjoy secure payments with Pi Network through trusted Escrow services, ensuring a smooth and protected shopping experience.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-gray-50 font-mono px-6 py-3 rounded-lg">
                ACCESSORIES
              </Button>
              <Button variant="outline" className="bg-gray-300 border-orange-500 text-orange-500 hover:bg-gray-800 font-mono px-6 py-3 rounded-lg">
                SERVICES
              </Button>
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
    </section>;
};
export default ShopSection;