import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserCart,
  getOrCreateCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearUserCart,
} from "../services/api";

const CART_KEY = ["cart"];

// --- helpers (локалка) ---
function fetchLocalCart() {
  return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveLocalCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
}

export function useCart() {
  const queryClient = useQueryClient();

  // Корзина (берём либо локалку, либо API)
  const { data: cart = [] } = useQuery({
    queryKey: CART_KEY,
    queryFn: async () => {
      const local = fetchLocalCart();
      try {
        const remote = await getUserCart();
        if (remote?.items) {
          saveLocalCart(remote.items); // синкаем локалку
          return remote.items;
        }
      } catch (e) {
        console.warn("❌ Ошибка загрузки корзины с API, fallback → localStorage");
      }
      return local;
    },
  });

  // Добавить товар
  const addToCart = useMutation({
    mutationFn: async ({ product, quantity }) => {
      const updatedCart = [...cart];
      const existingItem = updatedCart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
        saveLocalCart(updatedCart);
        await updateCartItem(existingItem.id, existingItem.quantity);
      } else {
        updatedCart.push({ ...product, quantity });
        saveLocalCart(updatedCart);

        const order = await getOrCreateCart();
        await addItemToCart(order.id, product.id, quantity);
      }

      return updatedCart;
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });

  // Удалить товар
  const removeFromCart = useMutation({
    mutationFn: async (id) => {
      const updatedCart = cart.filter((item) => item.id !== id);
      saveLocalCart(updatedCart);

      try {
        await removeCartItem(id);
      } catch (e) {
        console.warn("❌ Ошибка при удалении товара из API", e);
      }

      return updatedCart;
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });

  // Очистить корзину
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      saveLocalCart([]);
      try {
        await clearUserCart();
      } catch (e) {
        console.warn("❌ Ошибка при очистке корзины API", e);
      }
      return [];
    },
    onSuccess: () => {
      queryClient.setQueryData(CART_KEY, []);
    },
  });

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return {
    cart,
    totalItems,
    addToCart: (product, quantity = 1) => addToCart.mutate({ product, quantity }),
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCartMutation.mutate,
  };
}