import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";

import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import History from "./pages/History";

import { tg } from "./services/telegram";

// импортируем react-query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  const [activePage, setActivePage] = useState("catalog");
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState(null);
  const [headerPadding, setHeaderPadding] = useState("pt-40");

  useEffect(() => {
    tg.ready();
    tg.disableVerticalSwipes();

    if (tg.platform === "android" || tg.platform === "ios") {
      tg.expand();
      tg.requestFullscreen?.();
      setHeaderPadding("pt-40");
    } else {
      tg.exitFullscreen?.();
      setHeaderPadding("pt-0");
    }

    if (tg.initDataUnsafe?.user?.id) {
      setTelegramId(tg.initDataUnsafe.user.id);
    }

    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100 pb-24">
        <Header />

        <div className={`max-w-6xl mx-auto p-6 space-y-8 ${headerPadding}`}>
          {activePage === "catalog" && <Catalog />}
          {activePage === "cart" && <Cart />}
          {activePage === "profile" && <Profile />}
          {activePage === "history" && <History telegramId={telegramId} />}
        </div>
        <BottomNav active={activePage} setActive={setActivePage} />
      </div>
    </QueryClientProvider>
  );
}
