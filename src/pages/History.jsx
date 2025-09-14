import { useEffect, useState } from "react";
import { getMyOrders } from "../services/api";
import { useHaptic } from "../hooks/useHaptic";

export default function History({ telegramId }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { tap } = useHaptic();

  useEffect(() => {
    if (telegramId) {
      getMyOrders(telegramId)
        .then(setOrders)
        .catch((err) => console.error("Ошибка загрузки заказов:", err));
    }
  }, [telegramId]);

  const formatPrice = (price) =>
    new Intl.NumberFormat("ru-RU").format(price) + " сум";

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-4">
      <h2 className="text-gray-800 text-xl font-bold mb-4">История заказов</h2>
      {orders.length === 0 ? (
        <p className="text-gray-400">У вас пока нет заказов.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              onClick={() => {
                tap();
                setSelectedOrder(order);
              }}
              className="bg-white text-black rounded-xl shadow-md p-4 cursor-pointer hover:bg-gray-100 transition"
            >
              <p className="font-semibold">Заказ №{order.id}</p>
              <p className="text-sm text-gray-600">
                Дата: {formatDate(order.created_at)}
              </p>
              <p className="text-green-600 font-bold">
                Сумма: {formatPrice(order.total_cost)}
              </p>
              <p className="text-gray-500 text-sm">Статус: {order.status}</p>
            </div>
          ))}
        </div>
      )}

     {/* Модалка с деталями */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)} // клик по внешке
        >
          <div
            className="bg-white text-black rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto shadow-lg"
            onClick={(e) => e.stopPropagation()} // блокируем закрытие при клике внутри
          >
            <h3 className="text-lg font-bold mb-3">
              Заказ №{selectedOrder.id}
            </h3>
            <p className="text-gray-600">
              {formatDate(selectedOrder.created_at)}
            </p>
            <p className="text-gray-600">Статус: {selectedOrder.status}</p>
            <p className="text-green-600 font-bold mt-2">
              {formatPrice(selectedOrder.total_cost)}
            </p>

            {/* Список товаров */}
            {selectedOrder.items && selectedOrder.items.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {selectedOrder.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 border-b pb-2"
                  >
                    {item.product?.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-12 h-12 object-contain rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{item.product.title}</p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.product.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      {formatPrice(item.total_price)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 mt-3">Товары отсутствуют</p>
            )}

            <button
              onClick={() => {
                tap();
                setSelectedOrder(null);
              }}
              className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
