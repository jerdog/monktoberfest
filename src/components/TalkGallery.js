import VideoCard from "./VideoCard";
import { youtubeId } from "@/lib/markdown";

/** Talk list for one year: thumbnail grid, play in place. */
export default function TalkGallery({ talks, headingLevel = 2 }) {
  const H = `h${headingLevel}`;
  return (
    <ul className="talk-grid list-unstyled">
      {talks.map((talk, i) => {
        const id = youtubeId(talk.video);
        const name = talk.title || talk.speaker;
        const label = talk.title ? `${talk.title}, by ${talk.speaker}` : talk.speaker;
        return (
          <li key={`${i}-${talk.speaker}`} className="talk-card">
            <VideoCard id={id} label={label} />
            <div className="talk-card__body">
              <H className="talk-card__title">{name}</H>
              {talk.title && <p className="talk-card__speaker">{talk.speaker}</p>}
              {id && (
                <a className="talk-card__link" href={`https://www.youtube.com/watch?v=${id}`} rel="noopener">
                  Watch on YouTube<span className="sr-only">: {label}</span>
                  <span aria-hidden="true"> ↗</span>
                </a>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
