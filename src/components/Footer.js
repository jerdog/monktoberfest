import Html from "./Html";
import { md } from "@/lib/content";

export default function Footer({ site }) {
  return (
    <footer className="footer section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <Html as="h2" className="text-white mb-3" html={md(site.title)} />
            <Html as="p" className="text-white-50" html={md(site.footer_content)} />
            <ul className="list-inline footer-socails">
              {(site.social ?? []).map((s, i) => (
                <li key={i} className="list-inline-item">
                  <a href={s.link} aria-label={s.icon.replace(/^tf-ion-social-/, "")}>
                    <i className={s.icon}></i>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-12 text-center mt-5 ">
            <Html as="p" className="copy border-top pt-4 text-white-50 mb-0" html={md(site.copyright)} />
          </div>
        </div>
      </div>
    </footer>
  );
}
