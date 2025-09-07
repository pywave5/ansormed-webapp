import { useEffect, useState, useRef } from "react";
import { getProducts, getCategories } from "../services/api";
import ProductModal from "../components/ProductModal";
import { useHaptic } from "../hooks/useHaptic";

export default function CategoriesWithProducts() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const loaderRef = useRef(null);

  const { tap } = useHaptic();

  // Загружаем категории
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].id); // первая категория по умолчанию
        }
      })
      .catch(console.error);
  }, []);

  // Загружаем товары при изменении категории или страницы
  useEffect(() => {
    if (!activeCategory) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getProducts(activeCategory, page);
        const newProducts = data.results || [];

        setProducts((prev) =>
          page === 1 ? newProducts : [...prev, ...newProducts]
        );
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("Ошибка товаров:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeCategory, page]);

  // Автоподгрузка при скролле вниз
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          products.length > 0 // защита от "прыжка" на старте
        ) {
          if (page < totalPages) {
            setPage((p) => p + 1);
          } else {
            const currentIndex = categories.findIndex(
              (c) => c.id === activeCategory
            );
            const nextCategory = categories[currentIndex + 1];
            if (nextCategory) {
              setActiveCategory(nextCategory.id);
              setPage(1);
              window.scrollTo({ top: 0, behavior: "smooth" }); // возврат к началу при смене категории
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
  }, [page, totalPages, categories, activeCategory, loading, products]);

  const handleSelectProduct = (product) => {
    tap();
    setSelectedProduct(product);
  };

  return (
    <div>
      {/* Фиксированный блок категорий (под Header с pt-24) */}
      <div className="sticky top-24 z-20 bg-white shadow-sm overflow-x-auto">
        <div className="flex space-x-4 p-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setPage(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Название категории */}
      {categories.length > 0 && activeCategory && (
        <h2 className="text-xl font-bold mt-4 mb-2">
          {categories.find((c) => c.id === activeCategory)?.name}
        </h2>
      )}

      {/* Сетка товаров */}
      {products.length === 0 && !loading ? (
        <p className="text-gray-500">Нет товаров</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
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
          ))}
        </div>
      )}

      {/* Невидимый "триггер" для подгрузки */}
      <div ref={loaderRef} className="h-10"></div>

      {loading && <p className="text-center text-gray-400 py-4">Загрузка...</p>}

      {/* Модалка продукта */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
