import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const DonationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("10");
  const { toast } = useToast();

  const handleStripePayment = async () => {
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    console.log("Processing Stripe donation for amount:", donationAmount);
    // TODO: Implement Stripe checkout session for donations
    toast({
      title: "Stripe Integration Coming Soon",
      description: `Thank you for wanting to donate $${donationAmount.toFixed(2)}! Card payment integration is in progress.`,
    });
  };

  const handleCryptoPayment = async () => {
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    console.log("Processing crypto donation for amount:", donationAmount);
    // TODO: Implement crypto payment link generation
    toast({
      title: "Crypto Donation Info",
      description: `Thank you! To donate $${donationAmount.toFixed(2)} via crypto, please contact admin@reapertech.xyz for wallet addresses.`,
    });
  };

  const presetAmounts = ["5", "10", "25", "50", "100"];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 transition-all hover:scale-110"
        size="icon"
        aria-label="Donate"
      >
        <Heart className="h-6 w-6 text-white fill-white" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-mono text-cyan-400 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-pink-500 fill-pink-500" />
              Support Reaper Tech
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Your donations help us continue building open-source tools, shortcuts, and innovations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label htmlFor="amount" className="text-gray-200 mb-2 block">
                Donation Amount (USD)
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="bg-gray-800 border-gray-600 text-white"
                min="1"
                step="0.01"
              />
              <div className="flex gap-2 mt-3 flex-wrap">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(preset)}
                    className={`${
                      amount === preset
                        ? "bg-cyan-500 text-black border-cyan-500"
                        : "bg-gray-800 text-gray-300 border-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    ${preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-400 font-mono">Choose Payment Method:</p>
              
              <Button
                onClick={handleStripePayment}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-mono"
              >
                💳 Donate with Card (Stripe)
              </Button>

              <Button
                onClick={handleCryptoPayment}
                className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-mono"
              >
                🪙 Donate with Crypto
              </Button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              All donations are voluntary and non-refundable. Anonymous & registered users welcome.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DonationButton;
