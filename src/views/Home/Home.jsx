import avatar from "../../../public/assets/images/avatars.svg";
import pepeSad from "../../../public/assets/images/pepe-sad.png";
import arrow from "../../../public/assets/images/arrow.png";

import skillsJson from "../../mocked/skillsMocked.json";
const skills = skillsJson.skills;

import "./Home.scss";

export function HomeView() {
  return (
    <main className="home">
      <section className="home__banner">
        <img
          className="home__main-icon"
          src={avatar}
          alt="icon of a bald person with beard and a hoodie"
        />
        <div className="home__banner-info-container">
          <div className="home__title-container">
            <span className="tusker-font home__creative-text">creative</span>
            <h1 className="home__title red-text">FRONTEND DEVELOPER</h1>
          </div>
          <p className="home__description">
            based in Colombia with more than 5 years of experience building
            pixel-perfect, accessible and user friendly websites.
          </p>
          <a className="tusker-font home__button">CONTACT ME</a>
        </div>
      </section>
      <section className="about">
        <h2 className="tusker-font home__subtitle">HELLO, I'M PEPE</h2>
        <div className="about__description-container">
          <p className="about__description">
            Actually, my name is Sebastian, but friends call me Pepe, please
            call me Pepe. I've always been a person that likes to create. This
            has let me involve in different things in life, like studying
            electronics engineering, photography and becoming a self taught
            frontend developer. Welcome to my site, I use my passion and skills
            to create so I hope you find something interesting in this journey.
          </p>
          <div className="about__images-container">
            <div>
              <img className="about__arrow" src={arrow} alt="" />
              <p className="tusker-font about__pepe-text">
                Not this one, though
              </p>
            </div>
            <img
              className="about__pepe-image"
              src={pepeSad}
              alt="Pepe the frog crying. An internet meme of a green anthropomorphic frog with a humanoid body."
            />
          </div>
        </div>
      </section>
      <section className="skills">
        <h2 className="tusker-font skills__title home__subtitle skills__title">
          SKILLS, TOOLS AND TECHNOLOGIES
        </h2>
        <p className="skills__subtitle">I am really good at</p>
        <div className="skills__container">
          {skills.map((skill) => (
            <div className="skills__skill">
              <img className="skills__skill-image" src={skill.src} alt="" />
              <p className="skills__skill-name">{skill.name}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
