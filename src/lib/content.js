// Loads the site's Markdown pages (content/) and YAML data files (data/en/).
// Everything here runs at build time; the deployed Worker never reads the
// filesystem because every page is prerendered.
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import yaml from "js-yaml";
import { renderMarkdown, markdownify as markdownifyRaw } from "./markdown.js";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content");
const DATA_DIR = path.join(ROOT, "data", "en");

// Show draft pages when SHOW_DRAFTS=1 (handy for local previews).
const SHOW_DRAFTS = process.env.SHOW_DRAFTS === "1";

/* ----------------------------------------------------------------------------
 * Data files
 * ------------------------------------------------------------------------- */

const dataCache = new Map();

export function getData(name) {
  if (!dataCache.has(name)) {
    const file = path.join(DATA_DIR, `${name}.yml`);
    const value = fs.existsSync(file) ? yaml.load(fs.readFileSync(file, "utf8")) ?? {} : {};
    dataCache.set(name, value);
  }
  return dataCache.get(name);
}

export const getSite = () => getData("site");

/* ----------------------------------------------------------------------------
 * Pages
 * ------------------------------------------------------------------------- */

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return entry.name.endsWith(".md") ? [full] : [];
  });
}

/** "/foo" or "foo/" -> "/foo/" */
export function normalizePath(p) {
  let out = String(p).trim();
  if (!out.startsWith("/")) out = `/${out}`;
  if (!out.endsWith("/")) out = `${out}/`;
  return out.replace(/\/{2,}/g, "/");
}

function toDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

let pagesCache = null;

/** All pages (drafts excluded unless SHOW_DRAFTS=1), with their public URL. */
export function getAllPages() {
  if (pagesCache) return pagesCache;
  pagesCache = walk(CONTENT_DIR)
    .map((file) => {
      const rel = path.relative(CONTENT_DIR, file).split(path.sep).join("/");
      const { data, content } = matter(fs.readFileSync(file, "utf8"));
      const parts = rel.replace(/\.md$/, "").split("/");
      const name = parts.pop();
      const isSection = name === "_index";
      const section = parts.join("/");
      const slug = isSection ? section.split("/").pop() || "" : name;
      const permalink = data.url
        ? normalizePath(data.url)
        : normalizePath([section, isSection ? "" : slug].filter(Boolean).join("/"));
      return {
        file: rel,
        section,
        slug,
        isSection,
        permalink,
        title: data.title ?? "",
        date: toDate(data.date),
        draft: data.draft === true,
        params: data,
        body: content,
      };
    })
    .filter((p) => SHOW_DRAFTS || !p.draft);
  return pagesCache;
}

export function getPageByPermalink(permalink) {
  const target = normalizePath(permalink);
  return getAllPages().find((p) => p.permalink === target) ?? null;
}

/** Regular (non-section) pages in a section, newest first (Hugo's default order). */
export function getSectionPages(section) {
  return getAllPages()
    .filter((p) => !p.isSection && p.section === section)
    .sort((a, b) => {
      const w = (a.params.weight ?? 0) - (b.params.weight ?? 0);
      if (w !== 0) return w;
      return (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0) || a.title.localeCompare(b.title);
    });
}

/* ----------------------------------------------------------------------------
 * Links between content
 * ------------------------------------------------------------------------- */

/**
 * Resolve a link the way Hugo's embedded link hook did: a relative link that
 * names another content file (`blog/post.md`, `blog/post/`, `../faq.md`) becomes
 * that page's public URL. Anything else is returned unchanged.
 */
export function resolveLink(href, fromFile = "") {
  if (!href || /^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(href)) return href;
  const [pathPart, hash = ""] = href.split("#");
  if (!pathPart) return href;
  const candidates = [];
  const clean = pathPart.replace(/\/$/, "").replace(/(?:\/_?index)?\.md$/, "");
  if (pathPart.startsWith("/")) {
    candidates.push(clean.slice(1));
  } else {
    const dir = path.posix.dirname(fromFile);
    if (dir && dir !== ".") candidates.push(path.posix.normalize(path.posix.join(dir, clean)));
    candidates.push(path.posix.normalize(clean));
  }
  const pages = getAllPages();
  for (const c of candidates) {
    const page = pages.find(
      (p) => p.file === `${c}.md` || p.file === `${c}/_index.md` || p.file === `${c}/index.md`,
    );
    if (page) return page.permalink + (hash ? `#${hash}` : "");
  }
  // Not a content file: make site-relative paths absolute so they work from any page.
  if (!pathPart.startsWith("/") && !pathPart.includes(".") && !fromFile) {
    return normalizePath(pathPart) + (hash ? `#${hash}` : "");
  }
  return href;
}

export function renderPage(page) {
  return renderMarkdown(page.body, { resolveLink: (h) => resolveLink(h, page.file) });
}

/** markdownify for strings from data files; links resolve from the site root. */
export function md(value) {
  return markdownifyRaw(value, { resolveLink: (h) => resolveLink(h) });
}

/** Turn a data-file link (`sponsorships/`, `/faq/`, `https://…`) into an href. */
export function href(value) {
  if (!value) return "#";
  return resolveLink(String(value));
}

/** Data-file image path (`images/foo.jpg` or `/images/foo.jpg`) -> `/images/foo.jpg`. */
export function asset(value) {
  if (!value) return "";
  const v = String(value);
  if (/^(?:[a-z]+:)?\/\//i.test(v) || v.startsWith("data:")) return v;
  return v.startsWith("/") ? v : `/${v}`;
}

/** Plain-text summary for list views (Hugo's .Summary, ~25 words). */
export function summary(page, words = 25) {
  if (page.params.description) return page.params.description;
  const text = renderPage(page)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ");
  return text.slice(0, words).join(" ") + (text.length > words ? "…" : "");
}

/* ----------------------------------------------------------------------------
 * Past talks (content/program)
 * ------------------------------------------------------------------------- */

/** Years of past talks, newest first: { year, permalink, title, talks }. */
export function getProgramYears() {
  return getSectionPages("program").map((p) => ({
    year: String(p.slug.match(/\d{4}/)?.[0] ?? p.title.match(/\d{4}/)?.[0] ?? p.title),
    permalink: p.permalink,
    title: p.title,
    talks: Array.isArray(p.params.talks) ? p.params.talks : [],
  }));
}
