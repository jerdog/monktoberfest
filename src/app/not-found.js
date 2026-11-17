import PageTitle from "@/components/PageTitle";

export const metadata = { title: "404 Page not found" };

export default function NotFound() {
  return (
    <>
      <PageTitle title="404 Page not found" />
      <section className="error section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <img src="/images/about/404-Error-Concept.png" alt="" className="img-fluid" />
            </div>
            <div className="col-lg-6">
              <div className="error-content mt-5 mt-lg-0">
                <h3>Nothing Found!</h3>
                <p className="mt-3">Sorry, but the page you were looking for doesn&rsquo;t exist.</p>
                <a href="/" className="btn btn-hero btn-rounded mt-3">
                  Go to home
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
