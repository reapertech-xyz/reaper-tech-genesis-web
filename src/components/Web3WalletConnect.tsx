
import { useState } from "react";
import { useAddress, useConnect, useDisconnect, ConnectWallet, useConnectionStatus } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ThiingsIcon from "./ThiingsIcon";
import { toast } from "sonner";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

const Web3WalletConnect = () => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const disconnect = useDisconnect();
  const { user, profile, linkWalletToProfile } = useUnifiedAuth();

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      toast.error("Failed to disconnect wallet");
      console.error("Disconnect error:", error);
    }
  };

  const handleWalletConnect = async () => {
    if (address && user && !profile?.wallet_address) {
      try {
        await linkWalletToProfile(address);
        toast.success("Wallet linked to your account!");
      } catch (error) {
        toast.error("Failed to link wallet to account");
        console.error("Link wallet error:", error);
      }
    }
  };

  // Show connected state for both wallet-only and email+wallet users
  if (address && connectionStatus === "connected") {
    const isLinkedToEmailAccount = user && profile?.wallet_address === address;
    
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="wallet3D" size={24} className="mr-2" />
            Wallet Connected
          </CardTitle>
          <CardDescription className="text-gray-300">
            {address.slice(0, 6)}...{address.slice(-4)}
            {isLinkedToEmailAccount && (
              <span className="block text-green-400 text-xs mt-1">
                Linked to your account
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-green-400 flex items-center">
              <ThiingsIcon name="shield3D" size={16} className="mr-2" />
              Connected
            </span>
            <div className="flex gap-2">
              {user && !isLinkedToEmailAccount && (
                <Button
                  onClick={handleWalletConnect}
                  variant="outline"
                  size="sm"
                  className="border-cyan-500 text-cyan-500 hover:bg-cyan-500/10"
                >
                  Link to Account
                </Button>
              )}
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                className="border-red-500 text-red-500 hover:bg-red-500/10"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center">
      <ConnectWallet 
        theme="dark"
        btnTitle="Connect Wallet"
        modalTitle="Connect to Reaper Tech"
        welcomeScreen={{
          title: "Welcome to Reaper Tech",
          subtitle: "Connect your wallet to access Web3 features",
        }}
        style={{
          backgroundColor: "#8B5CF6",
          color: "white",
          fontFamily: "monospace",
          borderRadius: "6px",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: "500",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      />
    </div>
  );
};

export default Web3WalletConnect;
