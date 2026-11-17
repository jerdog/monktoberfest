"use client";

import { useEffect, useRef, useState } from "react";

// "Lite" YouTube embed: shows the thumbnail and only loads YouTube's player
// (and its cookies) once the visitor chooses to play. Keyboard and screen
// reader friendly: the play control is a real <button> with a descriptive name.
export default function VideoCard({ id, label }) {
  const [playing, setPlaying] = useState(false);
  const [thumbFailed, setThumbFailed] = useState(false);
  const frame = useRef(null);

  useEffect(() => {
    if (playing) frame.current?.focus();
  }, [playing]);

  if (!id) {
    return (
      <div className="talk-video talk-video--missing">
        <span>Video unavailable</span>
      </div>
    );
  }

  if (playing) {
    return (
      <div className="talk-video">
        <iframe
          ref={frame}
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={`Video: ${label}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
        />
      </div>
    );
  }

  return (
    <button type="button" className="talk-video talk-video__play" onClick={() => setPlaying(true)}>
      {!thumbFailed && (
        <img
          src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setThumbFailed(true)}
        />
      )}
      <span className="talk-video__icon" aria-hidden="true">
        <svg viewBox="0 0 68 48" focusable="false">
          <path className="talk-video__icon-bg" d="M66.5 7.7a8.5 8.5 0 0 0-6-6C55.3.3 34 .3 34 .3s-21.3 0-26.5 1.4a8.5 8.5 0 0 0-6 6C.1 12.9.1 24 .1 24s0 11.1 1.4 16.3a8.5 8.5 0 0 0 6 6c5.2 1.4 26.5 1.4 26.5 1.4s21.3 0 26.5-1.4a8.5 8.5 0 0 0 6-6C67.9 35.1 67.9 24 67.9 24s0-11.1-1.4-16.3z" />
          <path fill="#fff" d="M45 24 27 14v20z" />
        </svg>
      </span>
      <span className="sr-only">Play video: {label}</span>
    </button>
  );
}
