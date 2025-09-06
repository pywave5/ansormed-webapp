import { useEffect, useState, useRef } from "react";
import { getProducts, getCategories } from "../services/api";
import ProductModal from "../components/ProductModal";
import { useHaptic } from "../hooks/useHaptic";

export default function CatalogWithProducts() {
  const [categories, setCategories] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loaderRef = useRef(null);
  const { tap } = useHaptic();

  // Загружаем категории
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setSelectedId(data[0].id); // первая категория по умолчанию
        }
      })
      .catch(console.error);
  }, []);

  // Загружаем товары
  useEffect(() => {
    if (!selectedId) return;

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

  // Автоподгрузка и переключение категорий
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (page < totalPages) {
            setPage((p) => p + 1);
          } else {
            const currentIndex = categories.findIndex((c) => c.id === selectedId);
            const nextCategory = categories[currentIndex + 1];
            if (nextCategory) {
              setSelectedId(nextCategory.id);
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
  }, [page, totalPages, categories, selectedId]);

  const handleSelectProduct = (product) => {
    tap();
    setSelectedProduct(product);
  };

  const currentCategory = categories.find((c) => c.id === selectedId);

  return (
    <div>
      {/* фиксированные категории */}
      <div className="sticky top-0 bg-white z-10 pb-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setSelectedId(c.id);
                setPage(1);
              }}
              className={`whitespace-nowrap px-4 py-2 rounded-full border transition flex-shrink-0
                ${selectedId === c.id
                  ? "bg-blue-500 text-white border-blue-500"
                  : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* название категории */}
      {currentCategory && (
        <h2 className="text-lg font-semibold mb-3 mt-4">
          {currentCategory.name}
        </h2>
      )}

      {/* товары */}
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
