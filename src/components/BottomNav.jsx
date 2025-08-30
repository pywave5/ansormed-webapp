import { ShoppingCart, User, Grid } from "lucide-react";

export default function BottomNav({ active, setActive }) {
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
        className={`flex flex-col items-center ${
          active === "cart" ? "text-blue-600" : "text-gray-500"
        }`}
      >
        <ShoppingCart size={24} />
        <span className="text-xs">Корзина</span>
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
