import axios from "axios";

const API_URL = "https://ac98331984c3.ngrok-free.app/api/v1";

// пока можно хардкодить ключ (потом вытащим из .env)
const API_SECRET_KEY = "dB5ooRWJEXEzsV3q5uj2x6wNGdxlveX6N5f3vhcTkOE";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "X-API-KEY": API_SECRET_KEY,
  },
});

// --- категории ---
export const getCategories = async () => {
  const res = await api.get("/categories/");
  return res.data; // потому что это сразу массив
};

// --- товары по категории ---
export async function getProducts(categoryId, page = 1) {
  let url = `/products/?page=${page}`;
  
  if (categoryId) {
    url += `&category=${categoryId}`;
  }

  const res = await api.get(url);
  return res.data; // { count, total_pages, results }
}

// --- поиск товаров ---
export async function searchProducts(query) {
  const res = await api.get(`/products/?search=${query}`);
  return res.data;
}