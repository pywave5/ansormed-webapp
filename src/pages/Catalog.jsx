import { useState, useEffect } from "react";
import Categories from "./Categories";
import Products from "./Products";
import AdsCarousel from "../components/AdsCarousel";
import { searchProducts, getCategories } from "../services/api";

export default function Catalog() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchResults, setSearchResults] = useState(null);

  useEffect(() => {
    getCategories()
      .then((data) => {
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      })
      .catch((err) => console.error("Ошибка категорий:", err));
  }, []);

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
      {searchResults ? (
        <Products categoryId={null} productsOverride={searchResults} />
      ) : (
        <>
          <Categories
            onSelect={setSelectedCategory}
            selectedId={selectedCategory}
          />

          <AdsCarousel />

          {selectedCategory && (
            <Products categoryId={selectedCategory} />
          )}
        </>
      )}
    </div>
  );
}
