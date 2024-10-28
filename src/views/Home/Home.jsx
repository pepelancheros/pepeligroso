import avatar from "../../../public/assets/images/avatars.svg";
import pepeSad from "../../../public/assets/images/pepe-sad.png";
import arrow from "../../../public/assets/images/arrow.png";
import dicapta from "../../../public/assets/images/logo-dicapta.png";
import githubExplorer from "../../../public/assets/images/github-explorer.png";

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
          <a
            href="#contact"
            className="tusker-font home__button home__button--banner"
          >
            CONTACT ME
          </a>
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
      <section className="portfolio">
        <h2 className="tusker-font portfolio__title home__subtitle">
          FEATURED WORKS
        </h2>
        <p className="portfolio__subtitle">
          Some work and personal projects that I have done
        </p>
        <div className="portfolio__content-container">
          <a
            href="https://dicapta.netlify.app/"
            rel="noopener noreferrer"
            target="_blank"
            className="portfolio__element-container"
          >
            <img src={dicapta} alt="dicapta logo" />
            <p>
              Website development, frontend, Vue.js, Vue Router, CMS integration
            </p>
          </a>
          <a
            href="https://indexes.morningstar.com/"
            rel="noopener noreferrer"
            target="_blank"
            className="portfolio__element-container"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/67/Morningstar_Logo.svg"
              alt="morningstar logo"
            />
            <p>
              Website development, frontend, Vue.js, robust page, CMS
              integration, design
            </p>
          </a>
          <a href="" className="portfolio__element-container">
            <img
              src="https://cdn.prod.website-files.com/605f2547102fdbbeff1b21e0/60eef7c33281b745d059ca69_proper.png"
              alt="proper logo"
            />
            <p>
              Website and chrome extension development, Vue.js, CMS integration
            </p>
          </a>
          <a
            href="https://github-explorer-with-react.netlify.app/"
            rel="noopener noreferrer"
            target="_blank"
            className="portfolio__element-container portfolio__element-container--github-explorer"
          >
            <img src={githubExplorer} alt="github explorer logo" />
            <p>
              Website development, frontend, React.js, React Router, REST API
            </p>
          </a>
        </div>
      </section>
      <section className="contact" id="contact">
        <div className="contact__container">
          <h2 className="tusker-font contact__title home__subtitle">
            LET'S CONNECT
          </h2>
          <p className="contact__subtitle">
            If you have any questions or want to work together, feel free to
            contact me, I'm always interested in:
          </p>
        </div>
        <ul className="contact__list">
          <li className="contact__list-element">
            WEB DEVELOPMENT
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            WEB DESIGN
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            SMALL BUSINESSES
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            STARUPS
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            FREELANCE
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
        </ul>
        <ul className="contact__list scroll-reverse">
          <li className="contact__list-element">
            PHOTOGRAPHY
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            VIDEOGRAPHY
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            DRONES
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            VIDEO AND PHOTO EDITING
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
          <li className="contact__list-element">
            TRAVELING
            <span className="contact__star material-symbols-outlined">
              stars
            </span>
          </li>
        </ul>
        <div className="contact__container">
          <div className="contact__text-and-button-container">
            <p className="contact__text">Are you minding a project?</p>
            <a
              href="mailto:pepe.lancheros@gmail.com"
              className="tusker-font home__button"
            >
              CONTACT ME
            </a>
          </div>
          <div className="contact__social-media">
            <a
              href="https://github.com/pepelancheros"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg"
                alt="github logo"
              />
              <p>pepelancheros</p>
            </a>
            <a
              href="https://www.linkedin.com/in/sebastian-lancheros/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/e8/Linkedin-logo-blue-In-square-40px.png"
                alt="linkedin logo"
              />
              <p>Sebastian Lancheros</p>
            </a>
            <a
              href="https://www.instagram.com/pepeligroso_/"
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
                alt="instagram logo"
              />
              <p>@pepeligroso_</p>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
