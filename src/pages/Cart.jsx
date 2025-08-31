import { useCart } from "../context/CartContext";
import emptyCart from "../media/empty-cart.png"; // 👈 картинка (положи в src/media)

export default function Cart() {
  const { cart, removeFromCart, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-600">
        <img
          src={emptyCart}
          alt="Корзина пуста"
          className="w-48 h-48 object-contain mb-6 opacity-80"
        />
        <h2 className="text-xl font-semibold">Ваша корзина пуста</h2>
        <p className="text-sm mt-2">Добавьте товары, чтобы оформить заказ</p>
      </div>
    );
  }

  const total = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">🛒 Корзина</h1>
      <ul className="space-y-2">
        {cart.map((item, index) => (
          <li
            key={index}
            className="flex justify-between items-center border p-2 rounded"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                {item.quantity || 1} × {item.price} сум
              </p>
            </div>
            <button
              onClick={() => removeFromCart(item.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-between font-bold text-lg">
        <span>Итого:</span>
        <span>{total} сум</span>
      </div>

      <button
        onClick={clearCart}
        className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
      >
        ✅ Оформить заказ
      </button>
    </div>
  );
}
