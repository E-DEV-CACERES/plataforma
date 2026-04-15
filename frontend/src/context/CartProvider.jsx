import { useState, useEffect } from 'react';
import { CartContext, CART_STORAGE_KEY } from './cartContext';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setCartItems(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      setCartItems([]);
    }
  }, []);

  const persistCart = (items) => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch { /* ignore */ }
  };

  const addToCart = (course) => {
    setCartItems((prev) => {
      if (prev.some((item) => item.id === course.id)) return prev;
      const next = [...prev, {
        id: course.id,
        title: course.title,
        description: course.description,
        createdByName: course.createdByName,
        createdById: course.createdById,
        averageRating: course.averageRating ?? 0,
        ratingsCount: course.ratingsCount ?? 0,
      }];
      persistCart(next);
      return next;
    });
  };

  const removeFromCart = (courseId) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== courseId);
      persistCart(next);
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    persistCart([]);
  };

  const isInCart = (courseId) => cartItems.some((item) => item.id === courseId);

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
