import { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductModal from "../components/ProductModal";
import { useHaptic } from "../hooks/useHaptic"; // 👈 импортируем

export default function Products({ categoryId, productsOverride }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { tap } = useHaptic();

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

  const handleSelectProduct = (product) => {
    tap(); // 👈 вибрация при выборе товара
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
                onClick={() => handleSelectProduct(p)} // 👈 вызываем вибрацию
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

          {/* Пагинация */}
          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            <button
              className="btn btn-sm"
              disabled={page === 1}
              onClick={() => {
                tap(); // вибрация
                setPage((p) => p - 1);
              }}
            >
              Назад
            </button>

            {(() => {
              let pagesToShow = [];

              if (totalPages <= 3) {
                // если всего 3 или меньше страниц — показываем все
                pagesToShow = Array.from({ length: totalPages }, (_, i) => i + 1);
              } else if (page === 1) {
                pagesToShow = [1, 2, 3];
              } else if (page === totalPages) {
                pagesToShow = [totalPages - 2, totalPages - 1, totalPages];
              } else {
                pagesToShow = [page - 1, page, page + 1];
              }

              return pagesToShow.map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    tap(); // вибрация
                    setPage(num);
                  }}
                  className={`btn btn-sm ${
                    num === page
                      ? "btn-primary"
                      : "btn-outline text-gray-600 border-gray-300"
                  }`}
                >
                  {num}
                </button>
              ));
            })()}

            <button
              className="btn btn-sm"
              disabled={page === totalPages}
              onClick={() => {
                tap(); // вибрация
                setPage((p) => p + 1);
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
