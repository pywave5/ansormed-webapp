import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductModal from "../components/ProductModal";
import { useHaptic } from "../hooks/useHaptic";

export default function Products({ categoryId, productsOverride }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const haptic = useHaptic();

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
          {/* 2 товара в ряд всегда */}
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProduct(p);
                  haptic.light();
                }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
              >
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
                  <span className="font-bold text-green-600 text-sm block mt-1">
                    {p.price.toLocaleString()} сум
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Пагинация */}
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button
              className="btn btn-sm"
              disabled={page === 1}
              onClick={() => {
                setPage((p) => p - 1);
                haptic.light();
              }}
            >
              Назад
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
              .map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    setPage(num);
                    haptic.medium();
                  }}
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
              onClick={() => {
                setPage((p) => p + 1);
                haptic.light();
              }}
            >
              Вперёд
            </button>
          </div>
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