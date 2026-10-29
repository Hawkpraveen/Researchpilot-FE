import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const switching = useRef(false);
  const cleanup = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => () => cleanup.current?.(), []);

  const toggleTheme = () => {
    if (switching.current) return;
    const root = document.documentElement;
    const applyTheme = () => {
      flushSync(() => setTheme((current) => current === "light" ? "dark" : "light"));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      applyTheme();
      return;
    }

    switching.current = true;
    const finish = () => {
      delete root.dataset.themeTransition;
      switching.current = false;
      cleanup.current = undefined;
    };
    if (document.startViewTransition) {
      // Crossfade the whole page so gradients and embedded controls do not flash.
      root.dataset.themeTransition = "crossfade";
      const transition = document.startViewTransition(applyTheme);
      cleanup.current = () => { transition.skipTransition(); finish(); };
      void transition.finished.catch(() => undefined).finally(finish);
    } else {
      root.dataset.themeTransition = "colors";
      // Commit the transition styles before switching the theme classes.
      void root.offsetWidth;
      applyTheme();
      const timer = window.setTimeout(finish, 750);
      cleanup.current = () => { window.clearTimeout(timer); finish(); };
    }
  };

  return { theme, toggleTheme };
}
