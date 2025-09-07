import { useState, useEffect, useRef } from "react";
import { getCategories, getProducts } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";
import ProductModal from "../components/ProductModal";

export default function CategoriesWithProducts() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categoriesRef = useRef(null);
  const observerRef = useRef(null);

  const { tap } = useHaptic();

  // Загружаем категории
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Загружаем товары по категориям
  useEffect(() => {
    if (!categories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const categoryId = entry.target.getAttribute("data-category-id");
            setActiveCategory(Number(categoryId));
          }
        });
      },
      { threshold: 0.3 }
    );

    observerRef.current = observer;

    categories.forEach((c) => {
      const el = document.querySelector(`[data-category-id="${c.id}"]`);
      if (el) observer.observe(el);
    });

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [categories]);

  useEffect(() => {
    const loadProducts = async (categoryId) => {
      if (productsByCategory[categoryId]) return; // уже загружены
      setLoading(true);
      try {
        const data = await getProducts(categoryId, 1);
        setProductsByCategory((prev) => ({
          ...prev,
          [categoryId]: data.results || [],
        }));
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeCategory) {
      loadProducts(activeCategory);
    }
  }, [activeCategory]);

  // Скролл к категории по клику сверху
  const handleSelectCategory = (id) => {
    setActiveCategory(id);
    const el = document.querySelector(`[data-category-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Выбор товара
  const handleSelectProduct = (product) => {
    tap(); // вибрация
    setSelectedProduct(product);
  };

  return (
    <div>
      {/* Панель категорий */}
      <div className="sticky top-20 z-10 bg-white shadow-sm overflow-x-auto">
        <div
          ref={categoriesRef}
          className="flex gap-2 px-4 py-2 whitespace-nowrap"
        >
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCategory(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Товары */}
      <div className="px-4 pb-6">
        {categories.map((c) => (
          <section key={c.id} data-category-id={c.id} className="mb-8">
            {/* Заголовок категории (только если есть товары) */}
            {productsByCategory[c.id] &&
              productsByCategory[c.id].length > 0 && (
                <h1 className="text-gray-900 font-bold mb-3">{c.name}</h1>
              )}

            <div className="grid grid-cols-2 gap-4">
              {productsByCategory[c.id]
                ? productsByCategory[c.id].map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden relative"
                    >
                      {p.discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow">
                          -{p.discount}%
                        </span>
                      )}

                      {p.image && (
                        <figure className="bg-gray-50 flex justify-center">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="h-24 object-contain"
                          />
                        </figure>
                      )}
                      <div className="p-3 text-center">
                        <h3 className="font-medium text-gray-900 text-sm truncate">
                          {p.title}
                        </h3>

                        <div className="mt-1">
                          {p.discount > 0 ? (
                            <>
                              <span className="text-gray-400 line-through text-xs block">
                                {p.price.toLocaleString()} сум
                              </span>
                              <span className="font-bold text-red-600 text-sm block">
                                {p.final_price.toLocaleString()} сум
                              </span>
                            </>
                          ) : (
                            <span className="font-bold text-green-600 text-sm block">
                              {p.price.toLocaleString()} сум
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                : loading && (
                    <p className="text-gray-400">Загрузка товаров...</p>
                  )}
            </div>
          </section>
        ))}
      </div>

      {/* Модалка товара */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
