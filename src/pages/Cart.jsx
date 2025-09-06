import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import emptyCart from "../media/empty-cart.png";
import { useHaptic } from "../hooks/useHaptic";

export default function Cart() {
  const { cart, removeFromCart, clearCart, checkout, loading } = useCart();
  const { tap } = useHaptic();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-gray-700">
        <p className="text-lg font-semibold">Загрузка корзины...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-700 p-4">
        <img
          src={emptyCart}
          alt="Корзина пуста"
          className="w-40 h-40 object-contain mb-6 opacity-80"
        />
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
          Ваша корзина пуста
        </h2>
        <p className="text-sm mt-2 text-gray-600 text-center">
          Добавьте товары, чтобы оформить заказ
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-xl sm:text-2xl mb-4 font-bold text-gray-900">Корзина</h1>

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-3 bg-white border rounded-xl p-3 shadow-sm"
          >
            {item.product.image && (
              <img
                src={item.product.image}
                alt={item.product.title}
                className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-lg border flex-shrink-0"
              />
            )}

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                {item.product.title}
              </p>
              <p className="text-xs sm:text-sm text-gray-700">
                {item.quantity || 1} шт ×{" "}
                {item.product.final_price.toLocaleString()} сум
                {item.product.discount > 0 && (
                  <span className="line-through ml-2 text-gray-400">
                    {item.product.price.toLocaleString()} сум
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:gap-3 flex-shrink-0">
              <p className="font-bold text-green-600 text-sm sm:text-base whitespace-nowrap">
                {item.total_price.toLocaleString()} сум
              </p>
              <button
                onClick={() => {
                  tap();
                  removeFromCart(item.id);
                }}
                className="p-2 rounded-full hover:bg-red-100 transition flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between font-bold text-base sm:text-lg text-gray-900 bg-gray-100 rounded-xl p-3">
        <span>Итого:</span>
        <span>{cart.total_cost.toLocaleString()} сум</span>
      </div>

      <button
        onClick={async () => {
          tap();
          await checkout();
        }}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition text-sm sm:text-base"
      >
        Оформить заказ
      </button>
    </div>
  );
}
