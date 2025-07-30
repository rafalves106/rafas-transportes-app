import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { clearTimeout } from "timers";

const INACTIVITY_TIMEOUT = 6 * 60 * 60 * 1000;

export const useInactivityLogout = () => {
  const navigate = useNavigate();
  const timeoutRef = useRef<number | null>(null);

  const logout = useCallback(() => {
    console.log(
      "Inatividade detectada (3 horas). Deslogando automaticamente..."
    );

    localStorage.removeItem("jwtToken");
    sessionStorage.removeItem("jwtToken");

    navigate("/login");
  }, [navigate]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(logout, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    resetTimer();

    const events = ["mousemove", "keypress", "click", "scroll", "touchstart"];

    events.forEach((event) => window.removeEventListener(event, resetTimer));

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [resetTimer]);
};
