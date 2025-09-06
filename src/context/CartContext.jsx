import { createContext, useContext, useState, useEffect } from "react";
import {
  getOrCreateCart,
  addItemToCart as apiAddItemToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearUserCart,
  confirmOrder,
} from "../services/api";

const CartContext = createContext();

export function CartProvider({ children, telegramId, username, phoneNumber, customerName }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (telegramId) {
      loadCart();
    }
  }, [telegramId]);

  // ✅ Загрузка корзины с сервера
  async function loadCart() {
    setLoading(true);
    try {
      const data = await getOrCreateCart(telegramId, username, phoneNumber, customerName);
      setCart(data);
      return data;
    } catch (err) {
      console.error("Ошибка при загрузке корзины:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Добавить товар
  async function addToCart(product, quantity = 1) {
    try {
      let currentCart = cart;
      if (!currentCart) {
        currentCart = await loadCart();
      }

      const existingItem = currentCart.items?.find((i) => i.product.id === product.id);

      if (existingItem) {
        await apiUpdateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        await apiAddItemToCart(currentCart.id, product.id, quantity);
      }

      await loadCart(); // 🚀 пересинхронизация
    } catch (err) {
      console.error("Ошибка при добавлении в корзину:", err);
    }
  }

  // ✅ Удалить товар
  async function removeFromCart(itemId) {
    try {
      await apiRemoveCartItem(itemId);
      await loadCart(); // 🚀 пересинхронизация
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
    }
  }

  // ✅ Очистить корзину
  async function clearCart() {
    try {
      await clearUserCart(telegramId);
      await loadCart(); // 🚀 пересинхронизация
    } catch (err) {
      console.error("Ошибка при очистке корзины:", err);
    }
  }

  // ✅ Оформить заказ
  async function checkout() {
    try {
      if (!cart) return null;
      await confirmOrder(cart.id);
      await loadCart(); // 🚀 корзина сбросится
    } catch (err) {
      console.error("Ошибка при подтверждении заказа:", err);
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addToCart,
        removeFromCart,
        clearCart,
        checkout,
        reloadCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);