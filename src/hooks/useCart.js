import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrCreateCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearUserCart,
  confirmOrder,
} from "../services/api";

const CART_KEY = ["cart"];

export function useCart(telegramId, username, phoneNumber, customerName) {
  const queryClient = useQueryClient();

  // Загружаем корзину из API
  const { data: cart, isLoading } = useQuery({
    queryKey: CART_KEY,
    queryFn: async () =>
      getOrCreateCart(telegramId, username, phoneNumber, customerName),
  });

  // Добавить товар
  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }) => {
      return await addItemToCart(
        cart.id,
        productId,
        quantity,
        (updatedCart) => {
          queryClient.setQueryData(CART_KEY, updatedCart);
        },
        telegramId,
        username,
        phoneNumber,
        customerName
      );
    },
    // оптимистическое обновление
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries(CART_KEY);

      const prevCart = queryClient.getQueryData(CART_KEY);

      // обновляем корзину сразу
      queryClient.setQueryData(CART_KEY, (old) => {
        if (!old) return prevCart;

        const exists = old.items.find((i) => i.product.id === productId);
        let newItems;
        if (exists) {
          newItems = old.items.map((i) =>
            i.product.id === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          newItems = [
            ...old.items,
            { id: Date.now(), product: { id: productId }, quantity },
          ];
        }

        return { ...old, items: newItems };
      });

      return { prevCart };
    },
    // если ошибка — откат
    onError: (err, variables, context) => {
      if (context?.prevCart) {
        queryClient.setQueryData(CART_KEY, context.prevCart);
      }
    },
  });

  // Обновить количество
  const updateItem = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      return await updateCartItem(itemId, quantity);
    },
    onSuccess: async () => {
      const updatedCart = await getOrCreateCart(
        telegramId,
        username,
        phoneNumber,
        customerName
      );
      queryClient.setQueryData(CART_KEY, updatedCart);
    },
  });

  // Удалить товар
  const removeItem = useMutation({
    mutationFn: async (itemId) => {
      await removeCartItem(itemId);
    },
    onSuccess: async () => {
      const updatedCart = await getOrCreateCart(
        telegramId,
        username,
        phoneNumber,
        customerName
      );
      queryClient.setQueryData(CART_KEY, updatedCart);
    },
  });

  // Очистить корзину
  const clearCart = useMutation({
    mutationFn: async () => {
      await clearUserCart(telegramId);
    },
    onSuccess: () => {
      queryClient.setQueryData(CART_KEY, null);
    },
  });

  // Подтвердить заказ
  const confirm = useMutation({
    mutationFn: async () => {
      if (!cart) return null;
      return await confirmOrder(cart.id);
    },
    onSuccess: () => {
      queryClient.setQueryData(CART_KEY, null);
    },
  });

  // Кол-во товаров
  const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return {
    cart,
    isLoading,
    totalItems,
    addToCart: (productId, quantity = 1) =>
      addToCart.mutate({ productId, quantity }),
    updateItem: (itemId, quantity) => updateItem.mutate({ itemId, quantity }),
    removeFromCart: (itemId) => removeItem.mutate(itemId),
    clearCart: () => clearCart.mutate(),
    confirmOrder: () => confirm.mutate(),
  };
}
