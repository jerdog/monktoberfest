"use client";

import { useEffect, useState } from "react";

const UNITS = [
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
  ["second", 1],
];

function parts(target, now) {
  let left = Math.max(0, Math.floor((target - now) / 1000));
  return UNITS.map(([unit, size]) => {
    const value = Math.floor(left / size);
    left -= value * size;
    return { unit, value };
  });
}

// Replaces the jQuery "syotimer" plugin, reusing its markup and CSS classes.
// The deadline is in the visitor's local time, as syotimer did.
export default function Countdown({ year, month, day, hour }) {
  const target = new Date(Number(year), Number(month) - 1, Number(day), Number(hour) || 0, 0, 0).getTime();
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const finished = now !== null && now >= target;

  return (
    <div id="simple-timer" className="syotimer">
      <div className="syotimer__head"></div>
      <div className="syotimer__body">
        {finished ? (
          <p style={{ fontSize: "1.2em" }}>The countdown is finished!</p>
        ) : (
          parts(target, now ?? target).map(({ unit, value }) => (
            <div key={unit} className={`syotimer-cell syotimer-cell_type_${unit}`}>
              <div className="syotimer-cell__value">
                {now === null ? "--" : unit === "day" ? value : String(value).padStart(2, "0")}
              </div>
              <div className="syotimer-cell__unit">{value === 1 ? unit : `${unit}s`}</div>
            </div>
          ))
        )}
      </div>
      <div className="syotimer__footer"></div>
    </div>
  );
}
