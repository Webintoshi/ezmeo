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
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  // Load cart from localStorage
  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("ezmeo_cart");
    if (savedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(savedCart);

        // Validate IDs - if any item has a non-UUID ID (legacy data), clear the cart
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const hasInvalidIds = parsedCart.some(
          item => !uuidRegex.test(item.productId) || !uuidRegex.test(item.variantId)
        );

        if (hasInvalidIds) {
          console.warn("Legacy cart data detected (invalid UUIDs). Clearing cart.");
          setItems([]);
          localStorage.removeItem("ezmeo_cart");
        } else {
          setItems(parsedCart);
        }
      } catch (e) {
        console.error("Failed to parse cart data", e);
        setItems([]);
      }
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
    const newItem: CartItem = {
      productId: product.id,
      variantId: variant.id,
      quantity,
      product,
      variant,
    };

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

      return [...prev, newItem];
    });

    setLastAddedItem(newItem);
    setIsOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== itemId));
    // If the removed item was the last added one, technically we could clear it, 
    // but usually "last added" notification persists until another action. 
    // We'll leave it as is or clear it if that ItemId matches.
    if (lastAddedItem?.variantId === itemId) {
      setLastAddedItem(null);
    }
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
    setLastAddedItem(null);
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
        lastAddedItem,
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
