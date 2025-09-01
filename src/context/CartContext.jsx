import { createContext, useContext, useState, useEffect } from "react";
import {
  getUserCart,
  getOrCreateCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearUserCart,
  confirmOrder,
} from "../services/api";

const CartContext = createContext();

export function CartProvider({ children, telegramId, username, phoneNumber, customerName }) {
  const [cart, setCart] = useState(null); // корзина = объект заказа (с items внутри)
  const [loading, setLoading] = useState(false);

  // загрузка корзины при старте
  useEffect(() => {
    if (telegramId) {
      loadCart();
    }
  }, [telegramId]);

  async function loadCart() {
    setLoading(true);
    try {
      const data = await getUserCart(telegramId);
      setCart(data);
    } catch (err) {
      console.error("Ошибка при загрузке корзины:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addToCart(product, quantity = 1) {
    try {
      let order = cart;
      if (!order) {
        order = await getOrCreateCart(telegramId, username, phoneNumber, customerName);
        setCart(order);
      }

      const existingItem = order.items?.find((i) => i.product === product.id);
      if (existingItem) {
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        await addItemToCart(order.id, product.id, quantity);
      }

      await loadCart(); // обновляем корзину после изменения
    } catch (err) {
      console.error("Ошибка при добавлении в корзину:", err);
    }
  }

  async function removeFromCart(itemId) {
    try {
      await removeCartItem(itemId);
      await loadCart();
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
    }
  }

  async function clearCart() {
    try {
      await clearUserCart(telegramId);
      setCart(null);
    } catch (err) {
      console.error("Ошибка при очистке корзины:", err);
    }
  }

  async function checkout() {
    try {
      if (!cart) return null;
      const confirmed = await confirmOrder(cart.id);
      setCart(null); // после оформления корзина обнуляется
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
