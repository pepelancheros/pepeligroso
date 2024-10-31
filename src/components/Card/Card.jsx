import "./Card.scss";

export default function Card(props) {
  return (
    <a
      className="card"
      rel="noopener noreferrer"
      target="_blank"
      href={props.link}
    >
      <div
        className="card__interactive-bg"
        style={{ backgroundColor: props.bgColor }}
      ></div>
      <img className="card__image" src={props.img} alt="" />
      <p className="card__text">{props.text}</p>
      {!props.hideLinkText && (
        <p className="card__text card__text--black">
          <small>Click to see the website</small>
        </p>
      )}
    </a>
  );
}
