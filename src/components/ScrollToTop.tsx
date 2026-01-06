import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Composant central pour remonter en haut de page
 * à chaque changement de route (react-router).
 * Doit être placé à l'intérieur du BrowserRouter.
 */
const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Force scroll to top on any route change (including query params)
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search]);

  return null;
};

export default ScrollToTop;
