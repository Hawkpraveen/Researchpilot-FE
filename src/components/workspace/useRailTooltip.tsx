import { useEffect, useId, useState } from "react";
import type { FocusEvent, MouseEvent } from "react";
import { createPortal } from "react-dom";

export function useRailTooltip(expanded: boolean) {
  const id = useId();
  const [hint, setHint] = useState<{ label: string; left: number; top: number } | null>(null);
  const hide = () => setHint(null);

  useEffect(() => {
    if (!hint) return;
    const dismiss = () => setHint(null);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") dismiss(); };
    window.addEventListener("resize", dismiss);
    window.addEventListener("scroll", dismiss, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("resize", dismiss);
      window.removeEventListener("scroll", dismiss, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [hint]);

  const hintProps = (label: string) => {
    const show = (event: MouseEvent<HTMLButtonElement> | FocusEvent<HTMLButtonElement>) => {
      if (expanded) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      setHint({ label, left: Math.max(8, Math.min(bounds.right + 10, window.innerWidth - 228)), top: Math.max(28, Math.min(bounds.top + bounds.height / 2, window.innerHeight - 28)) });
    };
    return {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: show,
      onBlur: hide,
      "aria-describedby": !expanded && hint?.label === label ? id : undefined,
    };
  };

  const tooltip = hint && !expanded ? createPortal(
    <div id={id} role="tooltip" className="global-rail-tooltip" style={{ left: hint.left, top: hint.top }}>{hint.label}</div>,
    document.body,
  ) : null;

  return { hintProps, hideTooltip: hide, tooltip };
}
