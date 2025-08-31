import { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import SplashScreen from "./components/SplashScreen";

import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";

import { tg } from "./services/telegram";
import useHaptic from "./hooks/useHaptic"; // <-- подключаем наш хук

tg.ready();

export default function App() {
  const [activePage, setActivePage] = useState("catalog");
  const [loading, setLoading] = useState(true);

  const { impact } = useHaptic(); // получаем вибрацию

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // реагируем на смену страницы
  useEffect(() => {
    impact("light"); // лёгкая вибрация при переходе
  }, [activePage]);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <Header />
      
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {activePage === "catalog" && <Catalog />}
        {activePage === "cart" && <Cart />}
        {activePage === "profile" && <Profile />}
      </div>

      <BottomNav active={activePage} setActive={setActivePage} />
    </div>
  );
}