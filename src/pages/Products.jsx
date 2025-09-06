import { useEffect, useState } from "react";
import { getProducts, getCategories } from "../services/api";
import ProductModal from "../components/ProductModal";
import { useHaptic } from "../hooks/useHaptic";

export default function Products({ selectedId, onCategoryChange }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [categories, setCategories] = useState([]);
  const { tap } = useHaptic();

  // Загружаем список категорий
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  // Загружаем товары
  useEffect(() => {
    if (!selectedId) return;

    const load = async () => {
      try {
        const data = await getProducts(selectedId, page);

        const newProducts = data.results || [];

        setProducts(prev =>
          page === 1 ? newProducts : [...prev, ...newProducts]
        );

        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("Ошибка товаров:", err);
      }
    };

    load();
  }, [selectedId, page]);

  // Проверяем, если страница кончилась → переключаем категорию
  useEffect(() => {
    if (page > totalPages && categories.length > 0) {
      const currentIndex = categories.findIndex((c) => c.id === selectedId);
      const nextCategory = categories[currentIndex + 1];
      if (nextCategory) {
        onCategoryChange(nextCategory.id); // переключаем категорию
        setPage(1);
      }
    }
  }, [page, totalPages, categories, selectedId, onCategoryChange]);

  const handleSelectProduct = (product) => {
    tap();
    setSelectedProduct(product);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Товары</h2>
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

          {/* Вместо кнопок пагинации → "загрузить ещё" */}
          {page < totalPages && (
            <div className="flex justify-center mt-6">
              <button
                className="btn btn-primary"
                onClick={() => {
                  tap();
                  setPage((p) => p + 1);
                }}
              >
                Показать ещё
              </button>
            </div>
          )}
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
