// One route for every Markdown page. URLs follow the same rules Hugo used:
// a page's `url` front matter if set, otherwise its folder + file name
// (content/attend/tickets.md -> /attend/tickets/).
import { notFound } from "next/navigation";
import Article from "@/components/Article";
import BlogList from "@/components/BlogList";
import PageList from "@/components/PageList";
import PageTitle from "@/components/PageTitle";
import Schedule from "@/components/Schedule";
import { asset, getAllPages, getSectionPages, normalizePath } from "@/lib/content";

export const dynamicParams = false;

/** Every URL this route serves, mapped to what to render there. */
function routes() {
  const map = new Map();
  const pages = getAllPages();
  for (const page of pages) {
    map.set(page.permalink, page.isSection ? { kind: "section", page, section: page.section } : { kind: "page", page });
  }
  // Sections without an _index.md still get a list page, as in Hugo.
  for (const section of new Set(pages.filter((p) => !p.isSection && p.section).map((p) => p.section))) {
    const url = normalizePath(section);
    if (![...map.values()].some((r) => r.kind === "section" && r.section === section) && !map.has(url)) {
      const title = section.charAt(0).toUpperCase() + section.slice(1);
      map.set(url, { kind: "section", section, page: { title, params: {}, body: "", file: "" } });
    }
  }
  map.delete("/");
  return map;
}

function lookup(slug) {
  return routes().get(normalizePath((slug ?? []).map(decodeURIComponent).join("/")));
}

export function generateStaticParams() {
  return [...routes().keys()].map((url) => ({ slug: url.split("/").filter(Boolean) }));
}

export async function generateMetadata({ params }) {
  const route = lookup((await params).slug);
  if (!route) return {};
  return {
    title: route.page.title,
    description: route.page.params.description || undefined,
  };
}

export default async function ContentPage({ params }) {
  const route = lookup((await params).slug);
  if (!route) notFound();
  const { page } = route;

  if (route.kind === "page") return <Article page={page} />;

  if (route.section === "schedule") {
    return (
      <>
        <PageTitle title={page.title} bgImage={asset(page.params.bg_image)} />
        <Schedule />
      </>
    );
  }
  const children = getSectionPages(route.section);
  if (route.section === "blog") return <BlogList page={page} pages={children} />;
  return <PageList page={page.body ? page : { ...page, body: "" }} pages={children} />;
}
