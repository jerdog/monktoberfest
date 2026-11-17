# Project conventions

## Accessibility: WCAG 2.2 AA is the default
Every change to the site must meet WCAG 2.2 Level AA. In particular:
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI components). Use the brand red `#d81920`
  (5.15:1 on white) for text and buttons, not the original `#ea1c24` (4.48:1).
- Everything works with a keyboard alone, with a visible focus indicator (see `src/styles/a11y.scss`;
  never remove outlines). Interactive widgets follow the WAI-ARIA Authoring Practices patterns.
- Interactive targets are at least 24×24 CSS px (2.5.8); aim for 44×44.
- Meaningful images have alt text; decorative ones use `alt=""`. Links and buttons have descriptive
  accessible names; icon-only controls get a visually hidden label.
- Heading levels don't skip; each page has one `<h1>` (the page title).
- Respect `prefers-reduced-motion`. Content reflows at 320 px wide without horizontal scrolling.
- Check new pages with axe-core (WCAG 2.2 A/AA rule sets) and by keyboard before committing.

## Stack
- JavaScript (not TypeScript) for application code. Next.js App Router on Cloudflare Workers via
  `@opennextjs/cloudflare`; every page is prerendered from `content/` and `data/en/`.
- Prefer Cloudflare services for anything backend.
- Content editors use Sveltia CMS (`public/admin/config.yml`). When adding content fields, add them to
  the CMS config too, with plain-language labels and hints.
- `npm test` must pass; run `npm run preview` to check the Workers build.
