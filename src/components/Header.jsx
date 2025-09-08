import { useState } from "react";
import { Search } from "lucide-react";

export default function Header({ onSearch, safeTop }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header
      className="bg-blue-600 fixed top-0 pt-24 left-0 w-full z-40 shadow-md"
      style={{
        height: `${safeTop + 64}px`
      }}
    >
      <div
        className="max-w-6xl mx-auto flex items-center justify-between px-4"
        style={{
          paddingTop: `${safeTop}px`, // ✅ контент ниже кнопок
          height: "64px",
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-wide">
            ansormed
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 max-w-md ml-6 relative"
        >
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white text-black placeholder-gray-500 rounded-full pl-10 pr-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300 border border-gray-300"
          />
        </form>
      </div>
    </header>
  );
}
