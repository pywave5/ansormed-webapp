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

  // 🔄 загрузка корзины с сервера
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

  function recalcTotal(items) {
    return items.reduce(
      (sum, i) => sum + i.quantity * i.product.final_price,
      0
    );
  }

  // ✅ Добавить товар (оптимистично)
  async function addToCart(product, quantity = 1) {
    try {
      let currentCart = cart;
      if (!currentCart) {
        currentCart = await loadCart();
      }

      const existingItem = currentCart.items?.find((i) => i.product.id === product.id);
      let updatedItems;

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        updatedItems = currentCart.items.map((i) =>
          i.id === existingItem.id ? { ...i, quantity: newQuantity } : i
        );
      } else {
        const tempId = `temp-${Date.now()}`;
        const newItem = {
          id: tempId,
          product,
          quantity,
        };
        updatedItems = [...(currentCart.items || []), newItem];
      }

      // 🔥 Оптимистичное обновление UI
      setCart({
        ...currentCart,
        items: updatedItems,
        total_cost: recalcTotal(updatedItems),
      });

      // 🚀 API запрос
      if (existingItem) {
        await apiUpdateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        await apiAddItemToCart(currentCart.id, product.id, quantity);
      }

      // 🔄 Пересинхронизация
      await loadCart();
    } catch (err) {
      console.error("Ошибка при добавлении в корзину:", err);
    }
  }

  // ✅ Удалить товар (оптимистично)
  async function removeFromCart(itemId) {
    try {
      if (!cart) return;

      const updatedItems = cart.items.filter((i) => i.id !== itemId);

      // 🔥 Оптимистичное обновление UI
      setCart({
        ...cart,
        items: updatedItems,
        total_cost: recalcTotal(updatedItems),
      });

      // 🚀 API запрос
      await apiRemoveCartItem(itemId);

      // 🔄 Пересинхронизация
      await loadCart();
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
    }
  }

  // ✅ Очистить корзину (оптимистично)
  async function clearCart() {
    try {
      if (!cart) return;

      // 🔥 Оптимистичное обновление UI
      setCart({
        ...cart,
        items: [],
        total_cost: 0,
      });

      // 🚀 API запрос
      await clearUserCart(telegramId);

      // 🔄 Пересинхронизация
      await loadCart();
    } catch (err) {
      console.error("Ошибка при очистке корзины:", err);
    }
  }

  // ✅ Оформить заказ
  async function checkout() {
    try {
      if (!cart) return null;

      // 🚀 API запрос
      await confirmOrder(cart.id);

      // 🔄 После подтверждения корзина будет пустой
      await loadCart();
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