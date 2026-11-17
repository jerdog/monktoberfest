"use client";

import { useEffect, useState } from "react";

// Same behaviour as the theme: a full-screen loader that fades out on window load.
export default function Preloader() {
  const [state, setState] = useState("visible");

  useEffect(() => {
    const hide = () => {
      setState("fading");
      setTimeout(() => setState("hidden"), 100);
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    return () => window.removeEventListener("load", hide);
  }, []);

  if (state === "hidden") return null;
  return (
    <div
      className="preloader"
      style={{ opacity: state === "fading" ? 0 : 1, transition: "opacity 100ms linear" }}
    />
  );
}
