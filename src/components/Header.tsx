
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useEscrow } from "@/hooks/useEscrow";
import { Link, useNavigate } from "react-router-dom";
import ThiingsIcon from "./ThiingsIcon";
import Web3WalletConnect from "./Web3WalletConnect";
import { User, LogOut, Bell } from "lucide-react";
import { EscrowStatus } from "@/types/escrow";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user, profile, signOut } = useUnifiedAuth();
  const { transactions, loadUserTransactions } = useEscrow();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const userId = user?.id || profile?.id;

  useEffect(() => {
    if (userId) {
      loadUserTransactions(userId);
    }
  }, [userId, loadUserTransactions]);

  // Calculate active transactions count
  const activeTransactions = transactions.filter(tx => 
    [EscrowStatus.INITIATED, EscrowStatus.FUNDED, EscrowStatus.IN_PROGRESS].includes(tx.status)
  );

  // Calculate pending actions
  const pendingActions = transactions.filter(tx => {
    const isBuyer = tx.buyerId === userId;
    return isBuyer && [EscrowStatus.FUNDED, EscrowStatus.IN_PROGRESS].includes(tx.status);
  });

  const disputedTransactions = transactions.filter(tx => tx.status === EscrowStatus.DISPUTED);

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
            <ThiingsIcon name="market3D" size={16} className="mr-1" />
            Ledger Fields
          </Link>
          {(user || profile) && (
            <>
              <Link to="/bookmarks" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center">
                <ThiingsIcon name="star3D" size={16} className="mr-1" />
                Bookmarks
              </Link>
              <Link to="/escrow" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center relative">
                <ThiingsIcon name="shield3D" size={16} className="mr-1" />
                My Escrows
                {activeTransactions.length > 0 && (
                  <Badge className="ml-2 bg-cyan-500 text-gray-900 hover:bg-cyan-600">
                    {activeTransactions.length}
                  </Badge>
                )}
              </Link>
              
              {/* Notifications */}
              {(pendingActions.length > 0 || disputedTransactions.length > 0) && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="relative">
                      <Bell className="h-5 w-5 text-yellow-400" />
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs flex items-center justify-center">
                        {pendingActions.length + disputedTransactions.length}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-gray-900 border-gray-700">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-cyan-400">Pending Actions</h4>
                      {pendingActions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-300">
                            {pendingActions.length} transaction{pendingActions.length !== 1 ? 's' : ''} awaiting fund release
                          </p>
                          <Button
                            onClick={() => navigate('/escrow')}
                            size="sm"
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Review Transactions
                          </Button>
                        </div>
                      )}
                      {disputedTransactions.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-gray-700">
                          <p className="text-sm text-yellow-300">
                            {disputedTransactions.length} dispute{disputedTransactions.length !== 1 ? 's' : ''} pending resolution
                          </p>
                          <Button
                            onClick={() => navigate('/escrow')}
                            size="sm"
                            variant="outline"
                            className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                          >
                            View Disputes
                          </Button>
                        </div>
                      )}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </>
          )}
          <Link to="/cart" className="text-gray-300 hover:text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="box3D" size={16} className="mr-1" />
            Cart
          </Link>
          
          <Web3WalletConnect />
          
          {(user || profile) ? (
            <div className="flex items-center space-x-3">
              <Link 
                to="/profile" 
                className="text-gray-400 hover:text-cyan-400 text-sm flex items-center transition-colors"
              >
                <ThiingsIcon name="crown3D" size={16} className="mr-1" />
                {profile?.username || user?.email?.split('@')[0] || 'User'}
              </Link>
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
            <ThiingsIcon name="market3D" size={16} className="mr-2" />
            Ledger Fields
          </Link>
          {(user || profile) && (
            <>
              <Link to="/bookmarks" className="block text-gray-300 hover:text-cyan-400 font-mono py-2 flex items-center">
                <ThiingsIcon name="star3D" size={16} className="mr-2" />
                Bookmarks
              </Link>
              <Link to="/escrow" className="block text-gray-300 hover:text-cyan-400 font-mono py-2 flex items-center justify-between">
                <span className="flex items-center">
                  <ThiingsIcon name="shield3D" size={16} className="mr-2" />
                  My Escrows
                </span>
                {activeTransactions.length > 0 && (
                  <Badge className="bg-cyan-500 text-gray-900">
                    {activeTransactions.length}
                  </Badge>
                )}
              </Link>
              {(pendingActions.length > 0 || disputedTransactions.length > 0) && (
                <div className="py-2 px-4 bg-yellow-500/10 border border-yellow-500/30 rounded">
                  <p className="text-yellow-300 text-sm flex items-center">
                    <Bell className="h-4 w-4 mr-2" />
                    {pendingActions.length + disputedTransactions.length} pending action{pendingActions.length + disputedTransactions.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </>
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
              <Link 
                to="/profile"
                className="text-gray-400 hover:text-cyan-400 text-sm mb-2 flex items-center transition-colors"
              >
                <ThiingsIcon name="crown3D" size={16} className="mr-2" />
                {profile?.username || user?.email?.split('@')[0] || 'User'}
              </Link>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-red-400 mt-2"
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
