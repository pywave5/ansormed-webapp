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
      .then(setCategories)
      .catch((err) => console.error("Ошибка категорий:", err));
  }, []);

  // Скролл к выбранной категории
  useEffect(() => {
    if (selectedId === null && scrollContainerRef.current) {
      // Скролл к кнопке "Все"
      scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (selectedId !== null && buttonRefs.current[selectedId]) {
      // Скролл к выбранной категории
      const element = buttonRefs.current[selectedId];
      const container = scrollContainerRef.current;
      const containerWidth = container.offsetWidth;
      const elementLeft = element.offsetLeft;
      const elementWidth = element.offsetWidth;
      
      const scrollPosition = elementLeft - (containerWidth / 2) + (elementWidth / 2);
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedId]);

  const handleSelect = (id) => {
    light();
    onSelect(id);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Категории</h2>
      <div 
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
      >
        {/* кнопка "Все" */}
        <button
          ref={el => {
            if (selectedId === null && el) {
              buttonRefs.current['all'] = el;
            }
          }}
          onClick={() => handleSelect(null)}
          className={`whitespace-nowrap px-4 py-2 rounded-full border transition flex-shrink-0
            ${selectedId === null
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
            }`}
        >
          Все
        </button>

        {categories.map((c) => (
          <button
            key={c.id}
            ref={el => {
              if (el) {
                buttonRefs.current[c.id] = el;
              }
            }}
            onClick={() => handleSelect(c.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full border transition flex-shrink-0
              ${selectedId === c.id
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
              }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}