import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CART_KEY = ["cart"];

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

  const { data: cart = [] } = useQuery({
    queryKey: CART_KEY,
    queryFn: fetchCart,
  });

  const addToCart = useMutation({
    mutationFn: async (product) => {
      const updatedCart = [...cart];
      const existingItem = updatedCart.find((item) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        updatedCart.push({ ...product, quantity: 1 });
      }

      return saveCart(updatedCart);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });

  const removeFromCart = useMutation({
    mutationFn: async (id) => {
      const updatedCart = cart.filter((item) => item.id !== id);
      return saveCart(updatedCart);
    },
    onSuccess: (newCart) => {
      queryClient.setQueryData(CART_KEY, newCart);
    },
  });

  const clearCart = useMutation({
    mutationFn: async () => {
      return saveCart([]);
    },
    onSuccess: () => {
      queryClient.setQueryData(CART_KEY, []);
    },
  });

  return {
    cart,
    addToCart: addToCart.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,
  };
}
