import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, duration = 2000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const Toast = () =>
    toast ? (
      <div className="fixed bottom-20 inset-x-0 flex justify-center z-50">
        <div className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-full shadow-lg">
          <span className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
            ✅
          </span>
          <span>{toast}</span>
        </div>
      </div>
    ) : null;

  return { showToast, Toast };
}
