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
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-700">
        <img
          src={emptyCart}
          alt="Корзина пуста"
          className="w-48 h-48 object-contain mb-6 opacity-80"
        />
        <h2 className="text-xl font-semibold text-gray-900">Ваша корзина пуста</h2>
        <p className="text-sm mt-2 text-gray-600">
          Добавьте товары, чтобы оформить заказ
        </p>
      </div>
    );
  }

  const total = cart.items.reduce(
    (sum, item) => sum + item.product.price * (item.quantity || 1),
    0
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4 font-bold text-gray-900">Корзина</h1>

      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li
            key={item.id}
            className="flex items-center gap-4 bg-white border rounded-xl p-3 shadow-sm"
          >
            {item.product.image && (
              <img
                src={item.product.image}
                alt={item.product.title}
                className="w-16 h-16 object-cover rounded-lg border"
              />
            )}

            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.product.title}</p>
              <p className="text-sm text-gray-700">
                {item.quantity || 1} шт × {item.product.price.toLocaleString()} сум
              </p>
            </div>

            <div className="flex items-center gap-3">
              <p className="font-bold text-green-600 whitespace-nowrap">
                {(item.quantity * item.product.price).toLocaleString()} сум
              </p>
              <button
                onClick={() => {
                  tap();
                  removeFromCart(item.id);
                }}
                className="p-2 rounded-full hover:bg-red-100 transition"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between font-bold text-lg text-gray-900 bg-gray-100 rounded-xl p-3">
        <span>Итого:</span>
        <span>{total.toLocaleString()} сум</span>
      </div>

      <button
        onClick={async () => {
          tap();
          await checkout();
        }}
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
      >
        Оформить заказ
      </button>
    </div>
  );
}
