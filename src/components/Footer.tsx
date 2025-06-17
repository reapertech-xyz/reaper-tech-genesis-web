
import { Instagram, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6 border-t border-gray-700">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Navigation Links */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-mono">About us</a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-mono">iOS Shortcuts Gallery</a>
          </div>

          {/* Social Links */}
          <div className="flex justify-center md:justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">
              <Facebook className="w-6 h-6" />
            </a>
          </div>

          {/* Shop & Services Button */}
          <div className="flex justify-center md:justify-end">
            <a 
              href="#" 
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono px-6 py-2 rounded-lg transition-colors"
            >
              Shop & Services
            </a>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 font-mono">© 2025</p>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-mono text-sm">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors font-mono text-sm">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
