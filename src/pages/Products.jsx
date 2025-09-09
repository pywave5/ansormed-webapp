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
    <div>
      {/* название текущей категории */}
      {currentCategory && (
        <h1 className="text-lg font-semibold mb-3 mt-16">
          {currentCategory.name}
        </h1>
      )}

      {products.length === 0 ? (
        <p className="text-gray-500">Нет товаров</p>
      ) : (
        <>
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

          {/* Невидимый "триггер" для подгрузки */}
          <div ref={loaderRef} className="h-10"></div>
        </>
      )}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
