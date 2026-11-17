import { youtubeId } from "@/lib/markdown";

// Previous-years landing page: one card per year with a mosaic of its talks.
export default function YearGrid({ years, headingLevel = 3 }) {
  const H = `h${headingLevel}`;
  return (
    <ul className="year-grid list-unstyled">
      {years.map((y) => {
        const thumbs = y.talks
          .map((t) => youtubeId(t.video))
          .filter(Boolean)
          .slice(0, 4);
        return (
          <li key={y.permalink} className="year-card">
            <div className="year-card__mosaic" aria-hidden="true">
              {thumbs.map((id) => (
                <img key={id} src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" loading="lazy" decoding="async" />
              ))}
            </div>
            <div className="year-card__body">
              <H className="year-card__title">
                {/* The whole card is clickable via CSS; this link is its accessible name. */}
                <a href={y.permalink} className="stretched-link">
                  {y.year}
                </a>
              </H>
              <p className="year-card__meta">
                {y.talks.length} {y.talks.length === 1 ? "talk" : "talks"}
              </p>
              {y.talks.length > 0 && (
                <p className="year-card__names">
                  {y.talks
                    .slice(0, 3)
                    .map((t) => t.speaker.replace(/,.*$/, ""))
                    .join(", ")}
                  {y.talks.length > 3 ? ` and ${y.talks.length - 3} more` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
