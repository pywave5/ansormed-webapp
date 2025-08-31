import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useHaptic } from "../hooks/useHaptic";

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { haptic } = useHaptic(); // ✅ подключаем хук

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        haptic("light");
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, haptic]);

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    haptic("success"); // 🎉 подтверждение
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg max-w-lg w-full p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Закрытие */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => {
            haptic("light");
            onClose();
          }}
        >
          ✕
        </button>

        {/* Картинка */}
        {product?.image && (
          <div className="flex justify-center mb-4">
            <img
              src={product.image}
              alt={product.title}
              className="h-40 object-contain"
            />
          </div>
        )}

        {/* Название */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {product.title}
        </h2>

        {/* Цена */}
        <p className="text-green-600 font-semibold mb-3">
          {product.price.toLocaleString()} сум
        </p>

        {/* Описание */}
        <p className="text-gray-600 mb-4">{product.description}</p>

        {/* Количество */}
        <div className="flex items-center gap-2 mb-6">
          <button
            className="btn btn-sm btn-outline btn-neutral"
            onClick={() => {
              haptic("light");
              handleQuantityChange(quantity - 1);
            }}
          >
            <Minus size={16} />
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            min="1"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setQuantity("");
                return;
              }
              const val = Number(value);
              if (!isNaN(val)) {
                setQuantity(val);
              }
            }}
            onBlur={() => {
              if (!quantity || quantity < 1) {
                setQuantity(1);
                haptic("warning"); // ⚠️ неверный ввод
              }
            }}
            className="input input-bordered w-20 text-center"
          />

          <button
            className="btn btn-sm btn-outline btn-neutral"
            onClick={() => {
              haptic("light");
              handleQuantityChange(quantity + 1);
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Действия */}
        <div className="flex justify-between gap-3">
          <button
            className="btn btn-outline btn-secondary flex-1"
            onClick={() => {
              haptic("light");
              onClose();
            }}
          >
            Назад
          </button>
          <button
            className="btn btn-primary flex-1"
            onClick={handleAddToCart}
          >
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}