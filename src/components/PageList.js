import Html from "./Html";
import PageTitle from "./PageTitle";
import { asset, renderPage } from "@/lib/content";

// Port of layouts/program/list.html: intro content then a card per page.
export default function PageList({ page, pages, children }) {
  const intro = page ? renderPage(page) : "";
  return (
    <>
      <PageTitle title={page?.title} bgImage={asset(page?.params.bg_image)} breadcrumb={page?.params.breadcrumb} />
      <section className="section">
        <div className="container">
          <div className="row-full">
            <div className="col-md-12 col-lg-12 pr-lg-5">
              <div className="row">
                {intro && (
                  <div className="col-12 mb-4">
                    <div className="post-blog">
                      <Html as="div" className="content" html={intro} />
                    </div>
                  </div>
                )}
                {children && <div className="col-12">{children}</div>}
                {pages.map((p) => (
                  <div key={p.permalink} className="col-12">
                    <article className="blog-article box-shadow mb-4">
                      <div className="content py-4 px-4">
                        <h2 className="h4 mb-0">
                          <a href={p.permalink}>{p.title}</a>
                        </h2>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
