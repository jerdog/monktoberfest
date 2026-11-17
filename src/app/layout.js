import "@/styles/vendor/bootstrap.min.css";
import "@/styles/vendor/themefisher-font.min.css";
import "@/styles/theme/style.scss";
import "@/styles/custom.scss";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Preloader from "@/components/Preloader";
import BackToTop from "@/components/BackToTop";
import { getSite } from "@/lib/content";

export function generateMetadata() {
  const site = getSite();
  return {
    title: { default: site.title, template: "%s" },
    description: site.description,
    authors: site.author ? [{ name: site.author }] : undefined,
    icons: { icon: site.favicon, shortcut: site.favicon },
  };
}

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  const site = getSite();
  return (
    <html lang="en-US">
      <body>
        {site.preloader && <Preloader />}
        <Header site={site} />
        {children}
        <Footer site={site} />
        <BackToTop />
      </body>
    </html>
  );
}
