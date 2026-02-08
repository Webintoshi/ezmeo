"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CartItem, Cart, CartContextType } from "@/types/cart";
import { Product, ProductVariant } from "@/types/product";
import { SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("ezmeo_cart");
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("ezmeo_cart", JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addToCart = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) => item.productId === product.id && item.variantId === variant.id
      );

      if (existingItem) {
        return prev.map((item) =>
          item.productId === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          quantity,
          product,
          variant,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.variantId === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string, variantId: string) => {
    const item = items.find(
      (item) => item.productId === productId && item.variantId === variantId
    );
    return item?.quantity || 0;
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const subtotal = items.reduce(
    (total, item) => total + item.variant.price * item.quantity,
    0
  );

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const total = subtotal + shipping;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        getTotalItems,
        subtotal,
        shipping,
        total,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
