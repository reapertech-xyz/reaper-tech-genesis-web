
import { useState, useEffect } from "react";
import { useUnifiedAuth } from "./useUnifiedAuth";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export const useCart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { profile } = useUnifiedAuth();

  // Load cart from localStorage or Supabase
  useEffect(() => {
    const loadCart = async () => {
      if (profile) {
        // Load from Supabase for authenticated users (email or wallet)
        const { data, error } = await supabase
          .from('saved_carts')
          .select('cart_data')
          .eq('user_id', profile.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          setCart(data.cart_data as unknown as CartItem[]);
        } else {
          // Migration: load from localStorage and save to Supabase
          const savedCart = localStorage.getItem('reaper-cart');
          if (savedCart) {
            try {
              const cartData = JSON.parse(savedCart);
              setCart(cartData);
              await saveCartToSupabase(cartData);
            } catch (error) {
              console.error('Failed to parse cart from localStorage:', error);
            }
          }
        }
      } else {
        // Load from localStorage for guests
        const savedCart = localStorage.getItem('reaper-cart');
        if (savedCart) {
          try {
            setCart(JSON.parse(savedCart));
          } catch (error) {
            console.error('Failed to parse cart from localStorage:', error);
            setCart([]);
          }
        }
      }
    };

    loadCart();
  }, [profile]);

  const saveCartToSupabase = async (cartData: CartItem[]) => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('saved_carts')
        .upsert({
          user_id: profile.id,
          cart_data: cartData as any,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving cart to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Save cart whenever it changes
  useEffect(() => {
    if (profile) {
      saveCartToSupabase(cart);
    } else {
      localStorage.setItem('reaper-cart', JSON.stringify(cart));
    }
  }, [cart, profile]);

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
    if (!profile) {
      localStorage.removeItem('reaper-cart');
    }
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
