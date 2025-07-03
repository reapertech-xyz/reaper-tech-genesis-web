
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ThiingsIcon from "./ThiingsIcon";

const Web3WalletConnect = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const walletOptions = [
    {
      name: "MetaMask",
      icon: "wallet3D",
      description: "Connect using MetaMask browser extension",
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      name: "WalletConnect",
      icon: "phone3D",
      description: "Connect using WalletConnect protocol",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      name: "Coinbase Wallet",
      icon: "coin3D",
      description: "Connect using Coinbase Wallet",
      color: "bg-cyan-500 hover:bg-cyan-600"
    },
    {
      name: "Pi Network",
      icon: "pizza3D",
      description: "Connect using Pi Network (Coming Soon)",
      color: "bg-purple-500 hover:bg-purple-600",
      disabled: true
    }
  ];

  const handleConnect = async (walletName: string) => {
    if (walletName === "Pi Network") return; // Coming soon
    
    setIsConnecting(true);
    
    // Simulate wallet connection
    setTimeout(() => {
      setIsConnected(true);
      setWalletAddress("0x742d35Cc6634C0532925a3b8D4631d3d");
      setIsConnecting(false);
    }, 2000);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress("");
  };

  if (isConnected) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="wallet3D" size={24} className="mr-2" />
            Wallet Connected
          </CardTitle>
          <CardDescription className="text-gray-300">
            {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-green-400 flex items-center">
              <ThiingsIcon name="shield3D" size={16} className="mr-2" />
              Connected
            </span>
            <Button
              onClick={handleDisconnect}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500/10"
            >
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white font-mono flex items-center">
          <ThiingsIcon name="wallet3D" size={20} className="mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="key3D" size={24} className="mr-2" />
            Connect Your Web3 Wallet
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Choose your preferred wallet to connect to Reaper Tech
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3">
          {walletOptions.map((wallet, index) => (
            <Button
              key={index}
              onClick={() => handleConnect(wallet.name)}
              disabled={wallet.disabled || isConnecting}
              className={`w-full justify-start p-4 h-auto ${wallet.color} ${wallet.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <ThiingsIcon name={wallet.icon} size={24} />
                <div className="text-left">
                  <div className="font-semibold">{wallet.name}</div>
                  <div className="text-sm opacity-80">{wallet.description}</div>
                </div>
              </div>
              {isConnecting && (
                <ThiingsIcon name="gear3D" size={16} className="ml-auto animate-spin" />
              )}
            </Button>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
          <p className="text-sm text-gray-400 flex items-center">
            <ThiingsIcon name="shield3D" size={16} className="mr-2" />
            Your wallet connection is secure and encrypted. We never store your private keys.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Web3WalletConnect;
