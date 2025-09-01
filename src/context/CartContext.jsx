import { createContext, useContext, useState, useEffect } from "react";
import {
  getOrCreateCart,
  addItemToCart as apiAddItemToCart,
  updateCartItem,
  removeCartItem,
  clearUserCart,
  confirmOrder,
} from "../services/api";

const CartContext = createContext();

export function CartProvider({ children, telegramId, username, phoneNumber, customerName }) {
  const [cart, setCart] = useState(null); // корзина = объект заказа с items внутри
  const [loading, setLoading] = useState(true);

  // загрузка корзины при старте или смене пользователя
  useEffect(() => {
    if (telegramId) {
      loadCart();
    }
  }, [telegramId]);

  // создаём или получаем корзину
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

  // добавить товар
  async function addToCart(product, quantity = 1) {
    if (!cart) {
      await loadCart();
    }

    try {
      // проверяем, есть ли товар в корзине
      const existingItem = cart.items?.find((i) => i.product.id === product.id);

      if (existingItem) {
        // обновляем количество
        await updateCartItem(existingItem.id, existingItem.quantity + quantity);
      } else {
        // создаём новый элемент
        await apiAddItemToCart(cart.id, product.id, quantity);
      }

      await loadCart(); // подтягиваем актуальные данные
    } catch (err) {
      console.error("Ошибка при добавлении в корзину:", err);
    }
  }

  // удалить товар
  async function removeFromCart(itemId) {
    try {
      await removeCartItem(itemId);
      await loadCart();
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
    }
  }

  // очистить корзину
  async function clearCart() {
    try {
      await clearUserCart(telegramId);
      setCart(null);
    } catch (err) {
      console.error("Ошибка при очистке корзины:", err);
    }
  }

  // оформить заказ
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
