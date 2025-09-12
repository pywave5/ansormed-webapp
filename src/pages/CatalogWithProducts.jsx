import React, { useEffect, useRef, useState } from "react";
import { getCategories, getProducts } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";
import ProductModal from "../components/ProductModal";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";

export default function CategoriesWithProducts() {
  const { tap, error: hapticError } = useHaptic();
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Загружаем категории
  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const [activeCategory, setActiveCategory] = useState(null);
  const sectionRefs = useRef({});
  const buttonRefs = useRef({});
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
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

  // отслеживаем какая категория сейчас на экране
  useEffect(() => {
    if (!categories.length) return;

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

  const scrollToCategory = (id) => {
    const section = sectionRefs.current[id];
    if (section) {
      const y =
        section.getBoundingClientRect().top + window.scrollY - headerHeight - 10;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (error) {
      hapticError();
    }
  }, [error, hapticError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6 mt-16 text-gray-500">
        <Loader2 className="w-6 h-6 mb-2 animate-spin" />
        <span>Загрузка товаров...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-6 mt-16 text-red-500">
        <AlertTriangle className="w-6 h-6 mb-2" />
        <span>Ошибка загрузки</span>
        tap.error();
      </div>
    );
  }

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
          <CategorySection
            key={c.id}
            category={c}
            ref={(el) => (sectionRefs.current[c.id] = el)}
            onProductClick={(p) => {
              tap();
              setSelectedProduct(p);
            }}
          />
        ))}
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

// 🔥 Компонент секции категории с React Query
const CategorySection = React.forwardRef(({ category, onProductClick }, ref) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["products", category.id],
    queryFn: ({ pageParam = 1 }) => getProducts(category.id, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage?.next) {
        try {
          const url = new URL(lastPage.next);
          return parseInt(url.searchParams.get("page") || "0");
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
  });

  // intersection observer для lazy load
  const loadMoreRef = useRef();
  useEffect(() => {
    if (!hasNextPage || !loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((p) => p.results || p) || [];

  return (
    <section ref={ref} data-id={category.id} className="mb-10 pt-12">
      {products.length > 0 && (
        <h1 className="text-gray-900 font-bold mb-3">{category.name}</h1>
      )}

      {status === "loading" && <p className="text-gray-400">Загрузка...</p>}
      {status === "error" && <p className="text-red-500">Ошибка загрузки</p>}

      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4">
          {products.map((p) => (
            <div
              key={p.id}
              onClick={() => onProductClick(p)}
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
                {p.size && (
                  <p className="text-xs mt-1 text-gray-600">
                    <span className="text-gray-500">Размер:</span>{" "}
                    <span className="font-medium text-blue-600">{p.size} см</span>
                  </p>
                )}
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
        status === "success" && <p className="text-gray-400">Нет товаров</p>
      )}

      <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
        {isFetchingNextPage && <p>Загрузка...</p>}
      </div>
    </section>
  );
});
