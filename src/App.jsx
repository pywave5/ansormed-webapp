import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";

import Catalog from "../pages/Catalog";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import History from "./pages/History";

import { tg } from "./services/telegram";
import { getUserByTelegramId, updateUser } from "./services/api";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  const [activePage, setActivePage] = useState("catalog");
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState(null);
  const [headerPadding, setHeaderPadding] = useState("pt-40");
  const [headerSize, setHeaderSize] = useState("py-12");
  const [user, setUser] = useState(null);
  const [needPhone, setNeedPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");

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
      const tId = tg.initDataUnsafe.user.id;
      setTelegramId(tId);

      getUserByTelegramId(tId).then((u) => {
        setUser(u);
        if (!u.phone_number) {
          setNeedPhone(true);
        }
      });
    }

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSavePhone = async () => {
    if (!phoneInput.trim()) return;
    try {
      const updated = await updateUser(user.id, { phone_number: phoneInput.replace(/\D/g, "") });
      setUser(updated);
      setNeedPhone(false);
    } catch (err) {
      console.error("Ошибка при сохранении номера:", err);
    }
  };

  if (loading) return <SplashScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 pb-24">
        <Header headerPadding={headerPadding} headerSize={headerSize} variant={activePage} />

        <div className={`max-w-6xl mx-auto p-6 space-y-8 ${headerPadding}`}>
          {/* 👉 если номер не указан, показываем заглушку */}
          {needPhone ? (
            <div className="bg-white shadow-md rounded-xl p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Введите номер телефона, чтобы пользоваться приложением
              </h2>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="+998 XX XXX XX XX"
                className="w-full border rounded-lg p-2 text-center mb-4"
              />
              <button
                onClick={handleSavePhone}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
              >
                Сохранить
              </button>
            </div>
          ) : (
            <>
              {activePage === "catalog" && <Catalog />}
              {activePage === "cart" && <Cart />}
              {activePage === "profile" && <Profile />}
              {activePage === "history" && <History telegramId={telegramId} />}
            </>
          )}
        </div>

        <BottomNav active={activePage} setActive={setActivePage} />
      </div>
    </QueryClientProvider>
  );
}
