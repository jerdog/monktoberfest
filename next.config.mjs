import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hugo served every page at a trailing-slash URL (/attend/tickets/), keep that.
  trailingSlash: true,
  images: { unoptimized: true },
  sassOptions: {
    // The ported Themefisher SCSS predates Dart Sass 2 conventions.
    silenceDeprecations: ["import", "global-builtin", "color-functions", "legacy-js-api"],
    quietDeps: true,
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
