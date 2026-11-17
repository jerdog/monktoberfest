"use client";

import { useState } from "react";

// Replaces Bootstrap's tab plugin. `tabs` arrive with their HTML already rendered.
export default function ScheduleTabs({ tabs }) {
  const [active, setActive] = useState(0);
  return (
    <>
      <nav className="nav nav-pills nav-fill" role="tablist">
        {tabs.map((tab, i) => (
          <a
            key={i}
            className={`nav-item nav-link${i === active ? " active" : ""}`}
            href={`#scheduleTab${i + 1}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`scheduleTab${i + 1}`}
            onClick={(e) => {
              e.preventDefault();
              setActive(i);
            }}
          >
            <h2 dangerouslySetInnerHTML={{ __html: tab.title }} />
            <p dangerouslySetInnerHTML={{ __html: tab.dateTime }} />
          </a>
        ))}
      </nav>

      <div className="tab-content">
        {tabs.map((tab, i) => (
          <div
            key={i}
            className={`tab-pane fade${i === active ? " show active" : ""}`}
            id={`scheduleTab${i + 1}`}
            role="tabpanel"
          >
            <ul className="mt-5 time-table pl-0 list-unstyled">
              {tab.items.map((item, j) => (
                <li key={j} className="d-md-flex align-items-center justify-content-between bg-light p-4 mb-3">
                  {item.time && <h4 className="time text-color">{item.time}</h4>}
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
