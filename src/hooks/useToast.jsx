import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", duration = 2000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
  };

  const Toast = () => (
    <AnimatePresence>
      {toast && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 inset-x-0 flex justify-center z-50"
        >
          <div className="flex items-center gap-2 bg-gray-900 text-white text-sm px-4 py-3 rounded-full shadow-lg">
            {icons[toast.type] || icons.success}
            <span>{toast.message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { showToast, Toast };
}
