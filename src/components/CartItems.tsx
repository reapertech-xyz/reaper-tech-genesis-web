
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { CartItem } from "@/hooks/useCart";

interface CartItemsProps {
  cart: CartItem[];
  updateQuantity: (id: string, change: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartItems = ({ cart, updateQuantity, removeItem, clearCart }: CartItemsProps) => {
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-mono text-cyan-400">Items in Cart</h2>
        <Button
          onClick={clearCart}
          variant="ghost"
          className="text-red-400 hover:text-red-300 font-mono"
        >
          Clear Cart
        </Button>
      </div>
      
      {cart.map((item) => (
        <Card key={item.id} className="bg-gray-900 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-mono text-cyan-400">{item.name}</h3>
                <p className="text-orange-500 font-bold">${item.price.toFixed(2)}</p>
                <p className="text-sm text-gray-400">
                  Subtotal: ${(item.price * item.qty).toFixed(2)}
                </p>
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
  );
};

export default CartItems;
