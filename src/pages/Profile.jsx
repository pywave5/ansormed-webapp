import { useState } from "react";
import { updateUser } from "../services/api";
import EditModal from "../components/EditModal";
import { UserX } from "lucide-react";
import { useHaptic } from "../hooks/useHaptic";
import { useToast } from "../hooks/useToast";

export default function Profile({ user, setUser }) {
  const [editingField, setEditingField] = useState(null);
  const haptic = useHaptic();
  const { showToast, Toast } = useToast();

  const formatPhone = (val) => {
    if (!val) return "";
    val = val.replace(/\D/g, "");
    if (!val.startsWith("998")) {
      if (val.startsWith("8")) {
        val = "998" + val.slice(1);
      } else {
        val = "998" + val;
      }
    }
    if (val.length > 12) val = val.slice(0, 12);

    let formatted = "+998";
    if (val.length > 3) formatted += " " + val.slice(3, 5);
    if (val.length > 5) formatted += " " + val.slice(5, 8);
    if (val.length > 8) formatted += " " + val.slice(8, 10);
    if (val.length > 10) formatted += " " + val.slice(10, 12);

    return formatted;
  };

  const handleSave = async (field, newValue) => {
    if (!user) return;

    let cleanValue = newValue;
    if (field === "phone_number") {
      cleanValue = newValue.replace(/\D/g, "");
    }
    if (field === "birth_date") {
      const parts = newValue.split(".");
      if (parts.length === 3) {
        const [dd, mm, yyyy] = parts;
        cleanValue = `${yyyy}-${mm}-${dd}`;
      }
    }

    haptic.light();

    try {
      const updated = await updateUser(user.id, { ...user, [field]: cleanValue });
      setUser(updated);

      haptic.success();
      showToast("Ваши данные успешно изменены.", "success");
    } catch (err) {
      console.error("Ошибка при обновлении:", err);
      haptic.error();
      showToast("Ошибка при сохранении", "error");
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-500 py-10">
        <UserX className="w-12 h-12 mb-3 text-gray-400" />
        <span className="text-center">Нет данных о пользователе</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-center text-lg font-semibold text-gray-800">Личные данные</h2>

      <div className="bg-white shadow-md rounded-2xl p-4">
        <ProfileField label="Имя" value={user.name} onClick={() => setEditingField("name")} />
        <ProfileField
          label="Номер телефона"
          value={formatPhone(user.phone_number)}
          onClick={() => setEditingField("phone_number")}
        />
        <ProfileField
          label="Дата рождения"
          value={user.birth_date ? new Date(user.birth_date).toLocaleDateString("ru-RU") : ""}
          onClick={() => setEditingField("birth_date")}
        />
        <ProfileField label="E-mail" value={user.email} onClick={() => setEditingField("email")} />
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
            : editingField === "birth_date"
            ? "Дата рождения"
            : "E-mail"
        }
        value={user?.[editingField]}
        onSave={handleSave}
      />
      <Toast />
    </div>
  );
}

function ProfileField({ label, value, onClick }) {
  const haptic = useHaptic();

  return (
    <div
      className="flex justify-between items-center py-3 border-b border-gray-200 cursor-pointer"
      onClick={() => {
        haptic.light();
        onClick();
      }}
    >
      <span className="text-gray-700">{label}</span>
      {value ? (
        <span className="text-gray-900">{value}</span>
      ) : (
        <span className="text-blue-600 font-medium">Указать</span>
      )}
    </div>
  );
}
