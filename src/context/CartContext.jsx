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

  async function loadCart() {
    setLoading(true);
    try {
      const data = await getOrCreateCart(telegramId, username, phoneNumber, customerName);
      setCart(data);
    } catch (err) {
      console.error("Ошибка при загрузке корзины:", err);
    } finally {
      setLoading(false);
    }
  }

  // ✅ Добавить товар
  async function addToCart(product, quantity = 1) {
    if (!cart) {
      await loadCart();
    }

    try {
      const existingItem = cart.items?.find((i) => i.product.id === product.id);

      if (existingItem) {
        // локально обновляем
        setCart((prev) => ({
          ...prev,
          items: prev.items.map((i) =>
            i.id === existingItem.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          ),
        }));

        // синхронизация с API
        apiUpdateCartItem(existingItem.id, existingItem.quantity + quantity).catch((err) =>
          console.error("Ошибка при обновлении товара:", err)
        );
      } else {
        // сразу создаём локальный item-заглушку
        const tempId = `temp-${Date.now()}`;
        const newLocalItem = {
          id: tempId,
          product,
          quantity,
        };

        setCart((prev) => ({
          ...prev,
          items: [...prev.items, newLocalItem],
        }));

        // потом заменяем на настоящий item из API
        const newItem = await apiAddItemToCart(cart.id, product.id, quantity);
        setCart((prev) => ({
          ...prev,
          items: prev.items.map((i) => (i.id === tempId ? newItem : i)),
        }));
      }
    } catch (err) {
      console.error("Ошибка при добавлении в корзину:", err);
    }
  }

  // ✅ Удалить товар
  async function removeFromCart(itemId) {
    try {
      setCart((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));

      apiRemoveCartItem(itemId).catch((err) =>
        console.error("Ошибка при удалении товара:", err)
      );
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
    }
  }

  // ✅ Очистить корзину
  async function clearCart() {
    try {
      setCart((prev) => ({ ...prev, items: [] }));
      clearUserCart(telegramId).catch((err) =>
        console.error("Ошибка при очистке корзины:", err)
      );
    } catch (err) {
      console.error("Ошибка при очистке корзины:", err);
    }
  }

  // ✅ Оформить заказ
  async function checkout() {
    try {
      if (!cart) return null;
      const confirmed = await confirmOrder(cart.id);
      setCart(null); // корзина обнуляется
      return confirmed;
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
