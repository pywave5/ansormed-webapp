import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY;

if (!API_URL) {
  console.error("❌ API_URL не задан в .env.local");
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "X-API-KEY": API_SECRET_KEY,
    "ngrok-skip-browser-warning": "true", // убираем экран ngrok
  },
});

// --- авторизация через Telegram ---
export async function authWithTelegram(initDataString) {
  try {
    const res = await api.post("/auth/telegram/", { auth_data: initDataString });
    return res.data;
  } catch (err) {
    console.error("❌ Ошибка авторизации Telegram:", err.response?.data || err.message);
    throw err;
  }
}

// --- категории ---
export const getCategories = async () => {
  const res = await api.get("/categories/");
  return res.data;
};

// --- товары по категории ---
export async function getProducts(categoryId, page = 1) {
  let url = `/products/?page=${page}`;
  if (categoryId) {
    url += `&category=${categoryId}`;
  }
  const res = await api.get(url);
  return res.data;
}

// --- поиск товаров ---
export async function searchProducts(query) {
  const res = await api.get(`/products/?search=${query}`);
  return res.data;
}

// --- история заказов ---
export async function getMyOrders(telegramId) {
  if (!telegramId) {
    throw new Error("❌ telegramId обязателен для getMyOrders");
  }
  const res = await api.get(`/orders/me/?telegram_id=${telegramId}`);
  return res.data;
}

// --- корзина (draft заказ) ---

// получить текущую корзину пользователя
export async function getUserCart(telegramId) {
  const res = await api.get(`/orders/`, {
    params: { telegram_id: telegramId, status: "draft", ordering: "-created_at" },
  });
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0];
  }
  return null;
}

// создать корзину или вернуть существующую
export async function getOrCreateCart(telegramId, username, phoneNumber, customerName) {
  const res = await api.get(`/orders/`, {
    params: { telegram_id: telegramId, status: "draft" },
  });
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0];
  }

  const payload = {
    telegram_id: telegramId,
    user_name: username,
    phone_number: phoneNumber,
    customer_name: customerName,
    status: "draft",
    total_cost: 0,
  };

  const createRes = await api.post(`/orders/`, payload);
  return createRes.data;
}

// добавить товар в корзину
export async function addItemToCart(orderId, productId, quantity, updateCart) {
  const payload = { order: orderId, product: productId, quantity };
  await api.post(`/order-items/`, payload);

  const updatedCart = await getOrCreateCart(telegramId, username, phoneNumber, customerName);
  updateCart(updatedCart);
}

// обновить количество товара в корзине
export async function updateCartItem(itemId, quantity) {
  const res = await api.patch(`/order-items/${itemId}/`, { quantity });
  return res.data;
}

// удалить товар из корзины
export async function removeCartItem(itemId) {
  await api.delete(`/order-items/${itemId}/`);
  return true;
}

// очистить корзину (отменить заказ и удалить товары)
export async function clearUserCart(telegramId) {
  const cart = await getUserCart(telegramId);
  if (!cart) return false;

  await api.patch(`/orders/${cart.id}/`, { status: "canceled" });

  for (const item of cart.items || []) {
    await api.delete(`/order-items/${item.id}/`);
  }

  return true;
}

// подтвердить заказ
export async function confirmOrder(orderId) {
  const res = await api.patch(`/orders/${orderId}/`, { status: "confirmed" });
  return res.data;
}


// --- user api --- 
export async function getUserByTelegramId(telegramId) {
  try {
    const res = await api.get("/users/", {
      params: { telegram_id: telegramId },
    });

    // Поддержка и без пагинации, и с пагинацией
    if (Array.isArray(res.data)) {
      return res.data[0] || null;
    }
    if (res.data.results) {
      return res.data.results[0] || null;
    }
    return null;
  } catch (err) {
    console.error("❌ Ошибка при получении пользователя:", err);
    return null;
  }
}

export async function createUser(userData) {
  try {
    const res = await api.post("/users/", userData);
    return res.data;
  } catch (err) {
    console.error("❌ Ошибка при создании пользователя:", err);
    throw err;
  }
}

export async function updateUser(userId, fields) {
  try {
    const res = await api.patch(`/users/${userId}/`, fields);
    return res.data;
  } catch (err) {
    console.error("❌ Ошибка при обновлении пользователя:", err);
    throw err;
  }
}

// --- реклама ---
export async function getAds() {
  const res = await api.get("/ads/");
  return res.data.results || res.data; // поддержка пагинации и без неё
}