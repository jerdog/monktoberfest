"use client";

import { useRef, useState } from "react";

// Agenda tabs following the WAI-ARIA tabs pattern: buttons with role="tab",
// arrow keys / Home / End move between days, one tab stop for the whole list.
export default function ScheduleTabs({ tabs }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  const select = (i) => {
    const next = (i + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  };

  const onKeyDown = (e) => {
    const keys = { ArrowRight: active + 1, ArrowDown: active + 1, ArrowLeft: active - 1, ArrowUp: active - 1, Home: 0, End: tabs.length - 1 };
    if (e.key in keys) {
      e.preventDefault();
      select(keys[e.key]);
    }
  };

  return (
    <>
      <div className="nav nav-pills nav-fill" role="tablist" aria-label="Agenda by day" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="button"
            role="tab"
            id={`scheduleTab${i + 1}-tab`}
            className={`nav-item nav-link border-0${i === active ? " active" : " bg-transparent"}`}
            aria-selected={i === active}
            aria-controls={`scheduleTab${i + 1}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            <span className="h2 d-block" dangerouslySetInnerHTML={{ __html: tab.title }} />
            <span className="d-block mb-0" dangerouslySetInnerHTML={{ __html: tab.dateTime }} />
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tabs.map((tab, i) => (
          <div
            key={i}
            className={`tab-pane fade${i === active ? " show active" : ""}`}
            id={`scheduleTab${i + 1}`}
            role="tabpanel"
            aria-labelledby={`scheduleTab${i + 1}-tab`}
            tabIndex={0}
            hidden={i !== active}
          >
            <ul className="mt-5 time-table pl-0 list-unstyled">
              {tab.items.map((item, j) => (
                <li key={j} className="d-md-flex align-items-center justify-content-between bg-light p-4 mb-3">
                  {item.time && <p className="h4 time text-color">{item.time}</p>}
                  <div className="content" dangerouslySetInnerHTML={{ __html: item.content }} />
                  {item.image && (
                    <div className="content-img text-lg-right">
                      <img src={item.image} alt="" className="img-fluid" />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
