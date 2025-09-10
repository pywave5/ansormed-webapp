import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";

import CatalogWithProducts from "./pages/CatalogWithProducts";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import History from "./pages/History";

import { tg } from "./services/telegram";
import { authWithTelegram , updateUser } from "./services/api";
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
  const debugDiv = document.createElement("div");
  debugDiv.style.position = "fixed";
  debugDiv.style.bottom = "10px";
  debugDiv.style.left = "10px";
  debugDiv.style.zIndex = "9999";
  debugDiv.style.background = "rgba(0,0,0,0.7)";
  debugDiv.style.color = "white";
  debugDiv.style.padding = "8px";
  debugDiv.style.borderRadius = "8px";
  debugDiv.innerText = "initData: " + (tg.initData || "EMPTY") +
    "\nuser.id: " + (tg.initDataUnsafe?.user?.id || "NONE");
  document.body.appendChild(debugDiv);
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
    try {
      if (tg.initData && tg.initData.length > 0) {
        // ⚡️ Реальный сценарий
        const data = await authWithTelegram(tg.initData);
        setUser(data);
      } else {
        // 🧪 Тестовый режим (браузер)
        const fakeUser = {
          id: 1,
          name: "Тестовый Пользователь",
          phone_number: null,
          email: "test@example.com",
          birth_date: "2000-01-01",
        };
        setUser(fakeUser);
      }
    } catch (err) {
      // ❌ Ошибку показываем прямо в UI
      setUser(null);
      alert("Ошибка авторизации: " + JSON.stringify(err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  }

  fetchUser()
  }, []);

  const handleSavePhone = async (arg1, arg2) => {
    const newValue = typeof arg2 !== "undefined" ? arg2 : arg1;

    if (!user) return;

    const cleanValue = String(newValue || "").replace(/\D/g, "");

    if (!cleanValue) {
      showToast("Введите корректный номер!", "error");
      haptic.error();
      return;
    }

    try {
      const updated = await updateUser(user.id, { phone_number: cleanValue });

      setUser(updated);
      setEditingPhone(false);
      haptic.success();
      showToast("Ваш номер успешно сохранён!", "success");
    } catch (err) {
      console.error("Ошибка при сохранении номера:", err);
      haptic.error();
      showToast("Ошибка при сохранении", "error");
    }
  };


  if (loading) return <SplashScreen />;

  if (user && !user.phone_number) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-100">
        <Header headerPadding={headerPadding} headerSize={headerSize} variant="profile" />
        <p className="text-gray-700 mb-4 font-medium">
          Пожалуйста, укажите номер телефона, чтобы пользоваться сервисом.
        </p>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-600 transition"
          onClick={() => {
            haptic.light();
            setEditingPhone(true);
          }}
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
          {activePage === "profile" && <Profile user={user} setUser={setUser} />}
          {activePage === "history" && <History telegramId={telegramId} />}
        </div>

        <BottomNav active={activePage} setActive={setActivePage} />
        <Toast />
      </div>
    </QueryClientProvider>
  );
}
