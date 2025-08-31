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