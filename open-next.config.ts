// OpenNext adapter config (this file name is required by @opennextjs/cloudflare).
// Every page on this site is prerendered at build time, so the prerendered HTML
// is served straight from Workers static assets; no R2/KV cache is needed.
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
