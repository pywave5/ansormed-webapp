import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";

import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import History from "./pages/History";

import { tg } from "./services/telegram";
import { CartProvider } from "./context/CartContext";

export default function App() {
  const [activePage, setActivePage] = useState("catalog");
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState(null);

  useEffect(() => {
    tg.ready();
    tg.disableVerticalSwipes();

    if (tg.platform === "android" || tg.platform === "ios") {
      tg.expand();
      tg.requestFullscreen?.();
    } else {
      tg.exitFullscreen?.();
    }

    if (tg.initDataUnsafe?.user?.id) {
      setTelegramId(tg.initDataUnsafe.user.id);
    }

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <CartProvider
      telegramId={telegramId}
      username={tg.initDataUnsafe?.user?.username}
      phoneNumber={tg.initDataUnsafe?.user?.phone}
      customerName={tg.initDataUnsafe?.user?.first_name}
    >
      <div className="min-h-screen bg-gray-100 pb-24">
        <header className="w-full fixed top-0 left-0 z-50 shadow-md bg-white">
          <Header />
        </header>
        <main className="max-w-6xl mx-auto p-6 pt-24 space-y-8">
          {activePage === "catalog" && <Catalog />}
          {activePage === "cart" && <Cart />}
          {activePage === "profile" && <Profile />}
          {activePage === "history" && <History telegramId={telegramId} />}
        </main>

        {/* Нижняя навигация */}
        <BottomNav active={activePage} setActive={setActivePage} />
      </div>
    </CartProvider>
  );
}
