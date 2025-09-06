import { useState } from "react";
import AdsCarousel from "../components/AdsCarousel";
import { searchProducts } from "../services/api";
import CatalogWithProducts from "./CatalogWithProducts";

export default function Catalog() {
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
      {searchResults ? (
        <CatalogWithProducts productsOverride={searchResults} />
      ) : (
        <>
          <AdsCarousel />
          <CatalogWithProducts />
        </>
      )}
    </div>
  );
}
