import Html from "./Html";
import PageTitle from "./PageTitle";
import TalkGallery from "./TalkGallery";
import YearNav from "./YearNav";
import { getProgramYears, renderPage } from "@/lib/content";

// A year of past talks (content/program/YYYY-speakers.md).
export default function SpeakersPage({ page }) {
  const years = getProgramYears();
  const index = years.findIndex((y) => y.permalink === page.permalink);
  const newer = years[index - 1];
  const older = years[index + 1];
  const talks = page.params.talks ?? [];
  const intro = renderPage(page);

  return (
    <>
      <PageTitle title={page.title} />
      <section className="section talks-section">
        <div className="container">
          <YearNav years={years} current={page.permalink} />
          <p className="talks-count">
            {talks.length} {talks.length === 1 ? "talk" : "talks"}
          </p>
          {intro && <Html as="div" className="content talks-intro" html={intro} />}
          <TalkGallery talks={talks} />
          <nav className="year-pager" aria-label="More years">
            {older ? (
              <a href={older.permalink} rel="prev">
                <span aria-hidden="true">← </span>
                {older.year} talks
              </a>
            ) : (
              <span />
            )}
            {newer && (
              <a href={newer.permalink} rel="next">
                {newer.year} talks<span aria-hidden="true"> →</span>
              </a>
            )}
          </nav>
        </div>
      </section>
    </>
  );
}
