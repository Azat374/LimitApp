import { useEffect, useState } from "react";
import { toast } from "sonner"; // или любая другая библиотека уведомлений

export default function useProctoring(onViolationLimitReached: () => void, maxViolations = 3) {
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        incrementViolation("Вы переключились с вкладки");
      }
    };

    const handleBlur = () => {
      incrementViolation("Окно потеряло фокус");
    };

    const incrementViolation = (reason: string) => {
      setViolationCount((prev) => {
        const next = prev + 1;

        if (next < maxViolations) {
          toast.warning(`Прокторинг: ${reason}. Это нарушение ${next} из ${maxViolations}`);
        } else if (next === maxViolations) {
          toast.error(`Прокторинг: ${reason}. Это 3-е нарушение — решение заблокировано.`);
          onViolationLimitReached();
        }

        return next;
      });
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [onViolationLimitReached, maxViolations]);

  return violationCount;
}
