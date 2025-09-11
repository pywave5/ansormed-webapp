import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories, getProducts } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";
import ProductModal from "../components/ProductModal";

export default function CategoriesWithProducts() {
  const { tap } = useHaptic();
  const sectionRefs = useRef({});
  const buttonRefs = useRef({});
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Загружаем категории
  const {
    data: categories = [],
    isLoading: loadingCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // кэш 5 минут
  });

  // Кешируем товары по категориям
  const productsCache = useRef({});
  const [productsByCategory, setProductsByCategory] = useState({});
  const [pagesByCategory, setPagesByCategory] = useState({});
  const [hasNextByCategory, setHasNextByCategory] = useState({});
  const [loading, setLoading] = useState(false);

  // Инициализируем категории
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);

  // Загружаем первую страницу товаров
  useEffect(() => {
    const fetchAll = async () => {
      const newProducts = {};
      const newPages = {};
      const newHasNext = {};

      for (let cat of categories) {
        if (productsCache.current[cat.id]) {
          newProducts[cat.id] = productsCache.current[cat.id].products;
          newPages[cat.id] = productsCache.current[cat.id].page;
          newHasNext[cat.id] = productsCache.current[cat.id].hasNext;
        } else {
          try {
            const data = await getProducts(cat.id, 1);
            newProducts[cat.id] = data.results || [];
            newPages[cat.id] = 1;
            newHasNext[cat.id] = Boolean(data.next);
            productsCache.current[cat.id] = {
              products: data.results || [],
              page: 1,
              hasNext: Boolean(data.next),
            };
          } catch {
            newProducts[cat.id] = [];
            newPages[cat.id] = 1;
            newHasNext[cat.id] = false;
          }
        }
      }

      setProductsByCategory(newProducts);
      setPagesByCategory(newPages);
      setHasNextByCategory(newHasNext);
    };

    if (categories.length > 0) fetchAll();
  }, [categories]);

  // вычисляем высоту header
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) setHeaderHeight(header.offsetHeight);

    const handleResize = () => {
      if (header) setHeaderHeight(header.offsetHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // IntersectionObserver для категорий
  useEffect(() => {
    if (!categories.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let mostVisible = null;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (
              !mostVisible ||
              entry.intersectionRatio > mostVisible.intersectionRatio
            ) {
              mostVisible = entry;
            }
          }
        }

        if (mostVisible) {
          setActiveCategory(parseInt(mostVisible.target.dataset.id));
        }
      },
      {
        rootMargin: `-${headerHeight + 20}px 0px -50% 0px`,
        threshold: [0.25, 0.5, 0.75, 1],
      }
    );

    Object.values(sectionRefs.current).forEach((el) =>
      el ? observer.observe(el) : null
    );

    return () => observer.disconnect();
  }, [categories, headerHeight]);

  // скроллим категории в центр
  useEffect(() => {
    if (activeCategory && buttonRefs.current[activeCategory]) {
      buttonRefs.current[activeCategory].scrollIntoView({
        inline: "center",
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeCategory]);

  // ленивый догруз товаров
  const fetchMore = async (catId) => {
    if (loading) return;
    setLoading(true);
    try {
      const nextPage = pagesByCategory[catId] + 1;
      const data = await getProducts(catId, nextPage);

      const updatedProducts = [
        ...(productsByCategory[catId] || []),
        ...(data.results || []),
      ];

      setProductsByCategory((prev) => ({
        ...prev,
        [catId]: updatedProducts,
      }));
      setPagesByCategory((prev) => ({ ...prev, [catId]: nextPage }));
      setHasNextByCategory((prev) => ({
        ...prev,
        [catId]: Boolean(data.next),
      }));

      // кешируем
      productsCache.current[catId] = {
        products: updatedProducts,
        page: nextPage,
        hasNext: Boolean(data.next),
      };
    } catch (err) {
      console.error("Ошибка подгрузки:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (loading) return;
      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300;

      if (bottom && activeCategory && hasNextByCategory[activeCategory]) {
        fetchMore(activeCategory);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory, hasNextByCategory, loading, pagesByCategory]);

  const scrollToCategory = (id) => {
    const section = sectionRefs.current[id];
    if (section) {
      const y =
        section.getBoundingClientRect().top +
        window.scrollY -
        headerHeight -
        10;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (loadingCategories) return <p>Загрузка категорий...</p>;

  return (
    <div>
      {/* Фиксированные категории под хедером */}
      <div
        className="z-40 bg-gray-100 shadow-sm overflow-x-auto scrollbar-hide"
        style={{ position: "sticky", top: headerHeight }}
      >
        <div className="flex gap-3 px-3 py-2">
          {categories.map((c) => (
            <button
              key={c.id}
              ref={(el) => (buttonRefs.current[c.id] = el)}
              onClick={() => scrollToCategory(c.id)}
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

      {/* Секции товаров */}
      <div className="p-3">
        {categories.map((c) => (
          <section
            key={c.id}
            ref={(el) => (sectionRefs.current[c.id] = el)}
            data-id={c.id}
            className="mb-10 pt-12"
          >
            {productsByCategory[c.id] &&
              productsByCategory[c.id].length > 0 && (
                <h1 className="text-gray-900 font-bold mb-3">{c.name}</h1>
              )}

            {productsByCategory[c.id] &&
            productsByCategory[c.id].length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {productsByCategory[c.id].map((p) => (
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
            ) : productsByCategory[c.id] ? (
              <p className="text-gray-400">Нет товаров</p>
            ) : null}
          </section>
        ))}
      </div>

      {loading && <p className="text-center py-4">Загрузка...</p>}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
