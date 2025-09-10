import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";

import CatalogWithProducts from "./pages/CatalogWithProducts";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import History from "./pages/History";

import { tg } from "./services/telegram";
import { getUserByTelegramId, updateUser } from "./services/api";
import EditModal from "./components/EditModal";
import { useHaptic } from "./hooks/useHaptic";
import { useToast } from "./hooks/useToast";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  const [activePage, setActivePage] = useState("catalog");
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState(null);
  const [user, setUser] = useState(null);
  const [editingPhone, setEditingPhone] = useState(false);

  const [headerPadding, setHeaderPadding] = useState("pt-40");
  const [headerSize, setHeaderSize] = useState("py-12");

  const haptic = useHaptic();
  const { showToast, Toast } = useToast();

  useEffect(() => {
    tg.ready();
    tg.disableVerticalSwipes();

    if (tg.platform === "android" || tg.platform === "ios") {
      tg.expand();
      tg.requestFullscreen?.();
      setHeaderPadding("pt-24");
      setHeaderSize("py-12");
    } else {
      tg.exitFullscreen?.();
      setHeaderPadding("pt-6");
      setHeaderSize("py-2");
    }

    if (tg.initDataUnsafe?.user?.id) {
      setTelegramId(tg.initDataUnsafe.user.id);
    }

    async function fetchUser() {
      if (tg.initDataUnsafe?.user?.id) {
        const data = await getUserByTelegramId(tg.initDataUnsafe.user.id);
        setUser(data);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleSavePhone = async (newValue) => {
  if (!user) return;
  const cleanValue = newValue.replace(/\D/g, "");

  haptic.light();
  try {
    const updated = await updateUser(user.id, { ...user, phone_number: cleanValue });
    setUser(updated);
    setEditingPhone(false); // 👉 сразу закрываем модалку
    haptic.success();
    showToast("Ваш номер успешно сохранён!");
  } catch (err) {
    console.error("Ошибка при сохранении номера:", err);
    haptic.error();
    showToast("❌ Ошибка при сохранении");
  }
};

  if (loading) return <SplashScreen />;

  if (user && !user.phone_number) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-100">
        <p className="text-gray-700 mb-4 font-medium">
          Пожалуйста, укажите номер телефона, чтобы пользоваться сервисом.
        </p>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-600 transition"
          onClick={() => setEditingPhone(true)}
        >
          Ввести номер
        </button>

        <EditModal
          isOpen={editingPhone}
          onClose={() => setEditingPhone(false)}
          field="phone_number"
          label="Номер телефона"
          value={user.phone_number}
          onSave={handleSavePhone}
        />

        <Toast />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 pb-24">
        <Header headerPadding={headerPadding} headerSize={headerSize} variant={activePage} />

        <div className={`max-w-6xl mx-auto p-6 space-y-8 ${headerPadding}`}>
          {activePage === "catalog" && <CatalogWithProducts />}
          {activePage === "cart" && <Cart />}
          {activePage === "profile" && <Profile />}
          {activePage === "history" && <History telegramId={telegramId} />}
        </div>

        <BottomNav active={activePage} setActive={setActivePage} />
        <Toast />
      </div>
    </QueryClientProvider>
  );
}
