// Renders trusted HTML produced at build time from the site's own Markdown/YAML.
//
// Hugo templates often wrapped `markdownify` output in <p> or <h2>. When the
// content itself contains block elements (paragraphs, lists…) that nesting is
// invalid HTML and breaks React hydration, so fall back to a <div>.
const BLOCK = /<(?:p|div|ul|ol|h[1-6]|table|blockquote|pre|hr|section|figure)[\s>/]/i;
const INLINE_ONLY = new Set(["p", "span", "h1", "h2", "h3", "h4", "h5", "h6", "a", "label"]);

export default function Html({ html, as = "span", ...props }) {
  if (!html) return null;
  const Tag = INLINE_ONLY.has(as) && BLOCK.test(html) ? "div" : as;
  return <Tag {...props} dangerouslySetInnerHTML={{ __html: html }} />;
}
