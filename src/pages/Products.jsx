import { useEffect, useState, useRef } from "react";
import { getProducts, getCategories } from "../services/api";
import ProductModal from "../components/ProductModal";
import { useHaptic } from "../hooks/useHaptic";

export default function Products({ selectedId, onCategoryChange }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const loaderRef = useRef(null);

  const { tap } = useHaptic();

  // Загружаем категории (чтобы знать следующую)
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Загружаем товары при изменении категории или страницы
  useEffect(() => {
    if (selectedId === null) return;

    const load = async () => {
      try {
        const data = await getProducts(selectedId, page);
        const newProducts = data.results || [];

        setProducts((prev) =>
          page === 1 ? newProducts : [...prev, ...newProducts]
        );

        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("Ошибка товаров:", err);
      }
    };

    load();
  }, [selectedId, page]);

  // Автоподгрузка при скролле вниз
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (page < totalPages) {
            setPage((p) => p + 1);
          } else {
            // 👉 переключение категории в интерфейсе
            const currentIndex = categories.findIndex(
              (c) => c.id === selectedId
            );
            const nextCategory = categories[currentIndex + 1];
            if (nextCategory) {
              onCategoryChange(nextCategory.id);
              setPage(1);
            }
          }
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [page, totalPages, categories, selectedId, onCategoryChange]);

  const handleSelectProduct = (product) => {
    tap();
    setSelectedProduct(product);
  };

  const currentCategory = categories.find((c) => c.id === selectedId);

  return (
    <div className="pt-24 bg-red-100 min-h-screen">
      <div className="bg-yellow-300 sticky top-24 z-10">
        <p>Полоска категорий</p>
      </div>

      <h1 className="text-lg font-semibold mb-3 mt-16 bg-green-300">
        Название категории
      </h1>
    </div>
  );
}
