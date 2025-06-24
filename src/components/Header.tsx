
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import ThiingsIcon from "./ThiingsIcon";
import { user as userIcon, log-out } from "lucide-react";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, signOut } = useAuth();
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
            <ThiingsIcon name="reaperHood" size={32} />
            <h1 className="text-2xl font-bold font-mono text-cyan-400">{title}</h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/shop" className="text-gray-300 hover:text-cyan-400 font-mono">
            Shop
          </Link>
          <Link to="/shortcuts" className="text-gray-300 hover:text-cyan-400 font-mono">
            Shortcuts
          </Link>
          {user && (
            <Link to="/bookmarks" className="text-gray-300 hover:text-cyan-400 font-mono">
              Bookmarks
            </Link>
          )}
          <Link to="/cart" className="text-gray-300 hover:text-cyan-400 font-mono">
            Cart
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">
                Welcome, {user.email?.split('@')[0]}
              </span>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400"
              >
                <log-out className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              asChild
              variant="outline"
              className="border-cyan-400 text-cyan-400 hover:bg-cyan-400/10"
            >
              <Link to="/auth">
                <userIcon className="h-4 w-4 mr-2" />
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
          <ThiingsIcon name="wifi" size={24} />
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 space-y-2 border-t border-gray-700 pt-4">
          <Link to="/shop" className="block text-gray-300 hover:text-cyan-400 font-mono py-2">
            Shop
          </Link>
          <Link to="/shortcuts" className="block text-gray-300 hover:text-cyan-400 font-mono py-2">
            Shortcuts
          </Link>
          {user && (
            <Link to="/bookmarks" className="block text-gray-300 hover:text-cyan-400 font-mono py-2">
              Bookmarks
            </Link>
          )}
          <Link to="/cart" className="block text-gray-300 hover:text-cyan-400 font-mono py-2">
            Cart
          </Link>
          
          {user ? (
            <div className="pt-2 border-t border-gray-700">
              <p className="text-gray-400 text-sm mb-2">
                Welcome, {user.email?.split('@')[0]}
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
