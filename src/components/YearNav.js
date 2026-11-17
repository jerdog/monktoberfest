/** Links to every year's talks; the current year is marked for assistive tech. */
export default function YearNav({ years, current }) {
  return (
    <nav className="year-nav" aria-label="Talks by year">
      <ul className="list-unstyled">
        <li>
          <a href="/program/previous-years/" aria-current={current ? undefined : "page"}>
            All years
          </a>
        </li>
        {years.map((y) => (
          <li key={y.permalink}>
            <a href={y.permalink} aria-current={y.permalink === current ? "page" : undefined}>
              {y.year}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
