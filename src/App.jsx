import { useState } from "react";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { searchProducts } from "./services/api";
import { tg } from "./services/telegram";

tg.ready();

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null); // очистим результаты, если пусто
      return;
    }
    try {
      const data = await searchProducts(query);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Ошибка поиска:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onSearch={handleSearch} />
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Если идёт поиск — показываем его */}
        {searchResults ? (
          <Products categoryId={null} productsOverride={searchResults} />
        ) : (
          <>
            <Categories 
              onSelect={setSelectedCategory} 
              selectedId={selectedCategory} 
            />
            <Products categoryId={selectedCategory} />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}
