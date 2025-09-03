import { useEffect, useState } from "react";
import { getUserByTelegramId, updateUser } from "../services/api";
import { tg } from "../services/telegram";
import EditModal from "../components/EditModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, field: null, label: "", value: "" });

  useEffect(() => {
    async function fetchUser() {
      if (tg.initDataUnsafe?.user?.id) {
        const data = await getUserByTelegramId(tg.initDataUnsafe.user.id);
        setUser(data);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleEdit = (field, label, value) => {
    setModal({ open: true, field, label, value });
  };

  const handleSave = async (field, value) => {
    if (!user) return;
    const updated = await updateUser(user.telegram_id, { [field]: value });
    setUser(updated);
  };

  if (loading) {
    return <div className="text-center text-gray-500">Загрузка...</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-500">Нет данных о пользователе</div>;
  }

  return (
    <div className="flex flex-col space-y-4 bg-white shadow-md p-6 rounded-2xl">
      <h2 className="text-gray-800 text-xl font-semibold">Личные данные</h2>

      <div className="text-gray-700 space-y-2">
        <p
          className="cursor-pointer"
          onClick={() => handleEdit("name", "Имя", user.name)}
        >
          <span className="font-medium">Имя:</span> {user.name || "—"}
        </p>
        <p
          className="cursor-pointer"
          onClick={() => handleEdit("phone_number", "Телефон", user.phone_number)}
        >
          <span className="font-medium">Телефон:</span> {user.phone_number || "—"}
        </p>
        <p
          className="cursor-pointer"
          onClick={() => handleEdit("email", "Email", user.email)}
        >
          <span className="font-medium">Email:</span> {user.email || "—"}
        </p>
        <p
          className="cursor-pointer"
          onClick={() => handleEdit("dob", "Дата рождения", user.dob)}
        >
          <span className="font-medium">Дата рождения:</span> {user.birth_date || "—"}
        </p>
        <p
          className="cursor-pointer"
          onClick={() => handleEdit("lang", "Язык", user.lang)}
        >
          <span className="font-medium">Язык:</span> {user.lang?.toUpperCase() || "—"}
        </p>

        <p className="text-sm text-gray-500">
          Зарегистрирован: {new Date(user.created_at).toLocaleDateString("ru-RU")}
        </p>
      </div>

      <EditModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false })}
        field={modal.field}
        label={modal.label}
        value={modal.value}
        onSave={handleSave}
      />
    </div>
  );
}
