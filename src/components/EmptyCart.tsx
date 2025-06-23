
import { Button } from "@/components/ui/button";

const EmptyCart = () => {
  return (
    <div className="text-center py-16">
      <p className="text-2xl text-gray-400 mb-8">Your cart is empty</p>
      <Button 
        onClick={() => window.location.href = '/shop'} 
        className="bg-cyan-500 hover:bg-cyan-600 text-black font-mono"
      >
        Continue Shopping
      </Button>
    </div>
  );
};

export default EmptyCart;
