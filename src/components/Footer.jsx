export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t fixed bottom-0 left-0 w-full">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} AnsorMed. Все права защищены.</p>
        <div className="flex gap-4 mt-3 sm:mt-0">
        </div>
      </div>
    </footer>
  );
}
