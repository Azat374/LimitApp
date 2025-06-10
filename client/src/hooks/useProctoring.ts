import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

export default function useProctoring(
  onViolationLimitReached: () => void,
  maxViolations = 3
) {
  const [violationCount, setViolationCount] = useState(0);

  const incrementViolation = useCallback((reason: string) => {
    setViolationCount((prev) => {
      const next = prev + 1;

      if (next < maxViolations) {
        toast.warning(`Прокторинг: ${reason}. Бұл бұзу ${next/2 }/${maxViolations-2}.`);
      } else if (next === maxViolations) {
        toast.error(`Прокторинг: ${reason}. Бұл үшінші бұзу – шешім бұғатталды.`);
        onViolationLimitReached();
      }

      return next;
    });
  }, [onViolationLimitReached, maxViolations]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        incrementViolation("Сіз қойындыны ауыстырдыңыз");
      }
    };

    const handleBlur = () => {
      incrementViolation("Терезенің фокусы жоғалды");
    };

    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [incrementViolation]);

  return violationCount;
}
