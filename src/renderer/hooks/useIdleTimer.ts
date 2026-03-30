import { useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';

export function useIdleTimer() {
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useAppStore((s) => s.settings);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeout = parseInt(settings.idle_timeout || '120', 10) * 1000;

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (location.pathname === '/' || location.pathname.startsWith('/admin')) return;
    timerRef.current = setTimeout(() => { navigate('/'); }, timeout);
  }, [timeout, location.pathname, navigate]);

  useEffect(() => {
    const events = ['touchstart', 'mousedown', 'mousemove', 'keydown'];
    events.forEach((e) => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [resetTimer]);
}
