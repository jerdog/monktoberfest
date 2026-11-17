"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Header({ site }) {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(null);
  const pathname = usePathname();

  // Close menus after navigating.
  useEffect(() => {
    setOpen(false);
    setDropdown(null);
  }, [pathname]);

  useEffect(() => {
    if (dropdown === null) return undefined;
    const close = (e) => {
      if (!e.target.closest?.(".dropdown")) setDropdown(null);
    };
    const esc = (e) => {
      if (e.key !== "Escape") return;
      document.getElementById(`menu-toggle-${dropdown}`)?.focus();
      setDropdown(null);
    };
    document.addEventListener("click", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, [dropdown]);

  const button = site.navigation_button;

  return (
    <header className="header-bar">
      <nav className="navbar navbar-expand-lg main-nav" aria-label="Main">
        <div className="container">
          <a className="navbar-brand" href="/">
            <img src={site.logo} alt={`${site.title} home`} className="img-fluid logo-b" />
          </a>

          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navigation"
            aria-expanded={open}
            aria-label="Toggle navigation"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="tf-ion-android-menu"></span>
          </button>

          <div className={`collapse navbar-collapse text-center${open ? " show" : ""}`} id="navigation">
            <ul className="navbar-nav mx-auto">
              {(site.menu ?? []).map((item, i) =>
                item.children?.length ? (
                  <li key={item.name} className={`nav-item dropdown${dropdown === i ? " show" : ""}`}>
                    <button
                      type="button"
                      id={`menu-toggle-${i}`}
                      className="nav-link dropdown-toggle"
                      aria-expanded={dropdown === i}
                      aria-controls={`menu-${i}`}
                      onClick={() => setDropdown((d) => (d === i ? null : i))}
                    >
                      {item.name}
                    </button>
                    <div id={`menu-${i}`} className={`dropdown-menu${dropdown === i ? " show" : ""}`}>
                      {item.children.map((child) => (
                        <a key={child.name} className="dropdown-item" href={child.url}>
                          {child.name}
                        </a>
                      ))}
                    </div>
                  </li>
                ) : (
                  <li key={item.name} className="nav-item">
                    <a className="nav-link" href={item.url}>
                      {item.name}
                    </a>
                  </li>
                ),
              )}
            </ul>

            {button?.enable && (
              <a href={button.link} className="btn btn-secondary btn-rounded mt-3 mt-lg-0">
                {button.label}
              </a>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
