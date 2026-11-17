export default function PageTitle({ title, bgImage, breadcrumb }) {
  const images = [bgImage, "/images/bg/cta-bg.jpg"].filter(Boolean).map((u) => `url('${u}')`);
  return (
    <section className="page-header" style={{ backgroundImage: images.join(", ") }}>
      <div className="overly"></div>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="content text-center">
              <h1 className="mb-3 text-white text-capitalize letter-spacing">{title}</h1>
              <div className="divider mx-auto mb-4 bg-white"></div>
              {breadcrumb && (
                <ul className="list-inline">
                  <li className="list-inline-item">
                    <a href="/">Home</a> /
                  </li>
                  <li className="list-inline-item">{title}</li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
