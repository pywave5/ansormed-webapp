import { useState, useEffect } from "react";

export default function EditModal({ isOpen, onClose, field, label, value, onSave }) {
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value, isOpen]);

  if (!isOpen) return null;

  // автоформатирование даты
  const handleDateInput = (e) => {
    let val = e.target.value.replace(/\D/g, ""); // оставляем только цифры
    if (val.length > 8) val = val.slice(0, 8);

    let formatted = val;
    if (val.length > 4) {
      formatted = val.slice(0, 2) + "." + val.slice(2, 4) + "." + val.slice(4);
    } else if (val.length > 2) {
      formatted = val.slice(0, 2) + "." + val.slice(2);
    }

    setInputValue(formatted);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end z-50"
      onClick={onClose} // клик по фону закрывает
    >
      <div
        className="bg-white w-full rounded-t-2xl p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()} // останавливаем всплытие
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>

        <input
          type="text"
          inputMode={field === "birth_date" ? "numeric" : "text"}
          placeholder={field === "birth_date" ? "дд.мм.гггг" : ""}
          className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={inputValue}
          onChange={
            field === "birth_date"
              ? handleDateInput
              : (e) => setInputValue(e.target.value)
          }
        />

        <div className="flex mt-4">
          <button
            className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white font-medium"
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