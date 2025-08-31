import { useEffect, useState } from "react";
import { getMyOrders } from "../services/api";

export default function History({ telegramId }) {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
              onClick={() => setSelectedOrder(order)}
              className="bg-white text-black rounded-xl shadow-md p-4 cursor-pointer hover:bg-gray-100 transition"
            >
              <p className="font-semibold">Заказ №{order.id}</p>
              <p className="text-sm text-gray-600">
                Дата: {formatDate(order.created_at)}
              </p>
              <p className="text-green-600 font-bold">
                Сумма: {formatPrice(order.total_cost)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Модалка с деталями */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white text-black rounded-xl p-6 w-96 shadow-lg">
            <h3 className="text-lg font-bold mb-3">
              Детали заказа №{selectedOrder.id}
            </h3>
            <p>{formatDate(selectedOrder.created_at)}</p>
            <p>{formatPrice(selectedOrder.total_cost)}</p>
            <p className="text-gray-600 mt-2">
              Статус:{" "}
              <span className="font-semibold">{selectedOrder.status}</span>
            </p>
            {/* Здесь можно вывести товары */}
            {selectedOrder.items && (
              <ul className="mt-3 space-y-1">
                {selectedOrder.items.map((item) => (
                  <li key={item.id}>
                    {item.name} × {item.quantity}
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={() => setSelectedOrder(null)}
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
