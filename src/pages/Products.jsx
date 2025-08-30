import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductModal from "../components/ProductModal";

export default function Products({ categoryId, productsOverride }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (productsOverride) {
      setProducts(productsOverride);
      return;
    }

    const load = async () => {
      try {
        const data = await getProducts(categoryId, page);
        setProducts(data.results || []);
        setTotalPages(data.total_pages || 1);
      } catch (err) {
        console.error("Ошибка товаров:", err);
      }
    };

    load();
  }, [categoryId, productsOverride, page]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Товары</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">Нет товаров</p>
      ) : (
        <>
          {/* 2 колонки всегда */}
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer p-3 flex flex-col items-center"
              >
                {p.image && (
                  <div className="w-full flex justify-center mb-2">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-24 object-contain"
                    />
                  </div>
                )}
                <h3 className="text-sm font-semibold text-gray-900 text-center line-clamp-2">
                  {p.title}
                </h3>
                <span className="text-green-600 font-bold mt-1">
                  {p.price} сум
                </span>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                className="btn btn-sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Назад
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const num = i + 1;
                return (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`btn btn-sm ${
                      num === page
                        ? "btn-primary"
                        : "btn-outline text-gray-600 border-gray-300"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}

              <button
                className="btn btn-sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Вперёд
              </button>
            </div>
          )}
        </>
      )}

      {/* Модалка */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
