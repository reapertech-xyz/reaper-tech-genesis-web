
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Minus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image?: string;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([
    { id: 1, name: "USB-C to Lightning Cable (6ft)", price: 10.00, qty: 1 },
    { id: 2, name: "100W 4-Port USB Hub Charger", price: 25.00, qty: 1 },
    { id: 3, name: "65W USB-C Laptop Charger Block", price: 18.00, qty: 2 },
  ]);

  const updateQuantity = (id: number, change: number) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, qty: Math.max(0, item.qty + change) }
        : item
    ).filter(item => item.qty > 0));
  };

  const removeItem = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

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
    <div className="min-h-screen bg-black text-white">
      <Header title="Reaper's Cart" />
      
      <main className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-4">
            🛒 Your Cart
          </h1>
          <p className="text-lg text-gray-400">
            You're not just buying tech — you're investing in legacy tools.
          </p>
          <p className="text-orange-500 font-mono italic mt-2">
            We accept coin, card, crypto, and curiosity.
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-gray-400 mb-8">Your cart is empty</p>
            <Button 
              onClick={() => window.location.href = '/shop'} 
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <Card key={item.id} className="bg-gray-900 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-mono text-cyan-400">{item.name}</h3>
                        <p className="text-orange-500 font-bold">${item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{item.qty}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Checkout Section */}
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
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
