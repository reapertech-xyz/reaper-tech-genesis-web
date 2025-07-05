
import { useState } from "react";
import { useAddress, useConnect, useDisconnect, ConnectWallet, useConnectionStatus } from "@thirdweb-dev/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ThiingsIcon from "./ThiingsIcon";
import { toast } from "sonner";

const Web3WalletConnect = () => {
  const address = useAddress();
  const connectionStatus = useConnectionStatus();
  const disconnect = useDisconnect();

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast.success("Wallet disconnected successfully");
    } catch (error) {
      toast.error("Failed to disconnect wallet");
      console.error("Disconnect error:", error);
    }
  };

  if (address && connectionStatus === "connected") {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono flex items-center">
            <ThiingsIcon name="wallet3D" size={24} className="mr-2" />
            Wallet Connected
          </CardTitle>
          <CardDescription className="text-gray-300">
            {address.slice(0, 6)}...{address.slice(-4)}
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
