import { Button } from "@/components/ui/button";
import { Download, Share } from "lucide-react";
const ShortcutsSection = () => {
  return <section className="bg-black text-white py-16 md:py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold font-mono text-cyan-400">
              Showcasing Potential in Apple's "Shortcuts" App
            </h2>
            
            <p className="text-gray-300 text-lg leading-relaxed">
              Creating iOS shortcuts has become an exploration into the potential of automation and functionality. What began as simple workflow optimizations has evolved into ambitious projects that push the boundaries of what these shortcuts can achieve.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-mono">An AI-Powered Meme and Educational Subject Dissertation Generator</span>
              </div>
              <div className="text-cyan-400 font-mono pl-5 text-xl">"TiD-BiT 🧠"</div>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-mono">A sophisticated Encoding + Decoding White Space Steganographer</span>
              </div>
              <div className="text-cyan-400 font-mono pl-5 text-xl ">"White Steg 🐕"</div>

              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="font-mono">A comprehensive Pi (π) Network Cryptocurrency Wallet</span>
              </div>
              <div className="text-cyan-400 font-mono pl-5 flex items-center space-x-2">
                <span className="text-cyan-400 font-mono text-xl ">"Slice Of Pi 🥧"</span>
                <span className="text-orange-500 text-sm">(Currently in Development)</span>
              </div>
            </div>

            <p className="text-gray-400">
              Through these projects, the possibilities of iOS shortcuts are explored and expanded, transforming them into powerful tools that exceed expectations.
            </p>

            <Button className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono px-6 py-3 rounded-lg flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <Share className="w-4 h-4" />
              <span>DOWNLOAD & SHARE</span>
            </Button>
          </div>

          {/* Image */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur-xl"></div>
              <img src="/lovable-uploads/d58b2aad-a3c0-4c35-bf62-b7b7b9632189.png" alt="Reaper with circuit board background" className="relative w-full h-full md:w-96 object-cover rounded-lg border border-cyan-500/30" />
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default ShortcutsSection;