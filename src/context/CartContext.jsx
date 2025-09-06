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

  // ✅ Добавить товар
  async function addToCart(product, quantity = 1) {
    let currentCart = cart;
    if (!currentCart) {
      currentCart = await loadCart();
    }

    try {
      const existingItem = currentCart.items?.find((i) => i.product.id === product.id);

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const updatedItems = currentCart.items.map((i) =>
          i.id === existingItem.id ? { ...i, quantity: newQuantity } : i
        );

        setCart({
          ...currentCart,
          items: updatedItems,
          total_cost: recalcTotal(updatedItems),
        });

        apiUpdateCartItem(existingItem.id, newQuantity).catch((err) =>
          console.error("Ошибка при обновлении товара:", err)
        );
      } else {
        const tempId = `temp-${Date.now()}`;
        const newLocalItem = {
          id: tempId,
          product,
          quantity,
        };

        const updatedItems = [...(currentCart.items || []), newLocalItem];
        setCart({
          ...currentCart,
          items: updatedItems,
          total_cost: recalcTotal(updatedItems),
        });

        const newItem = await apiAddItemToCart(currentCart.id, product.id, quantity);
        const replacedItems = updatedItems.map((i) => (i.id === tempId ? newItem : i));

        setCart({
          ...currentCart,
          items: replacedItems,
          total_cost: recalcTotal(replacedItems),
        });
      }
    } catch (err) {
      console.error("Ошибка при добавлении в корзину:", err);
    }
  }

  // ✅ Удалить товар
  async function removeFromCart(itemId) {
    try {
      const updatedItems = cart.items.filter((i) => i.id !== itemId);
      setCart({
        ...cart,
        items: updatedItems,
        total_cost: recalcTotal(updatedItems),
      });

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
      setCart({
        ...cart,
        items: [],
        total_cost: 0,
      });

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
      setCart(null);
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
