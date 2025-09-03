import { useEffect, useState } from "react";
import { getUserByTelegramId, updateUser } from "../services/api";
import { tg } from "../services/telegram";
import EditModal from "../components/EditModal";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);

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

  const handleSave = async (field, newValue) => {
    if (!user) return;

    try {
      const updated = await updateUser(user.id, { ...user, [field]: newValue });
      setUser(updated);
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500">Загрузка...</div>;
  }

  if (!user) {
    return <div className="text-center text-gray-500">Нет данных о пользователе</div>;
  }

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-center text-lg font-semibold text-gray-800">Личные данные</h2>

      <div className="bg-white shadow-md rounded-2xl p-4">
        <ProfileField
          label="Имя"
          value={user.name}
          onClick={() => setEditingField("name")}
        />
        <ProfileField
          label="Номер телефона"
          value={user.phone_number}
          onClick={() => setEditingField("phone_number")}
        />
        <ProfileField
          label="Дата рождения"
          value={user.dob ? new Date(user.dob).toLocaleDateString("ru-RU") : ""}
          onClick={() => setEditingField("dob")}
        />
        <ProfileField
          label="E-mail"
          value={user.email}
          onClick={() => setEditingField("email")}
        />
      </div>

      <EditModal
        isOpen={!!editingField}
        onClose={() => setEditingField(null)}
        field={editingField}
        label={
          editingField === "name"
            ? "Имя"
            : editingField === "phone_number"
            ? "Номер телефона"
            : editingField === "dob"
            ? "Дата рождения"
            : "E-mail"
        }
        value={user?.[editingField]}
        onSave={handleSave}
      />
    </div>
  );
}

function ProfileField({ label, value, onClick }) {
  return (
    <div
      className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-gray-700">{label}</span>
      {value ? (
        <span className="flex items-center space-x-2">
          <span className="text-gray-900">{value}</span>
          <span className="text-blue-600 font-medium">Изменить</span>
        </span>
      ) : (
        <span className="text-blue-600 font-medium">Указать</span>
      )}
    </div>
  );
}
