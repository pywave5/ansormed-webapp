import { useEffect, useState } from "react";
import { getCategories } from "../services/api";
import { useHaptic } from "../hooks/useHaptic"; // 👈 импорт хука

export default function Categories({ onSelect, selectedId }) {
  const [categories, setCategories] = useState([]);
  const { light } = useHaptic(); // 👈 используем лёгкую вибрацию

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err) => console.error("Ошибка категорий:", err));
  }, []);

  const handleSelect = (id) => {
    light(); // 👈 вибрация при выборе
    onSelect(id);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Категории</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {/* кнопка "Все" */}
        <button
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
