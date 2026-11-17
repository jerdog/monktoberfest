// Markdown -> HTML, run at build time only.
//
// Mirrors what Hugo/Goldmark did for this site so existing content renders the
// same: raw HTML allowed, GitHub-style heading IDs, smart quotes/dashes
// (Goldmark "typographer"), {{< youtube >}} shortcodes, and links to other
// content files (`blog/some-post.md`) resolved to their public URLs.
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,}$/;

export function youtubeEmbed(id) {
  return (
    `<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">` +
    `<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" ` +
    `loading="lazy" referrerpolicy="strict-origin-when-cross-origin" ` +
    `src="https://www.youtube.com/embed/${id}" ` +
    `style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" title="YouTube video"></iframe></div>`
  );
}

/** Pull a YouTube video ID out of an ID, a watch URL, a youtu.be URL or an embed URL. */
export function youtubeId(value) {
  const v = String(value ?? "").trim().replace(/^["']|["']$/g, "").replace(/\\_/g, "_");
  if (YOUTUBE_ID.test(v) && !v.includes(".")) return v;
  try {
    const url = new URL(v);
    if (url.hostname === "youtu.be") return url.pathname.slice(1) || null;
    if (url.hostname.endsWith("youtube.com") || url.hostname.endsWith("youtube-nocookie.com")) {
      if (url.searchParams.get("v")) return url.searchParams.get("v");
      const m = url.pathname.match(/\/(?:embed|shorts|live)\/([^/?]+)/);
      if (m) return m[1];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

/**
 * Replace video embeds with HTML before Markdown parsing:
 *  - Hugo shortcodes: {{< youtube ID >}}, {{< youtube "ID" >}}, {{< youtube id="ID" >}}
 *  - A YouTube link alone on its own line (what editors paste in the CMS).
 */
export function expandEmbeds(md) {
  return md
    .replace(/\{\{[<%]\s*youtube\s+(?:id=)?["']?([^"'\s>%]+)["']?[^>%]*[>%]\}\}/g, (match, id) => {
      const vid = youtubeId(id);
      return vid ? `\n${youtubeEmbed(vid)}\n` : match;
    })
    // Also matches `<url>` and `[url](url)`, which the CMS editor may produce.
    .replace(/^[ \t]*(?:\[[^\]]*\]\(|<)?(https?:\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/[^\s)>]+)[)>]?[ \t]*$/gm, (match, url) => {
      const vid = youtubeId(url);
      return vid ? `\n${youtubeEmbed(vid)}\n` : match;
    });
}

/** rehype plugin: rewrite href/src values via `resolveLink`. */
function rehypeResolveLinks({ resolveLink }) {
  return (tree) => {
    if (!resolveLink) return;
    visit(tree, "element", (node) => {
      for (const attr of ["href", "src"]) {
        const value = node.properties?.[attr];
        if (typeof value === "string") node.properties[attr] = resolveLink(value);
      }
    });
  };
}

/**
 * Quote unquoted href/src attributes in raw HTML (`<a href=https://…>`), which
 * the content uses in places. Otherwise the GFM autolinker grabs the URL.
 */
export function quoteAttributes(md) {
  return md.replace(/(<[a-zA-Z][^<>]*?\s(?:href|src)=)([^\s"'`=<>]+)/g, '$1"$2"');
}

export function renderMarkdown(md, { resolveLink } = {}) {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants, { dashes: "oldschool" })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeResolveLinks, { resolveLink })
    .use(rehypeStringify)
    .processSync(quoteAttributes(expandEmbeds(String(md ?? ""))));
  return String(file);
}

/**
 * Hugo's `markdownify`: render a short string from a data file, dropping the
 * wrapping <p> when the result is a single paragraph.
 */
export function markdownify(md, opts) {
  if (md === undefined || md === null || md === "") return "";
  const html = renderMarkdown(md, opts).trim();
  const single = html.match(/^<p>([\s\S]*)<\/p>$/);
  if (single && !single[1].includes("<p>") && !single[1].includes("</p>")) return single[1];
  return html;
}
