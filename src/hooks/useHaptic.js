export function useHaptic() {
  const haptic = (type = "light") => {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      if (type === "success") {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("success");
      } else if (type === "warning") {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("warning");
      } else if (type === "error") {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred("error");
      } else {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
      }
    } else if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  return {
    light: () => haptic("light"),
    medium: () => haptic("medium"),
    heavy: () => haptic("heavy"),
    success: () => haptic("success"),
    warning: () => haptic("warning"),
    error: () => haptic("error"),
    tap: () => haptic("light"),
  };
}
