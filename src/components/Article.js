import Html from "./Html";
import PageTitle from "./PageTitle";
import { asset, renderPage } from "@/lib/content";

// Port of layouts/_default/single.html: used for blog posts and standalone pages.
export default function Article({ page }) {
  const p = page.params;
  return (
    <>
      <PageTitle title={page.title} bgImage={asset(p.bg_image)} breadcrumb={p.breadcrumb} />
      <section className="blog section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 pr-lg-5">
              <div className="row">
                <div className="col-md-12">
                  <article className="post">
                    <div className="post-header">
                      <div className="meta-row mb-3">
                        <div className="tags">
                          {(p.tags ?? []).map((tag) => (
                            <span key={tag}>{tag} </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="single-post-thumbnail my-4">
                      {p.image && <img className="img-fluid w-100" src={asset(p.image)} alt={p.image_alt ?? ""} />}
                    </div>
                    <div className="post-blog">
                      <Html as="div" className="content" html={renderPage(page)} />
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
