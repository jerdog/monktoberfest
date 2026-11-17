# monktoberfest.com

The website for [The Monktoberfest](https://monktoberfest.com): a [Next.js](https://nextjs.org) site that runs on Cloudflare Workers (via [OpenNext](https://opennext.js.org/cloudflare)), with content editing through [Sveltia CMS](https://sveltiacms.app) at **`/admin/`**.

All content lives in this repository as Markdown and YAML, so every change has history, can be reviewed in a pull request, and can be undone.

---

## For editors

1. Go to **https://monktoberfest.com/admin/** and choose **Sign In with GitHub**. Your GitHub account needs write access to this repository; ask a maintainer to add you.
2. Pick what to edit in the left sidebar:

   | Section | What's in it |
   | --- | --- |
   | **Blog Posts** | News posts at `/blog/`. "Hidden from site" keeps a post offline. |
   | **Attend Pages** | Tickets, CFP, Code of Conduct, Accessibility, … |
   | **Past Speakers** | One page per year, shown as a video gallery. Add each talk with its speaker, title and YouTube link. |
   | **Pages** | FAQ, Travel, Portland, Sponsorships |
   | **Homepage → Homepage Sections** | Banner, countdown, event blurb, ticket call-to-action, **sponsors**, venue. Each section has a *Show* switch. |
   | **Homepage → Agenda** | The day-by-day schedule on the homepage |
   | **Homepage → Site Settings** | Menu, "Buy Tickets" link, footer |

3. **Save** creates a draft. Nothing goes live yet.
4. In the CMS's **Workflow** view, move the draft through **Draft → In Review → Ready**. Under the hood each draft is a branch with a pull request, and Cloudflare builds a **Worker Preview** of the site for it. The preview link is on the pull request in GitHub, and the CMS shows it too when it can detect it.
5. When it's approved, **Publish**. The live site updates within a couple of minutes.

Images you upload go to `public/images/uploads/`. Give every meaningful image a description (alt text), and every sponsor a name: screen readers read these instead of the image.

The site targets **WCAG 2.2 AA** accessibility; see `CLAUDE.md` for the conventions.

---

## For developers

Requires Node.js 20+.

```bash
npm install
npm run dev          # http://localhost:3000 (hot reload)
npm test             # unit tests (content loader + CMS sign-in worker)
npm run preview      # production build running in the Workers runtime, http://localhost:8787
```

Set `SHOW_DRAFTS=1` to include draft pages locally.

**Editing content locally without GitHub sign-in:** run `npm run dev`, open http://localhost:3000/admin/ in Chrome or Edge, and choose **Work with Local Repository**, then select this folder. Changes are written straight to your working copy.

### How it fits together

```
content/            Markdown pages. URL = `url:` front matter, else folder/file name
  attend/ blog/ program/ …   (content/attend/tickets.md → /attend/tickets/)
data/en/            YAML for the homepage, agenda (schedule.yml) and site settings (site.yml)
public/             Served as-is: images, /admin (CMS), _redirects
src/app/            Next.js routes: `page.js` (home) and `[...slug]` (every Markdown page)
src/components/     Ports of the original Hugo theme templates
src/lib/            Content loading + Markdown rendering (build time only)
src/styles/         Original theme SCSS + site overrides (custom.scss)
cms-auth/           Small Worker that handles GitHub sign-in for the CMS
```

Every page is prerendered at build time; the Worker never reads `content/` at runtime. Past talks are structured front matter (`talks:` with `speaker`, `title`, `video`) rendered as a click-to-play gallery; YouTube's player only loads when a visitor presses play. Markdown is rendered to match the old Hugo/Goldmark output: raw HTML is allowed, headings get GitHub-style IDs, quotes and dashes get smart typography, `{{< youtube ID >}}` shortcodes and standalone YouTube links become embeds, and links to `.md` files resolve to the right URL.

Redirects for old URLs are in `public/_redirects`.

---

## Deployment & one-time setup

### 1. The site Worker (`monktoberfest`)

`wrangler.jsonc` uses the dashboard Worker's name (`monktoberfest`) and the `monktoberfest.com` custom domain. In the Cloudflare dashboard → **Workers & Pages → monktoberfest → Settings → Build**:

| Setting | Value |
| --- | --- |
| Build command | `npm run build:worker` |
| Deploy command | `npx wrangler deploy` (the default) |
| Worker Previews command | `npx wrangler preview` (the default) |

`npm run build:worker` builds the site and copies the prerendered pages into the Worker's assets, so the stock Wrangler commands work. Don't use `npx opennextjs-cloudflare build` on its own as the build command: without that copy step, every Markdown page returns an error.

**Worker Previews** give every branch (and so every CMS draft) its own preview URL. Turn them on under **Builds → Set up Worker Previews**. The site needs no variables, secrets or bindings, so there is nothing to configure in the Preview settings. The empty `previews` block in `wrangler.jsonc` is all Wrangler requires. If you ever add a binding, variable or secret, add a preview-safe copy to that block too, because previews don't inherit them from production.

Manual deploy from a machine logged in with `wrangler login`: `npm run deploy`.

### 2. CMS sign-in (`cms-auth/`)

1. Create a GitHub OAuth App at **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App** (or under the organization that owns this repo):
   - Homepage URL: `https://monktoberfest.com`
   - Authorization callback URL: `https://monktoberfest-cms-auth.jerdog.workers.dev/callback`
2. Deploy the sign-in Worker and add the app's credentials as secrets:

   ```bash
   npx wrangler deploy -c cms-auth/wrangler.jsonc
   npx wrangler secret put GITHUB_CLIENT_ID -c cms-auth/wrangler.jsonc
   npx wrangler secret put GITHUB_CLIENT_SECRET -c cms-auth/wrangler.jsonc
   ```

3. If the Worker ends up at a different URL, update `backend.base_url` in `public/admin/config.yml` and the callback URL in the OAuth App. `ALLOWED_DOMAINS` in `cms-auth/wrangler.jsonc` lists the sites allowed to receive a sign-in token.

### 3. Editors

Add each editor as a collaborator on the GitHub repository with **Write** access.

### Updating Sveltia CMS

The CMS version is pinned in `public/admin/index.html`. To upgrade, change the version number, test at `/admin/` with `npm run preview`, and commit.
