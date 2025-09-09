import { useEffect, useState } from "react";
import { getCategories, getProducts } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";
import ProductModal from "./ProductModal";

export default function CategoriesWithProducts() {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { tap } = useHaptic();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);

        const newProducts = {};
        for (let cat of cats) {
          try {
            const data = await getProducts(cat.id, 1);
            newProducts[cat.id] = {
              items: data.results || [],
              page: 1,
              hasNext: Boolean(data.next),
            };
          } catch {
            newProducts[cat.id] = { items: [], page: 1, hasNext: false };
          }
        }
        setProductsByCategory(newProducts);
      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8 p-4">
      {categories.map((c) => (
        <div key={c.id}>
          <h2 className="text-lg font-bold mb-3">{c.title}</h2>

          {productsByCategory[c.id] &&
          productsByCategory[c.id].items.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {productsByCategory[c.id].items.map((p, idx, arr) => {
                const isLast = idx === arr.length - 1;
                return (
                  <div
                    key={p.id}
                    ref={
                      isLast
                        ? (node) => {
                            if (!node) return;
                            const observer = new IntersectionObserver(
                              (entries) => {
                                if (
                                  entries[0].isIntersecting &&
                                  productsByCategory[c.id].hasNext
                                ) {
                                  getProducts(
                                    c.id,
                                    productsByCategory[c.id].page + 1
                                  ).then((data) => {
                                    setProductsByCategory((prev) => ({
                                      ...prev,
                                      [c.id]: {
                                        items: [
                                          ...prev[c.id].items,
                                          ...(data.results || []),
                                        ],
                                        page: prev[c.id].page + 1,
                                        hasNext: Boolean(data.next),
                                      },
                                    }));
                                  });
                                }
                              },
                              { threshold: 1.0 }
                            );
                            observer.observe(node);
                          }
                        : null
                    }
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
                );
              })}
            </div>
          ) : productsByCategory[c.id] ? (
            <p className="text-gray-400">Нет товаров</p>
          ) : null}
        </div>
      ))}

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}
