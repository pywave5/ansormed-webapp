import { useEffect, useState, useRef } from "react";
import { getCategories, getProducts } from "../services/api";
import ProductModal from "../components/ProductModal";
import { useHaptic } from "../hooks/useHaptic";

export default function CategoriesWithProducts() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loaderRef = useRef(null);
  const { tap } = useHaptic();

  // замеряем высоту хэдера
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }
  }, []);

  // загружаем категории
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) {
          setActiveCategory(data[0].id);
        }
      })
      .catch((err) => console.error("Ошибка категорий:", err));
  }, []);

  // загружаем товары при изменении категории или страницы
  useEffect(() => {
    if (!activeCategory) return;

    const load = async () => {
      try {
        const data = await getProducts(activeCategory, page);
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
  }, [activeCategory, page]);

  // автоподгрузка товаров
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
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
            }
          }
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [page, totalPages, categories, activeCategory]);

  const handleSelectProduct = (product) => {
    tap();
    setSelectedProduct(product);
  };

  return (
    <div>
      {/* Категории под хедером */}
      <div
        className="sticky z-10 bg-white shadow-sm overflow-x-auto"
        style={{ top: headerHeight }}
      >
        <div className="flex space-x-2 p-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setActiveCategory(c.id);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                activeCategory === c.id
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Товары */}
      {products.length === 0 ? (
        <p className="text-gray-500 p-4">Нет товаров</p>
      ) : (
        <>
          <h2 className="text-xl font-bold mt-4 mb-3">
            {categories.find((c) => c.id === activeCategory)?.name}
          </h2>

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

          {/* Триггер подгрузки */}
          <div ref={loaderRef} className="h-10"></div>
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
