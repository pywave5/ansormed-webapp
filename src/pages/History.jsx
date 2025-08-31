import { useEffect, useState } from "react";
import { getMyOrders } from "../services/api";

export default function History({ telegramId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!telegramId) return;
    getMyOrders(telegramId)
      .then((data) => setOrders(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [telegramId]);

  if (loading) return <p className="text-gray-600">Загрузка...</p>;
  if (error) return <p className="text-red-500">Ошибка: {error}</p>;
  if (!orders.length) return <p className="text-gray-700">У вас пока нет заказов.</p>;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h2 className="text-xl font-bold text-gray-900 mb-4">История заказов</h2>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white shadow rounded-lg p-4 border border-gray-200"
          >
            <p className="text-gray-900 font-semibold">
              Заказ №{order.id}
            </p>
            <p className="text-gray-700">
              Сумма: <span className="font-medium">{order.total_cost} UZS</span>
            </p>
            <p className="text-gray-600">
              Статус:{" "}
              <span
                className={
                  order.status === "success"
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                {order.status}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
