import { useState } from "react";
import { Search } from "lucide-react";

export default function Header({ onSearch }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <header className="bg-blue-600 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center px-4 py-2 gap-3">
        <span className="text-white font-bold text-lg tracking-wide">
          ansormed
        </span>
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 text-gray-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white text-black placeholder-gray-500 
                       rounded-full pl-10 pr-4 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-300
                       border border-gray-200"
          />
        </form>
      </div>
    </header>
  );
}
