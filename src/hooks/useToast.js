import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, duration = 2000) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  };

  const Toast = () =>
    toast ? (
      <div className="fixed bottom-6 inset-x-0 flex justify-center z-50">
        <div className="bg-gray-900 text-white text-sm px-4 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      </div>
    ) : null;

  return { showToast, Toast };
}
