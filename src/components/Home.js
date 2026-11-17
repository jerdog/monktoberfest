import Html from "./Html";
import Countdown from "./Countdown";
import Schedule from "./Schedule";
import Sponsors from "./Sponsors";
import { asset, getData, href, md } from "@/lib/content";

// Port of layouts/index.html. Each section is switched on/off with `enable`
// in data/en/homepage.yml (editable in the CMS).
export default function Home() {
  const h = getData("homepage");
  const { banner, timer, event, cta, venue } = h;

  return (
    <>
      {banner?.enable && (
        <section
          className="section-banner d-flex align-items-center"
          style={{ backgroundImage: `url('${asset(banner.bg_image)}')` }}
        >
          <div className="container">
            <div className="row">
              <div className="col-lg-7 mr-auto">
                <div className="banner-content">
                  <span>{banner.date_time}</span>
                  <Html as="h1" className="mt-3 mb-5" html={md(banner.title)} />
                  {banner.button?.enable && (
                    <a href={href(banner.button.link)} className="btn btn-hero btn-rounded">
                      {banner.button.label}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {timer?.enable && (
        <section className="overflow-hidden counter-wrapper pt-4 pb-5">
          <div className="container">
            <div className="counter-inner">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div className="counter-stat">
                    <Html as="h2" className="font-weight-light" html={md(timer.title)} />
                  </div>
                </div>
                <Countdown year={timer.year} month={timer.month} day={timer.day} hour={timer.hour} />
              </div>
            </div>
          </div>
        </section>
      )}

      {event?.enable && (
        <section className="section about">
          <div className="container">
            <div className="row">
              <div className="col-lg-5">
                <div className="about-img position-relative">
                  <img src={asset(event.image_back)} alt="" className="img-fluid w-100" />
                  <div className="img-block">
                    <img src={asset(event.image_front)} alt="" className="img-fluid" />
                  </div>
                </div>
              </div>
              <div className="col-lg-7">
                <div className="about-content-wrap mt-5 mt-lg-0">
                  <span className="stroke-text" aria-hidden="true">{event.title_outline}</span>
                  <div className="ml-90">
                    <Html as="h2" className="text-lg mb-3 mt-3" html={md(event.title)} />
                    <Html as="div" className="event-content" html={md(event.content)} />
                    {event.button?.enable && (
                      <a href={href(event.button.link)} className="btn btn-hero btn-rounded mt-3">
                        {event.button.label}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {cta?.enable && (
        <section className="section cta-wrap">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-7">
                <div className="cta-content">
                  <Html as="span" className="lead" html={md(cta.subtitle)} />
                  <Html as="h2" className="mt-3 mb-4 text-md title" html={md(cta.title)} />
                  {cta.button?.enable && (
                    <a href={href(cta.button.link)} className="btn btn-secondary btn-rounded">
                      {cta.button.label}
                    </a>
                  )}
                </div>
              </div>
              <div className="col-lg-5 mt-5 mt-lg-0 d-none d-lg-block">
                <img src={asset(cta.image)} alt="" className="img-fluid" />
              </div>
            </div>
          </div>
        </section>
      )}

      {h.schedule?.enable && <Schedule />}

      {h.sponsor?.enable && <Sponsors data={h.sponsor} />}

      {venue?.enable && (
        <section className="cta-2 section" id="venue">
          <div className="container">
            <div className="row section-heading">
              <div className="col-lg-6">
                <div className="heading">
                  <span className="stroke-text" aria-hidden="true">Venue</span>
                </div>
              </div>
              <div className="col-lg-12">
                <div className="cta-img">
                  <img src={asset(venue.image)} alt="" className="img-fluid" />
                  <div className="contact-info box-shadow">
                    <Html as="h5" className="text-uppercase letter-spacing mb-4" html={md(venue.title)} />
                    <h6 className="text-color mb-3">{venue.date}</h6>
                    <Html as="p" className="lead" html={md(venue.location)} />
                    {venue.button?.enable && (
                      <a href={href(venue.button.link)}>
                        <i className="tf-ion-ios-location mr-2"></i>
                        {venue.button.label}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
