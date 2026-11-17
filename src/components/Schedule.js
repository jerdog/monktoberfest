import Html from "./Html";
import ScheduleTabs from "./ScheduleTabs";
import { asset, getData, md } from "@/lib/content";

export default function Schedule() {
  const s = getData("schedule")?.schedule;
  if (!s) return null;
  const tabs = (s.schedule_tab ?? []).map((tab) => ({
    title: md(tab.title),
    dateTime: md(tab.date_time),
    items: (tab.schedule_items ?? []).map((item) => ({
      time: item.time ?? "",
      image: asset(item.image),
      content: md(item.content),
    })),
  }));

  return (
    <section className="section-schedule section" id="schedule">
      <div className="container">
        <div className="row section-heading">
          <div className="col-lg-10">
            <div className="heading">
              <span className="stroke-text">{s.title_outline}</span>
              <div className="pl-90">
                <Html as="h2" className="mt-2" html={md(s.title)} />
                <Html as="p" html={md(s.content)} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <ScheduleTabs tabs={tabs} />
          </div>
        </div>
      </div>
    </section>
  );
}
