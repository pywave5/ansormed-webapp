import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CART_KEY = ["cart"];

// --- helpers ---
async function fetchCart() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  return cart;
}

async function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  return cart;
}

export function useCart() {
  const queryClient = useQueryClient();

  // Сама корзина
  const { data: cart = [] } = useQuery({
    queryKey: CART_KEY,
    queryFn: fetchCart,
  });

  // Добавить товар (с учётом quantity)
  const addToCart = useMutation({
    mutationFn: async ({ product, quantity }) => {
      const updatedCart = [...cart];
      const existingItem = updatedCart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        updatedCart.push({ ...product, quantity });
      }

      return saveCart(updatedCart);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });

  // Удалить товар
  const removeFromCart = useMutation({
    mutationFn: async (id) => {
      const updatedCart = cart.filter((item) => item.id !== id);
      return saveCart(updatedCart);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });

  // Очистить корзину
  const clearCart = useMutation({
    mutationFn: async () => {
      return saveCart([]);
    },
    onSuccess: () => {
      queryClient.setQueryData(CART_KEY, []);
    },
  });

  // --- вычисляем общее количество товаров (для бейджика) ---
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    totalItems,
    addToCart: (product, quantity) =>
      addToCart.mutate({ product, quantity: quantity || 1 }),
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
  };
}
