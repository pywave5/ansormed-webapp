import { useState } from "react";
import { Search } from "lucide-react";

export default function Header({ onSearch, safeTop = 0 }) {
  return (
    <header
      className="w-full bg-blue-600 shadow-md"
      style={{
        paddingTop: safeTop + 8, // ⚡️ safeTop чтобы отступить от системного хедера
      }}
    >
      <div className="px-4 pb-3">
        {/* Лого */}
        <span className="text-white font-bold text-xl">ansormed</span>

        {/* Поиск */}
        <div className="relative mt-3">
          <input
            type="text"
            placeholder="Поиск..."
            className="w-full bg-white text-black rounded-full pl-10 pr-4 py-2 
                       shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <svg
            className="absolute left-3 top-2.5 text-gray-500 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </header>
  );
}