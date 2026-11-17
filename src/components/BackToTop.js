"use client";

import { useEffect, useState } from "react";

function scrollY() {
  // The theme sets html/body height:100%, so BODY can own the scroll box.
  return Math.max(
    window.scrollY || 0,
    document.documentElement.scrollTop || 0,
    document.body.scrollTop || 0,
    document.scrollingElement?.scrollTop || 0,
  );
}

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sync = () => setVisible(scrollY() > (window.innerHeight || 600));
    window.addEventListener("scroll", sync, { passive: true });
    document.addEventListener("scroll", sync, { passive: true, capture: true });
    window.addEventListener("resize", sync, { passive: true });
    sync();
    return () => {
      window.removeEventListener("scroll", sync);
      document.removeEventListener("scroll", sync, { capture: true });
      window.removeEventListener("resize", sync);
    };
  }, []);

  const toTop = () => {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
    for (const el of [document.body, document.documentElement]) {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior });
  };

  return (
    <button
      type="button"
      className={`back-to-top${visible ? " is-visible" : ""}`}
      aria-label="Return to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={toTop}
    >
      <svg className="back-to-top__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M12 5.5L4 16h4.5v6h7V16H20L12 5.5z" />
      </svg>
    </button>
  );
}
