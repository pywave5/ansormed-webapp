import { useState } from "react";
import Categories from "./Categories";
import Products from "./Products";
import { searchProducts } from "../services/api";

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
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
    <div>
      {/* если есть поиск — показываем только результаты */}
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
  );
}
