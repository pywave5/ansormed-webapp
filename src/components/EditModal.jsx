import { useState, useEffect } from "react";

export default function EditModal({ isOpen, onClose, field, label, value, onSave }) {
  const [inputValue, setInputValue] = useState(value || "");

  // чтобы при открытии модалки подтягивалось актуальное значение
  useEffect(() => {
    setInputValue(value || "");
  }, [value, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end z-50">
      <div className="bg-white w-full rounded-t-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>

        <input
          type="text"
          className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />

        <div className="flex justify-end space-x-3 mt-4">
          <button
            className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700"
            onClick={onClose}
          >
            Отмена
          </button>
          <button
            className="px-4 py-2 rounded-xl bg-blue-600 text-white"
            onClick={() => {
              onSave(field, inputValue);
              onClose();
            }}
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
}
