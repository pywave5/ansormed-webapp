import { useState, useEffect } from "react";

export default function EditModal({ isOpen, onClose, field, label, value, onSave }) {
  const [inputValue, setInputValue] = useState(value || "");

  const formatPhone = (val) => {
    val = val.replace(/\D/g, "");
    if (!val.startsWith("998")) {
      if (val.startsWith("8")) {
        val = "998" + val.slice(1);
      } else {
        val = "998" + val;
      }
    }
    if (val.length > 12) val = val.slice(0, 12);

    let formatted = "+998";
    if (val.length > 3) formatted += " " + val.slice(3, 5);
    if (val.length > 5) formatted += " " + val.slice(5, 8);
    if (val.length > 8) formatted += " " + val.slice(8, 10);
    if (val.length > 10) formatted += " " + val.slice(10, 12);

    return formatted;
  };

  const formatDate = (val) => {
    val = val.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);

    if (val.length > 4) {
      return val.slice(0, 2) + "." + val.slice(2, 4) + "." + val.slice(4);
    } else if (val.length > 2) {
      return val.slice(0, 2) + "." + val.slice(2);
    }
    return val;
  };

  useEffect(() => {
    if (field === "phone_number" && value) {
      setInputValue(formatPhone(value));
    } else if (field === "birth_date" && value) {
      setInputValue(formatDate(value));
    } else {
      setInputValue(value || "");
    }
  }, [value, isOpen, field]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    let val = e.target.value;
    if (field === "birth_date") return setInputValue(formatDate(val));
    if (field === "phone_number") return setInputValue(formatPhone(val));
    setInputValue(val);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Штора */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose}></div>

      {/* Модалка снизу */}
      <div className="fixed inset-x-0 bottom-0">
        <div
          className="bg-white w-full rounded-t-2xl p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">{label}</h3>

          <input
            type="text"
            inputMode={
              field === "birth_date" || field === "phone_number" ? "numeric" : "text"
            }
            placeholder={
              field === "birth_date"
                ? "дд.мм.гггг"
                : field === "phone_number"
                ? "+998 99 123 45 67"
                : field === "email"
                ? "example@mail.ru"
                : ""
            }
            className="w-full bg-white border border-gray-300 rounded-xl p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={inputValue}
            onChange={handleInputChange}
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
    </div>
  );
}
