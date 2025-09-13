import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const API_SECRET_KEY = import.meta.env.VITE_API_SECRET_KEY;

if (!API_URL) {
  console.error("API_URL не задан в .env.local");
}

// --- публичный API (без ключа) ---
export const apiPublic = axios.create({
  baseURL: API_URL,
});

// --- приватный API (JWT или X-API-KEY) ---
export const apiPrivate = axios.create({
  baseURL: API_URL,
  headers: {
    "X-API-KEY": API_SECRET_KEY
  },
});

// --- интерцептор для JWT ---
const attachAuthInterceptor = (instance) => {
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
};

attachAuthInterceptor(apiPrivate);

//
// --- авторизация через Telegram (публичный) ---
//
export async function authWithTelegram(initDataString) {
  const res = await apiPublic.post("/auth/telegram/", { auth_data: initDataString });

  const { access, refresh } = res.data;
  if (access) localStorage.setItem("access", access);
  if (refresh) localStorage.setItem("refresh", refresh);

  return res.data;
}

//
// --- категории (публично) ---
//
export async function getCategories() {
  const res = await apiPublic.get("/categories/");
  return res.data;
}

//
// --- товары (публично) ---
//
export async function getProducts(categoryId, page = 1) {
  let url = `/products/?page=${page}`;
  if (categoryId) url += `&category=${categoryId}`;
  const res = await apiPublic.get(url);
  return res.data;
}

export async function searchProducts(query) {
  const res = await apiPublic.get(`/products/?search=${query}`);
  return res.data;
}

//
// --- реклама (публично) ---
//
export async function getAds() {
  const res = await apiPublic.get("/ads/");
  return res.data.results || res.data;
}

//
// --- история заказов (нужен JWT или X-API-KEY) ---
//
export async function getMyOrders(telegramId) {
  if (!telegramId) throw new Error("❌ telegramId обязателен для getMyOrders");
  const res = await apiPrivate.get(`/orders/me/`, {
    params: { telegram_id: telegramId },
  });
  return res.data;
}

//
// --- корзина (приватный API) ---
//
export async function getUserCart(telegramId) {
  const res = await apiPrivate.get(`/orders/`, {
    params: { telegram_id: telegramId, status: "draft", ordering: "-created_at" },
  });
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0];
  }
  return null;
}

export async function getOrCreateCart(telegramId, username, phoneNumber, customerName) {
  const res = await apiPrivate.get(`/orders/`, {
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

  const createRes = await apiPrivate.post(`/orders/`, payload);
  return createRes.data;
}

export async function addItemToCart(orderId, productId, quantity, updateCart, telegramId, username, phoneNumber, customerName) {
  const payload = { order: orderId, product: productId, quantity };
  await apiPrivate.post(`/order-items/`, payload);

  const updatedCart = await getOrCreateCart(telegramId, username, phoneNumber, customerName);
  updateCart(updatedCart);
}

export async function updateCartItem(itemId, quantity) {
  const res = await apiPrivate.patch(`/order-items/${itemId}/`, { quantity });
  return res.data;
}

export async function removeCartItem(itemId) {
  await apiPrivate.delete(`/order-items/${itemId}/`);
  return true;
}

export async function clearUserCart(telegramId) {
  const cart = await getUserCart(telegramId);
  if (!cart) return false;

  await apiPrivate.patch(`/orders/${cart.id}/`, { status: "canceled" });

  for (const item of cart.items || []) {
    await apiPrivate.delete(`/order-items/${item.id}/`);
  }

  return true;
}

export async function confirmOrder(orderId) {
  const res = await apiPrivate.patch(`/orders/${orderId}/`, { status: "confirmed" });
  return res.data;
}

//
// --- users (приватный API) ---
//
export async function getUserByTelegramId(telegramId) {
  try {
    const res = await apiPrivate.get("/users/", { params: { telegram_id: telegramId } });
    if (Array.isArray(res.data)) return res.data[0] || null;
    if (res.data.results) return res.data.results[0] || null;
    return null;
  } catch (err) {
    console.error("❌ Ошибка при получении пользователя:", err);
    return null;
  }
}

export async function createUser(userData) {
  try {
    const res = await apiPrivate.post("/users/", userData);
    return res.data;
  } catch (err) {
    console.error("❌ Ошибка при создании пользователя:", err);
    throw err;
  }
}

export async function updateUser(userId, fields) {
  try {
    const res = await apiPrivate.patch(`/users/${userId}/`, fields);
    return res.data;
  } catch (err) {
    console.error("❌ Ошибка при обновлении пользователя:", err);
    throw err;
  }
}
