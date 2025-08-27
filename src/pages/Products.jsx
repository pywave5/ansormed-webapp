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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="card bg-base-100 shadow-md hover:shadow-xl transition cursor-pointer"
              >
                {p.image && (
                  <figure className="bg-gray-50">
                    <img
                      src={p.image}
                      alt={p.title}
                      className="h-40 object-contain"
                    />
                  </figure>
                )}
                <div className="card-body">
                  <h3 className="card-title text-base">{p.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {p.description}
                  </p>
                  <div className="card-actions justify-between items-center mt-3">
                    <span className="font-bold text-green-600">
                      {p.price} сум
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProduct(p);
                      }}
                    >
                      В корзину
                    </button>
                  </div>
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

            {/* Номера страниц */}
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
                  num === page ? "btn-primary" : "btn-outline text-gray-600 border-gray-300"
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
