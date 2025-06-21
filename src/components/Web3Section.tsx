import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Web3Section = () => {
  const [domainName, setDomainName] = useState("");

  const handleDomainSearch = () => {
    if (domainName.trim()) {
      const searchUrl = 'https://freename.io/results?SO=S,C,T,F&search="{encodeURIComponent(domainName)}.reapertech"';
      window.open(searchUrl, '_blank');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDomainSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow letters, numbers, hyphens, and basic domain-safe characters
    // This regex allows alphanumeric characters, hyphens, and underscores
    const domainSafeRegex = /^[a-zA-Z0-9\-_]*$/;
    
    if (domainSafeRegex.test(value) || value === '') {
      setDomainName(value);
    }
  };

  return (
    <section className="bg-black text-white py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h2 className="text-3xl md:text-4xl font-bold font-mono text-cyan-400">
          WantToFurtherSupport.reapertech?
        </h2>
        
        <div className="space-y-6 text-gray-300">
          <p className="text-lg">
            Billions of SLDs (second level domains) under our TLD (Top level domain): 
            <span className="text-cyan-400 font-mono">.reapertech</span> are available for purchase! 
            Not only will you <span className="text-cyan-400 font-mono">forever</span> own a domain, 
            but you'll also be supporting Reaper Tech & taking <span className="text-cyan-400 font-mono">full ownership</span> of your Web3 identity!
          </p>
          
          <p className="text-sm">
            You can learn more about Web3 vs Web2 <a href="#" className="text-cyan-400 underline">here</a>
          </p>
        </div>

        <div className="bg-gray-900 p-8 rounded-lg border border-gray-700">
          <p className="text-gray-400 mb-6">
            Type your personal, business, or community's/organization's name in the text box below to see 
            the pricing and availability of the Web3 domain name of your choice. Domains range from 1$ to 
            over $1000 depending on the name, so you can often negotiate with yourself a bit and 
            Freename.io by finding more obscure names. And if you're feeling like splurging, explore some 
            more popular or common names as well. We just ask that you respect general identities, and allow 
            for others a chance to express a harmless version of your name as well. What truly matters in the 
            spaces of Web3 is not exactly <span className="text-cyan-400 font-mono">who you are</span>, but the 
            <span className="text-cyan-400 font-mono">relationships you share with others</span>.
          </p>

          <div className="space-y-4">
            <p className="font-mono">
              Ex: apple.reapertech is <span className="text-green-400">$247.50</span> while 
              ThisIsAnExample.reapertech is only <span className="text-green-400">$2.50</span>
            </p>
            <p className="text-sm text-gray-500">(pricing is algorithmically determined at Freename.io's sole discretion)</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 rounded-lg border border-orange-500/30">
          <p className="text-lg font-mono">
            Wait, there's more! Use promo code: <span className="text-orange-400">"VIP50OFFSLD"</span> to get{" "}
            <span className="text-orange-400 font-bold">50% off</span> your SLD of choice under{" "}
            <span className="text-cyan-400">.reapertech</span>
          </p>
          <p className="text-sm text-gray-400 mt-2">
            We'll feature each VIP that purchases an SLD under .reapertech on our page, and link to your domain's page!
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-mono text-cyan-400">Electronics aren't the only thing we love reaping!</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Your Name of Choice"
                value={domainName}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="bg-gray-800 border-cyan-500 text-white placeholder-gray-400 font-mono pr-28 focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-base"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400 font-mono text-sm">
                .reapertech
              </span>
            </div>
            <Button 
              onClick={handleDomainSearch}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <Search className="w-4 h-4" />
              <span>DOMAIN SEARCH</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Web3Section;
