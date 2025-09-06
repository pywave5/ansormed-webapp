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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telegramId]);

  // 🔄 загрузка корзины с сервера
  async function loadCart() {
    setLoading(true);
    try {
      const data = await getOrCreateCart(telegramId, username, phoneNumber, customerName);
      // Защита: если сервер вернул null/undefined — приводим к корректной структуре
      const safe = {
        ...data,
        items: Array.isArray(data?.items) ? data.items : [],
        total_cost: data?.total_cost ?? 0,
      };
      setCart(safe);
      return safe;
    } catch (err) {
      console.error("Ошибка при загрузке корзины:", err);
      // В случае ошибки оставляем cart как есть или создаём пустую структуру
      const empty = { id: null, items: [], total_cost: 0 };
      setCart((prev) => prev ?? empty);
      return empty;
    } finally {
      setLoading(false);
    }
  }

  // безопасное вычисление total (учитывает отсутствие final_price)
  function recalcTotal(items = []) {
    return items.reduce((sum, i) => {
      const qty = Number(i?.quantity || 0);
      const unit = Number(i?.product?.final_price ?? i?.product?.price ?? 0);
      return sum + qty * unit;
    }, 0);
  }

  // ✅ Добавить товар (оптимистично, с заменой temp-item и пересинхронизацией)
  async function addToCart(product, quantity = 1) {
    let currentCart = cart;
    try {
      if (!currentCart) {
        currentCart = await loadCart();
      }

      const existingItem = currentCart.items?.find((i) => i.product?.id === product.id);

      if (existingItem) {
        // обновляем количество оптимистично
        const newQuantity = existingItem.quantity + quantity;
        const updatedItems = currentCart.items.map((i) =>
          i.id === existingItem.id ? { ...i, quantity: newQuantity } : i
        );

        setCart({
          ...currentCart,
          items: updatedItems,
          total_cost: recalcTotal(updatedItems),
        });

        try {
          await apiUpdateCartItem(existingItem.id, newQuantity);
        } catch (err) {
          console.error("Ошибка при обновлении товара на сервере:", err);
        }

        // синхронизируем
        await loadCart();
      } else {
        // создаём временный item с безопасным final_price, чтобы UI не показывал "—"
        const tempId = `temp-${Date.now()}`;
        const unitPrice = product?.final_price ?? product?.price ?? 0;
        const tempItem = {
          id: tempId,
          product: {
            ...product,
            final_price: unitPrice,
            price: product?.price ?? unitPrice,
          },
          quantity,
          total_price: Number(unitPrice) * Number(quantity),
        };

        const updatedItems = [...(currentCart.items || []), tempItem];

        // оптимистично показываем
        setCart({
          ...currentCart,
          items: updatedItems,
          total_cost: recalcTotal(updatedItems),
        });

        try {
          // создаём на сервере
          const created = await apiAddItemToCart(currentCart.id, product.id, quantity);

          if (created && created.id) {
            // заменяем temp на настоящий item (если сервер вернул объект)
            setCart((prev) => {
              const items = (prev?.items || []).map((i) => (i.id === tempId ? created : i));
              return {
                ...(prev || {}),
                items,
                total_cost: recalcTotal(items),
              };
            });
          }
        } catch (err) {
          console.error("Ошибка при добавлении товара на сервер:", err);
          // если упало — попробуем пересинхронизировать (откат/обновление с сервера)
        } finally {
          // гарантированно подгружаем актуальную корзину
          await loadCart();
        }
      }
    } catch (err) {
      console.error("Ошибка в addToCart:", err);
      // в крайнем случае — пересинхронизируем
      await loadCart();
    }
  }

  // ✅ Удалить товар (оптимистично)
  async function removeFromCart(itemId) {
    try {
      if (!cart) return;

      const updatedItems = (cart.items || []).filter((i) => i.id !== itemId);

      // оптимистично
      setCart({
        ...cart,
        items: updatedItems,
        total_cost: recalcTotal(updatedItems),
      });

      try {
        await apiRemoveCartItem(itemId);
      } catch (err) {
        console.error("Ошибка при удалении товара на сервере:", err);
      } finally {
        await loadCart();
      }
    } catch (err) {
      console.error("Ошибка при удалении товара:", err);
      await loadCart();
    }
  }

  // ✅ Очистить корзину (оптимистично)
  async function clearCart() {
    try {
      if (!cart) return;

      setCart({
        ...cart,
        items: [],
        total_cost: 0,
      });

      try {
        await clearUserCart(telegramId);
      } catch (err) {
        console.error("Ошибка при очистке корзины на сервере:", err);
      } finally {
        await loadCart();
      }
    } catch (err) {
      console.error("Ошибка при очистке корзины:", err);
      await loadCart();
    }
  }

  // ✅ Оформить заказ
  async function checkout() {
    try {
      if (!cart) return null;

      await confirmOrder(cart.id);

      // подтягиваем актуальную корзину (обычно пустую)
      await loadCart();
    } catch (err) {
      console.error("Ошибка при подтверждении заказа:", err);
      await loadCart();
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
