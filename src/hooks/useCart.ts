
import { useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('reaper-cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('reaper-cart', JSON.stringify(cart));
  }, [cart]);

  const updateQuantity = (id: string, change: number) => {
    setCart(cart.map(item => 
      item.id === id 
        ? { ...item, qty: Math.max(0, item.qty + change) }
        : item
    ).filter(item => item.qty > 0));
  };

  const removeItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('reaper-cart');
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return {
    cart,
    updateQuantity,
    removeItem,
    clearCart,
    total
  };
};
