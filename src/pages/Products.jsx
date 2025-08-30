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
          {/* Карточки по 2 в ряд */}
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer p-3 flex flex-col"
              >
                {p.image && (
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-28 object-contain mx-auto mb-2"
                  />
                )}
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2">
                  {p.title}
                </h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-green-600 font-bold text-sm">
                    {p.price} сум
                  </span>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(p);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button
              className="btn btn-sm btn-outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ⬅
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, page - 3),
                Math.min(totalPages, page + 2)
              )
              .map((num) => (
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
              ))}

            <button
              className="btn btn-sm btn-outline"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ➡
            </button>
          </div>
        </>
      )}

      {/* Модальное окно */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
