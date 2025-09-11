import { useEffect, useRef, useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getCategories, getProducts } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";
import ProductModal from "../components/ProductModal";

export default function CategoriesWithProducts() {
  const { tap } = useHaptic();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const sectionRefs = useRef({});
  const buttonRefs = useRef({});

  // 📌 Загружаем категории
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000, // 5 минут кэш
    onSuccess: (data) => {
      if (data.length > 0 && !activeCategory) {
        setActiveCategory(data[0].id);
      }
    },
  });

  // 📌 Для каждой категории — отдельный Infinite Query
  const productQueries = categories.reduce((acc, cat) => {
    acc[cat.id] = useInfiniteQuery({
      queryKey: ["products", cat.id],
      queryFn: ({ pageParam = 1 }) => getProducts(cat.id, pageParam),
      getNextPageParam: (lastPage, allPages) =>
        lastPage.next ? allPages.length + 1 : undefined,
      staleTime: 2 * 60 * 1000, // кэш на 2 минуты
    });
    return acc;
  }, {});

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

  // отслеживаем какая категория на экране
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveCategory(parseInt(visible.target.dataset.id));
        }
      },
      {
        rootMargin: `-${headerHeight + 50}px 0px -70% 0px`,
        threshold: 0,
      }
    );

    Object.values(sectionRefs.current).forEach((el) =>
      el ? observer.observe(el) : null
    );

    return () => observer.disconnect();
  }, [categories, headerHeight]);

  // скроллим категории так, чтобы активная была по центру
  useEffect(() => {
    if (activeCategory && buttonRefs.current[activeCategory]) {
      buttonRefs.current[activeCategory].scrollIntoView({
        inline: "center",
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeCategory]);

  // lazy load: догружаем товары при скролле вниз
  useEffect(() => {
    const handleScroll = () => {
      if (!activeCategory) return;
      const query = productQueries[activeCategory];
      if (!query) return;

      const bottom =
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300;

      if (bottom && query.hasNextPage && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory, productQueries]);

  const scrollToCategory = (id) => {
    const section = sectionRefs.current[id];
    if (section) {
      const y =
        section.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

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
        {categories.map((c) => {
          const query = productQueries[c.id];
          const products =
            query?.data?.pages.flatMap((page) => page.results) || [];

          return (
            <section
              key={c.id}
              ref={(el) => (sectionRefs.current[c.id] = el)}
              data-id={c.id}
              className="mb-10 pt-12"
            >
              {/* Заголовок категории */}
              {products.length > 0 && (
                <h1 className="text-gray-900 font-bold mb-3">{c.name}</h1>
              )}

              {query?.isLoading ? (
                <p className="text-gray-400">Загрузка...</p>
              ) : products.length > 0 ? (
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
            </section>
          );
        })}
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
