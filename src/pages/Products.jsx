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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="card bg-white shadow-md hover:shadow-lg transition cursor-pointer rounded-xl overflow-hidden"
              >
                {p.image && (
                  <figure className="bg-gray-50 flex items-center justify-center h-48">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-40 object-contain"
                    />
                  </figure>
                )}
                <div className="card-body text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {p.title}
                  </h3>
                  <span className="text-green-600 font-bold mt-2 block">
                    {p.price} сум
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center items-center gap-2 mt-6">
            <button
              className="btn btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Назад
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
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
              className="btn btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Вперёд
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
