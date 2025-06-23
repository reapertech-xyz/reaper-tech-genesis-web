
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartItems from "@/components/CartItems";
import CheckoutSection from "@/components/CheckoutSection";
import EmptyCart from "@/components/EmptyCart";
import { useCart } from "@/hooks/useCart";

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart, total } = useCart();

  return (
    <div className="min-h-screen bg-black text-white">
      <Header title="Reaper's Cart" />
      
      <main className="px-6 py-16 max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-mono text-cyan-400 mb-4">
            Your Cart
          </h1>
          <p className="text-lg text-gray-400">
            You're not just buying tech — you're investing in legacy tools.
          </p>
          <p className="text-orange-500 font-mono italic mt-2">
            We accept coin, card, crypto, and curiosity.
          </p>
        </div>

        {cart.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <CartItems 
              cart={cart}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              clearCart={clearCart}
            />
            <CheckoutSection total={total} cart={cart} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Cart;
