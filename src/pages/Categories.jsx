import { useEffect, useState, useRef } from "react";
import { getCategories } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";

export default function Categories({ onSelect, selectedId }) {
  const [categories, setCategories] = useState([]);
  const { light } = useHaptic();
  const scrollContainerRef = useRef(null);
  const buttonRefs = useRef({});

  useEffect(() => {
    getCategories()
      .then((cats) => {
        setCategories(cats);
        if (cats.length > 0 && selectedId === null) {
          onSelect(cats[0].id);
        }
      })
      .catch((err) => console.error("Ошибка категорий:", err));
  }, [onSelect, selectedId]);

  useEffect(() => {
    if (selectedId !== null && buttonRefs.current[selectedId]) {
      const element = buttonRefs.current[selectedId];
      const container = scrollContainerRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;

      const scrollPosition =
        elementLeft - containerWidth / 2 + elementWidth / 2;

      container.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
    }
  }, [selectedId]);

  const handleSelect = (id) => {
    light();
    onSelect(id);
  };

  return (
    <>
      {/* sticky панель с категориями */}
      <div className="sticky top-0 bg-gray-100 z-10 pb-2">
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        >
          {categories.map((c) => (
            <button
              key={c.id}
              ref={(el) => {
                if (el) buttonRefs.current[c.id] = el;
              }}
              onClick={() => handleSelect(c.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-full border transition flex-shrink-0
                ${
                  selectedId === c.id
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* spacer чтобы контент не заезжал под sticky */}
      <div className="h-14"></div>
    </>
  );
}
