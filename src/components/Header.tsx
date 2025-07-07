
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { Link, useNavigate } from "react-router-dom";
import ThiingsIcon from "./ThiingsIcon";
import Web3WalletConnect from "./Web3WalletConnect";
import { User, LogOut } from "lucide-react";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, profile, signOut } = useUnifiedAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="bg-gray-900 border-b border-gray-700 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80">
            <ThiingsIcon name="skull3D" size={32} />
            <h1 className="text-2xl font-bold font-mono text-cyan-400">{title}</h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/shop" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="gem3D" size={16} className="mr-1" />
            Shop
          </Link>
          <Link to="/shortcuts" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="gear3D" size={16} className="mr-1" />
            Shortcuts
          </Link>
          <Link to="/seedvault" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="vault3D" size={16} className="mr-1" />
            SeedVault
          </Link>
          {(user || profile) && (
            <Link to="/bookmarks" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center">
              <ThiingsIcon name="star3D" size={16} className="mr-1" />
              Bookmarks
            </Link>
          )}
          <Link to="/cart" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="box3D" size={16} className="mr-1" />
            Cart
          </Link>
          
          <Web3WalletConnect />
          
          {(user || profile) ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm flex items-center">
                <ThiingsIcon name="crown3D" size={16} className="mr-1" />
                {profile?.username || user?.email?.split('@')[0] || 'User'}
              </span>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-gray-300 hover:text-cyan-400"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <ThiingsIcon name="gear3D" size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 border-t border-gray-700 pt-4">
          <Link to="/shop" className="block text-gray-300 hover:text-cyan-400 font-mono py-2 flex items-center">
            <ThiingsIcon name="gem3D" size={16} className="mr-2" />
            Shop
          </Link>
          <Link to="/shortcuts" className="block text-gray-300 hover:text-cyan-400 font-mono py-2 flex items-center">
            <ThiingsIcon name="gear3D" size={16} className="mr-2" />
            Shortcuts
          </Link>
          <Link to="/seedvault" className="block text-gray-300 hover:text-cyan-400 font-mono py-2 flex items-center">
            <ThiingsIcon name="vault3D" size={16} className="mr-2" />
            SeedVault
          </Link>
          {(user || profile) && (
            <Link to="/bookmarks" className="block text-gray-300 hover:text-cyan-400 font-mono py-2 flex items-center">
              <ThiingsIcon name="star3D" size={16} className="mr-2" />
              Bookmarks
            </Link>
          )}
          <Link to="/cart" className="block text-gray-300 hover:text-cyan-400 font-mono py-2 flex items-center">
            <ThiingsIcon name="box3D" size={16} className="mr-2" />
            Cart
          </Link>
          
          <div className="py-2">
            <Web3WalletConnect />
          </div>
          
          {(user || profile) ? (
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2 flex items-center">
                <ThiingsIcon name="crown3D" size={16} className="mr-2" />
                {profile?.username || user?.email?.split('@')[0] || 'User'}
              </p>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 w-full"
            >
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
