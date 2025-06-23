
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CheckoutSectionProps {
  total: number;
}

const CheckoutSection = ({ total }: CheckoutSectionProps) => {
  const handleStripePayment = async () => {
    console.log("Processing Stripe payment for amount:", total);
    // TODO: Implement Stripe checkout session
    alert("Stripe payment integration coming soon! Amount: $" + total.toFixed(2));
  };

  const handleCryptoPayment = async () => {
    console.log("Processing crypto payment for amount:", total);
    // TODO: Implement Thirdweb payment link generation
    alert("Crypto payment via Thirdweb coming soon! Amount: $" + total.toFixed(2));
  };

  const handleCashPiPayment = () => {
    alert("💰 Cash/Pi Payment Instructions:\n\nContact admin@reapertech.xyz to arrange:\n• Local meetup for cash exchange\n• Pi Network escrow transaction\n• Payment coordination\n\nTotal: $" + total.toFixed(2));
  };

  const handleQRPayment = () => {
    alert("📱 QR Payment coming soon!\n\nThis will generate a QR code for:\n• Venmo/CashApp payments\n• Crypto wallet transfers\n• Pi Network transactions");
  };

  return (
    <div className="lg:col-span-1">
      <Card className="bg-gray-900 border-gray-700 sticky top-8">
        <CardHeader>
          <CardTitle className="text-cyan-400 font-mono">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-lg">
            <span>Subtotal:</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>Shipping:</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="border-t border-gray-700 pt-4">
            <div className="flex justify-between text-xl font-bold text-orange-500">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleStripePayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-mono"
            >
              💳 Pay with Card (Stripe)
            </Button>
            
            <Button 
              onClick={handleCryptoPayment}
              variant="outline" 
              className="w-full border-orange-500 text-orange-500 hover:bg-orange-500/10 font-mono"
            >
              🚀 Pay with Crypto
            </Button>
            
            <Button 
              onClick={handleCashPiPayment}
              variant="ghost" 
              className="w-full text-cyan-400 hover:bg-cyan-400/10 font-mono"
            >
              💰 Cash / Pi Network
            </Button>
            
            <Button 
              onClick={handleQRPayment}
              variant="secondary" 
              className="w-full bg-gray-700 hover:bg-gray-600 font-mono"
            >
              📱 Generate Payment QR
            </Button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-sm text-gray-400 italic">
              "If you have fire, we'll find a way to trade it."
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutSection;
