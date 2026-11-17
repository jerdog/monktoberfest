import Html from "./Html";
import { asset, href, md } from "@/lib/content";

export default function Sponsors({ data }) {
  return (
    <section className="section sponsors" id="sponsors">
      <div className="container">
        <div className="row section-heading">
          <div className="col-lg-6">
            <div className="heading">
              <span className="stroke-text" aria-hidden="true">{data.title_outline}</span>
              <div className="pl-90">
                <Html as="h2" className="text-black" html={md(data.title)} />
              </div>
            </div>
            {data.sponsorship?.enable && (
              <div className="row">
                <div className="col-lg-12">
                  <Html as="h3" className="text-black mt-5 mb-4" html={md(data.sponsorship.title)} />
                  <a href={href(data.sponsorship.link)} className="btn btn-hero btn-rounded">
                    {data.sponsorship.label}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
        {(data.sponsor_group ?? []).map((group, i) => (
          <div key={i} className="row mb-5">
            <div className="col-lg-8">
              <Html as="h4" className="mb-4 letter-spacing text-md" style={{ color: "#cf2e2e" }} html={md(group.title)} />
            </div>
            <div className="col-lg-12">
              {(group.sponsor ?? []).map((sponsor, j) => {
                const img = <img src={asset(sponsor.logo)} alt={sponsor.name || sponsorName(sponsor)} className="img-fluid" />;
                return (
                  <div key={j} className="client-item">
                    {sponsor.link && sponsor.link !== "#" ? <a href={sponsor.link}>{img}</a> : img}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Fallback accessible name when an editor leaves "Name" empty: the website's domain. */
function sponsorName(sponsor) {
  try {
    return new URL(sponsor.link).hostname.replace(/^www\./, "");
  } catch {
    return "Sponsor";
  }
}
