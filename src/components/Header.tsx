import { useState } from "react";
import { Button } from "@/components/ui/button";
const Header = () => {
  return <header className="relative min-h-full bg-black text-white overflow-hidden">
      {/* Animated background effects */}
      

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:p-8">
        <div className="flex items-center space-x-4">
          <img alt="Reaper Tech Logo" className="w-12 h-12 md:w-16 md:h-16" src="/lovable-uploads/f9eca089-3b42-4b20-9bc1-903799fff348.png" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-mono">REAPER TECH</h1>
            <p className="text-xs md:text-sm text-gray-400 font-mono">YOU REAP WHAT YOU SOW</p>
          </div>
        </div>
        
        <div className="hidden md:flex space-x-8 font-mono text-sm">
          <a href="#" className="hover:text-cyan-400 transition-colors">Home</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">About Us</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">iOS Shortcuts Gallery</a>
          <a href="#" className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded transition-colors">Shop & Services</a>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12">
        <div className="mb-8">
          <img alt="Reaper Tech" className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-8 animate-pulse" src="/lovable-uploads/737fa37e-72d2-4527-a59a-a57c7928eb10.png" />
        </div>

        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-mono px-8 py-3 rounded-lg mb-12 animate-pulse">
          GrimAI (Coming Soon)
        </Button>

        <div className="max-w-4xl mx-auto mb-8">
          <div className="border-2 border-cyan-500 bg-black/50 backdrop-blur-sm p-6 md:p-8 rounded-lg animate-fade-in">
            <h2 className="text-2xl md:text-4xl font-mono font-bold mb-4 text-cyan-400">
              The best way to get things done is by never rushing the process.
            </h2>
          </div>
        </div>

        <p className="text-lg md:text-xl text-gray-300 font-mono max-w-3xl mb-8">
          With no rush, we move with purpose, not pressure...
        </p>
      </div>
    </header>;
};
export default Header;