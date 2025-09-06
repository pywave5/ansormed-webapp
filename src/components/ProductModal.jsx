import { useEffect, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { useCart } from "../hooks/useCart"; // ✅ новый хук
import { useHaptic } from "../hooks/useHaptic";

export default function ProductModal({ product, onClose }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart(); // ✅ берём из React Query
  const { light, success, warning } = useHaptic();

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        light();
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose, light]);

  const handleQuantityChange = (val) => {
    if (val < 1) {
      warning();
      return;
    }
    if (val > 10000) {
      setQuantity(10000);
      warning();
      return;
    }
    setQuantity(val);
  };

  const handleAddToCart = () => {
    addToCart(product, quantity); // 🚀 напрямую вызываем mutation
    success();
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
            light();
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

        {/* Цена со скидкой */}
        <p className="text-green-600 font-semibold mb-3">
          {product.final_price.toLocaleString()} сум
          {product.discount > 0 && (
            <span className="line-through ml-2 text-gray-400">
              {product.price.toLocaleString()} сум
            </span>
          )}
        </p>

        {/* Описание */}
        <p className="text-gray-600 mb-4">{product.description}</p>

        {/* Количество */}
        <div className="flex items-center gap-2 mb-6">
          <button
            className="btn btn-sm btn-outline btn-neutral"
            onClick={() => {
              light();
              handleQuantityChange(quantity - 1);
            }}
          >
            <Minus size={16} />
          </button>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "") {
                setQuantity("");
                return;
              }
              const val = Number(value);
              if (!isNaN(val)) {
                handleQuantityChange(val);
              }
            }}
            onBlur={() => {
              if (!quantity || quantity < 1) {
                setQuantity(1);
                warning();
              } else if (quantity > 10000) {
                setQuantity(10000);
                warning();
              }
            }}
            className="input input-bordered w-20 text-center"
          />

          <button
            className="btn btn-sm btn-outline btn-neutral"
            onClick={() => {
              light();
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
              light();
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
