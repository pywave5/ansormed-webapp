import { ShoppingCart, User, Grid, Clock } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useHaptic } from "../hooks/useHaptic";

export default function BottomNav({ active, setActive }) {
  const { cart } = useCart() || {};
  const { tap } = useHaptic();

  // защитно: если корзины еще нет, считаем totalCount = 0
  const totalCount = (cart?.items || []).reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  const handleClick = (menu) => {
    tap(); // вибрация при переходе
    setActive(menu);
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t flex justify-around py-2">
      {/* Каталог */}
      <button
        onClick={() => handleClick("catalog")}
        className={`flex flex-col items-center ${
          active === "catalog" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <Grid size={24} />
        <span className="text-xs mt-1">Каталог</span>
      </button>

      {/* Корзина */}
      <button
        onClick={() => handleClick("cart")}
        className={`relative flex flex-col items-center ${
          active === "cart" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <ShoppingCart size={24} />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
            {totalCount}
          </span>
        )}
        <span className="text-xs mt-1">Корзина</span>
      </button>

      {/* История */}
      <button
        onClick={() => handleClick("history")}
        className={`flex flex-col items-center ${
          active === "history" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <Clock size={24} />
        <span className="text-xs mt-1">История</span>
      </button>

      {/* Профиль */}
      <button
        onClick={() => handleClick("profile")}
        className={`flex flex-col items-center ${
          active === "profile" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <User size={24} />
        <span className="text-xs mt-1">Профиль</span>
      </button>
    </nav>
  );
}
