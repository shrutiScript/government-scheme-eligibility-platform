import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

const LenisContext = createContext(null);

export const useLenis = () => useContext(LenisContext);

export function SmoothScroll({ children }) {
  const lenisRef = useRef(null);
  const rafRef   = useRef(null);
  const [lenis, setLenis] = useState(null);
  const location = useLocation();

  // Disable Lenis on admin routes — admin uses overflow-y-auto inner containers.
  // Lenis captures ALL wheel events on window, which starves inner divs.
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    // ── ADMIN: kill Lenis, restore native scroll ──────────────────────────
    if (isAdminRoute) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
        setLenis(null);
      }
      // Remove any overflow lock Lenis may have left on html/body
      document.documentElement.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow');
      return;
    }

    // ── PUBLIC ROUTES: boot Lenis smooth scroll ──────────────────────────
    const instance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      // Lenis scrolls the window (document.documentElement) by default
      // which is exactly what Framer Motion's useScroll also watches
    });

    lenisRef.current = instance;
    setLenis(instance);

    // Drive Lenis AND fire a synthetic scroll event each frame so that
    // Framer Motion's useScroll / useScrollYProgress stay in sync with
    // Lenis's virtual scroll position across ALL sections of the page.
    function raf(time) {
      instance.raf(time);

      // Notify Framer Motion & any other window.scroll listeners of the
      // current virtual position so sticky panels animate globally
      window.dispatchEvent(new Event('scroll', { bubbles: false }));

      rafRef.current = requestAnimationFrame(raf);
    }
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      instance.destroy();
      lenisRef.current = null;
      setLenis(null);
    };
  }, [isAdminRoute]);

  return (
    <LenisContext.Provider value={lenis}>
      {children}
    </LenisContext.Provider>
  );
}

export default SmoothScroll;
