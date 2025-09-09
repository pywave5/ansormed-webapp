import { useEffect, useRef, useState } from "react";
import { getCategories, getProducts } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";
import ProductModal from "../components/ProductModal";

export default function CatalogWithProducts() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loading, setLoading] = useState(false);
  const buttonRefs = useRef({});
  const { tap } = useHaptic();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // загружаем категории
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].id);
      })
      .catch((err) => console.error("Ошибка категорий:", err));
  }, []);

  // загружаем товары при смене категории
  useEffect(() => {
    if (!activeCategory) return;

    setProducts([]);
    setPage(1);
    setHasNext(true);
    fetchProducts(activeCategory, 1);
  }, [activeCategory]);

  const fetchProducts = async (categoryId, pageNum) => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await getProducts(categoryId, pageNum);
      setProducts((prev) => [...prev, ...(data.results || [])]);
      setHasNext(Boolean(data.next));
      setPage(pageNum);
    } catch (err) {
      console.error("Ошибка загрузки товаров:", err);
    } finally {
      setLoading(false);
    }
  };

  // подгрузка товаров при скролле вниз
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 300 &&
        hasNext &&
        !loading
      ) {
        fetchProducts(activeCategory, page + 1);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory, page, hasNext, loading]);

  // скроллим таб активной категории к центру
  useEffect(() => {
    if (activeCategory && buttonRefs.current[activeCategory]) {
      buttonRefs.current[activeCategory].scrollIntoView({
        inline: "center",
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeCategory]);

  return (
    <div>
      {/* Полоска категорий */}
      <div className="sticky top-0 z-40 bg-gray-100 shadow-sm overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-3 py-2">
          {categories.map((c) => (
            <button
              key={c.id}
              ref={(el) => (buttonRefs.current[c.id] = el)}
              onClick={() => {
                tap();
                setActiveCategory(c.id);
              }}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                activeCategory === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Товары выбранной категории */}
      <div className="p-3">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  tap();
                  setSelectedProduct(p);
                }}
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
        ) : (
          <p className="text-gray-400">Нет товаров</p>
        )}

        {loading && <p className="text-center py-4">Загрузка...</p>}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
