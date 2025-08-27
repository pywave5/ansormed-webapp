export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t mt-10">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} AnsorMed. Все права защищены.</p>
        <div className="flex gap-4 mt-3 sm:mt-0">
          <a href="#" className="hover:text-gray-700 transition">
            Политика конфиденциальности
          </a>
          <a href="#" className="hover:text-gray-700 transition">
            Контакты
          </a>
        </div>
      </div>
    </footer>
  );
}
