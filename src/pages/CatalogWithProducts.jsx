import { useEffect, useRef, useState } from "react";
import { getCategories, getProducts } from "../services/api";

export default function CategoriesWithProducts() {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [productsByCategory, setProductsByCategory] = useState({});
  const sectionRefs = useRef({});
  const [headerHeight, setHeaderHeight] = useState(0);

  // Загружаем категории
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0].id);
      })
      .catch((err) => console.error("Ошибка категорий:", err));
  }, []);

  // Загружаем товары по категориям
  useEffect(() => {
    const fetchAll = async () => {
      const newProducts = {};
      for (let cat of categories) {
        try {
          const data = await getProducts(cat.id, 1);
          newProducts[cat.id] = data.results || [];
        } catch (err) {
          newProducts[cat.id] = [];
        }
      }
      setProductsByCategory(newProducts);
    };
    if (categories.length > 0) fetchAll();
  }, [categories]);

  // вычисляем высоту header
  useEffect(() => {
    const header = document.querySelector("header");
    if (header) {
      setHeaderHeight(header.offsetHeight);
    }
    const handleResize = () => {
      if (header) setHeaderHeight(header.offsetHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // отслеживаем какая категория сейчас на экране
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) {
          setActiveCategory(parseInt(visible.target.dataset.id));
        }
      },
      {
        rootMargin: `-${headerHeight + 50}px 0px -70% 0px`, // учитываем высоту хедера
        threshold: 0,
      }
    );

    Object.values(sectionRefs.current).forEach((el) =>
      el ? observer.observe(el) : null
    );

    return () => observer.disconnect();
  }, [categories, headerHeight]);

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

  return (
    <div>
      {/* Фиксированные категории под хедером */}
      <div
        className="z-40 bg-white shadow-sm overflow-x-auto"
        style={{ position: "sticky", top: headerHeight }}
      >
        <div className="flex gap-3 px-3 py-2">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => scrollToCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap transition ${
                activeCategory === c.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {c.title}
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
            className="mb-10"
          >
            <h2 className="text-lg font-bold mb-3">{c.title}</h2>
            {productsByCategory[c.id] ? (
              <div className="grid grid-cols-2 gap-4">
                {productsByCategory[c.id].map((p) => (
                  <div
                    key={p.id}
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
              <p className="text-gray-400">Загрузка...</p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
