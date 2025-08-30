import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";

import Catalog from "./pages/Catalog";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";

import { tg } from "./services/telegram";

tg.ready();

export default function App() {
  const [activePage, setActivePage] = useState("catalog");

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
