import { useState } from "react";
import { Search } from "lucide-react"; // 👈 иконка лупы
import logo from "../media/logo.png";

export default function Header({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Лого */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Поиск */}
        <form 
          onSubmit={handleSubmit} 
          className="flex-1 max-w-md ml-6 relative"
        >
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-full pl-10 pr-4 py-2 
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </form>
      </div>
    </header>
  );
}
