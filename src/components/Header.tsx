
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

const Header = ({ title }: { title?: string }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <header className={`relative ${isHomePage ? 'min-h-screen' : 'h-auto'} bg-black text-white overflow-hidden`}>
      {/* Animated background effects - only on home page */}
      {isHomePage && (
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-blue-500/5 via-transparent to-cyan-500/5 rounded-full blur-2xl animate-spin" style={{
          animationDuration: '20s'
        }}></div>
        </div>
      )}

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center p-6 md:p-8">
        <Link to="/" className="flex items-center space-x-4">
          <img alt="Reaper Tech Logo" className="w-12 h-12 md:w-16 md:h-16" src="/lovable-uploads/f9eca089-3b42-4b20-9bc1-903799fff348.png" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-mono">REAPER TECH</h1>
            <p className="text-xs md:text-sm text-gray-400 font-mono">YOU REAP WHAT YOU SOW</p>
          </div>
        </Link>
        
        <div className="hidden md:flex space-x-8 font-mono text-sm">
          <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-cyan-400 transition-colors">About Us</Link>
          <Link to="/shortcuts" className="hover:text-cyan-400 transition-colors">iOS Shortcuts Gallery</Link>
          <Link to="/shop" className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded transition-colors text-black">Shop & Services</Link>
        </div>
      </nav>

      {/* Hero Content - only on home page */}
      {isHomePage && (
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-12">
          <div className="mb-8">
            <img alt="Reaper Tech" src="/lovable-uploads/737fa37e-72d2-4527-a59a-a57c7928eb10.png" className="w-80 h-80 md:w-48 md:h-48 mx-auto mb-8 animate-pulse" />
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

          <p className="text-2xl md:text-xl font-mono max-w-3xl mb-8 text-orange-500 ">
            With no rush, we move with purpose, not pressure...
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;
