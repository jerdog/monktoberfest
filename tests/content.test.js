import { test } from "node:test";
import assert from "node:assert/strict";
import { expandEmbeds, markdownify, renderMarkdown, youtubeId } from "../src/lib/markdown.js";
import { getAllPages, getData, getSectionPages, resolveLink } from "../src/lib/content.js";

test("youtube IDs come out of shortcodes and URLs", () => {
  assert.equal(youtubeId("0UhXndOYwzU"), "0UhXndOYwzU");
  assert.equal(youtubeId('"-o1C265_h0M"'), "-o1C265_h0M");
  assert.equal(youtubeId("https://www.youtube.com/watch?v=0UhXndOYwzU&t=3"), "0UhXndOYwzU");
  assert.equal(youtubeId("https://youtu.be/0UhXndOYwzU"), "0UhXndOYwzU");
  assert.equal(youtubeId("https://example.com/x"), null);
});

test("Hugo youtube shortcodes and bare YouTube links become embeds", () => {
  for (const src of ['{{< youtube "LOW0ZZsh1BE" >}}', "{{< youtube LOW0ZZsh1BE >}}", "https://youtu.be/LOW0ZZsh1BE", "<https://www.youtube.com/watch?v=LOW0ZZsh1BE>", "[https://youtu.be/LOW0ZZsh1BE](https://youtu.be/LOW0ZZsh1BE)"]) {
    assert.match(expandEmbeds(src), /youtube\.com\/embed\/LOW0ZZsh1BE/, src);
  }
  // A YouTube link inside a sentence stays a link.
  assert.doesNotMatch(expandEmbeds("see https://youtu.be/LOW0ZZsh1BE here"), /iframe/);
});

test("markdown matches Goldmark conventions", () => {
  const html = renderMarkdown('## When is it?\n\nIt\'s "soon" -- really.');
  assert.match(html, /<h2 id="when-is-it">/);
  assert.match(html, /It’s “soon” – really\./);
  assert.match(renderMarkdown('<a href=https://x.test/a>tweet</a>'), /<a href="https:\/\/x\.test\/a">tweet<\/a>/);
});

test("markdownify strips a single wrapping paragraph", () => {
  assert.equal(markdownify("**bold**"), "<strong>bold</strong>");
  assert.match(markdownify("one\n\ntwo"), /^<p>one<\/p>\s*<p>two<\/p>$/);
});

test("links to content files resolve to public URLs", () => {
  const post = "/blog/why-the-monktoberfest-agenda-is-not-disclosed/";
  assert.equal(resolveLink("blog/why-the-monktoberfest-agenda-is-not-disclosed.md"), post);
  assert.equal(resolveLink("blog/why-the-monktoberfest-agenda-is-not-disclosed/", "program/_index.md"), post);
  assert.equal(resolveLink("sponsorships/"), "/sponsorships/");
  assert.equal(resolveLink("https://ti.to/monktoberfest/2026"), "https://ti.to/monktoberfest/2026");
  assert.equal(resolveLink("/#schedule"), "/#schedule");
  assert.equal(resolveLink("mailto:a@b.c"), "mailto:a@b.c");
});

test("pages keep their Hugo URLs and drafts are excluded", () => {
  const urls = getAllPages().map((p) => p.permalink);
  for (const url of ["/faq/", "/travel/", "/portland/", "/sponsorships/", "/attend/tickets/", "/program/previous-years/", "/program/2025-speakers/"]) {
    assert.ok(urls.includes(url), url);
  }
  assert.ok(!urls.includes("/blog/monktoberfest-2020/"), "draft post should be hidden");
  const program = getSectionPages("program").map((p) => p.slug);
  assert.equal(program[0], "2025-speakers");
  assert.equal(program.at(-1), "2011-speakers");
});

test("data files load", () => {
  assert.equal(getData("site").title, "The Monktoberfest");
  assert.ok(getData("homepage").sponsor.sponsor_group.length > 0);
  assert.ok(getData("schedule").schedule.schedule_tab.length > 0);
});
