import PageTitle from "./PageTitle";
import { asset, summary } from "@/lib/content";

// Port of the theme's _default/list.html + post.html cards (sidebar omitted).
export default function BlogList({ page, pages }) {
  return (
    <>
      <PageTitle title={page?.title} bgImage={asset(page?.params.bg_image)} />
      <section className="blog section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="row">
                {pages.map((p) => (
                  <div key={p.permalink} className="col-sm-6">
                    <article className="blog-article box-shadow mb-4">
                      {p.params.image && <img src={asset(p.params.image)} alt="" className="img-fluid" />}
                      <div className="content py-5 px-4">
                        {p.params.author && (
                          <span className="d-block">
                            <i className="tf-ion-android-person mr-3"></i>By {p.params.author}
                          </span>
                        )}
                        <h2 className="h4 my-3">
                          <a href={p.permalink}>{p.title}</a>
                        </h2>
                        <p className="mb-4">{summary(p)}</p>
                        <a href={p.permalink} className="read-more text-color h6">
                          Read More <i className="tf-ion-android-arrow-forward ml-3"></i>
                        </a>
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
