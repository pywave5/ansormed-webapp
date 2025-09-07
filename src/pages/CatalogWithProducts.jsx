import { useEffect, useState, useRef } from "react";
import { getCategories, getProducts } from "../services/api";
import AdsCarousel from "../components/AdsCarousel";

export default function CatalogWithProducts() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);

  const categoryRefs = useRef({}); // ссылки на блоки категорий

  useEffect(() => {
    const loadData = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);

        // загружаем товары сразу по всем категориям
        const all = {};
        for (let cat of cats) {
          const data = await getProducts(cat.id, 1);
          all[cat.id] = data.results || [];
        }
        setProductsByCategory(all);
        if (cats.length > 0) setActiveCategory(cats[0].id);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      }
    };
    loadData();
  }, []);

  // следим за скроллом, чтобы менять активную категорию
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-category-id");
            setActiveCategory(Number(id));
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px" } // середина экрана
    );

    Object.values(categoryRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [productsByCategory]);

  const handleCategoryClick = (id) => {
    const el = categoryRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
      {/* Категории фиксированы */}
      <div className="sticky top-0 z-10 bg-white shadow-sm overflow-x-auto">
        <div className="flex space-x-3 p-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Реклама */}
      <AdsCarousel />

      {/* Список товаров по категориям */}
      <div className="space-y-8 mt-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            ref={(el) => (categoryRefs.current[cat.id] = el)}
            data-category-id={cat.id}
          >
            <h2 className="text-xl font-bold mb-3">{cat.name}</h2>
            {productsByCategory[cat.id]?.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {productsByCategory[cat.id].map((p) => (
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
              <p className="text-gray-500">Нет товаров</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
