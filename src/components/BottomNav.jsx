import { ShoppingCart, User, Grid } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function BottomNav({ active, setActive }) {
  const { cart } = useCart();
  const totalCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white shadow-md border-t flex justify-around py-2">
      <button
        onClick={() => setActive("catalog")}
        className={`flex flex-col items-center ${
          active === "catalog" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <Grid size={24} />
        <span className="text-xs">Каталог</span>
      </button>

      <button
        onClick={() => setActive("cart")}
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

      <button
        onClick={() => setActive("profile")}
        className={`flex flex-col items-center ${
          active === "profile" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <User size={24} />
        <span className="text-xs">Профиль</span>
      </button>
    </nav>
  );
}
