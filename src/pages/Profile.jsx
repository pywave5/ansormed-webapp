import { useEffect, useState } from "react";
import { tg } from "../services/telegram";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);

  if (!user) {
    return (
      <div className="text-center text-gray-500">
        Нет данных о пользователе
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Аватар */}
      {user.photo_url && (
        <img
          src={user.photo_url}
          alt="avatar"
          className="w-24 h-24 rounded-full shadow-md"
        />
      )}

      {/* Имя */}
      <h2 className="text-xl font-semibold">
        {user.first_name} {user.last_name || ""}
      </h2>

      {/* username */}
      {user.username && (
        <p className="text-gray-600">@{user.username}</p>
      )}

      {/* ID */}
      <p className="text-sm text-gray-400">ID: {user.id}</p>
    </div>
  );
}
