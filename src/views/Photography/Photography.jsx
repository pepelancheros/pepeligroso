import { useState } from "react";
import AOS from "aos";
import { useEffect } from "react";
import "./Photography.scss";

// Photo data — replace src URLs with your own images when ready.
// Using Unsplash as placeholders (landscape, street, portrait, drone categories).
const photos = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    caption: "Mountain horizon",
    location: "Colombia",
    category: "landscape",
    aspectRatio: "tall",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80",
    caption: "City lights",
    location: "Bogotá",
    category: "street",
    aspectRatio: "wide",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1542359649-31e03cd4d909?w=800&q=80",
    caption: "Aerial perspective",
    location: "Colombia",
    category: "drone",
    aspectRatio: "wide",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&q=80",
    caption: "Morning light",
    location: "Andes",
    category: "landscape",
    aspectRatio: "tall",
  },
  {
    id: 5,
    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=80",
    caption: "Urban geometry",
    location: "Medellín",
    category: "street",
    aspectRatio: "wide",
  },
  {
    id: 6,
    src: "https://images.unsplash.com/photo-1531804028550-a6fb2c7ab1ea?w=800&q=80",
    caption: "Above the clouds",
    location: "Colombia",
    category: "drone",
    aspectRatio: "tall",
  },
  {
    id: 7,
    src: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80",
    caption: "Golden hour",
    location: "Cartagena",
    category: "landscape",
    aspectRatio: "wide",
  },
  {
    id: 8,
    src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
    caption: "Street perspective",
    location: "Bogotá",
    category: "street",
    aspectRatio: "tall",
  },
  {
    id: 9,
    src: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&q=80",
    caption: "Forest canopy",
    location: "Amazonia",
    category: "drone",
    aspectRatio: "wide",
  },
  {
    id: 10,
    src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    caption: "Rocky summit",
    location: "Sierra Nevada",
    category: "landscape",
    aspectRatio: "tall",
  },
  {
    id: 11,
    src: "https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80",
    caption: "Night market",
    location: "Cali",
    category: "street",
    aspectRatio: "wide",
  },
  {
    id: 12,
    src: "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800&q=80",
    caption: "River delta",
    location: "Colombia",
    category: "drone",
    aspectRatio: "tall",
  },
];

const CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "landscape", label: "LANDSCAPE" },
  { id: "street", label: "STREET" },
  { id: "drone", label: "DRONE" },
];

export function PhotographyView() {
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    AOS.init({ once: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const filtered =
    activeCategory === "all"
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  return (
    <main className="photography">
      {/* Hero */}
      <section className="photography__hero">
        <p className="photography__hero-eyebrow">Through the lens</p>
        <h1 className="tusker-font photography__hero-title">
          VISUAL <span className="red-text">STORIES</span>
        </h1>
        <p className="photography__hero-description">
          Beyond code, I find beauty in light and composition. Landscapes,
          urban life and aerial views from around Colombia and the world.
        </p>
      </section>

      {/* Category filters */}
      <div className="photography__categories">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`photography__category-btn ${
              activeCategory === cat.id ? "photography__category-btn--active" : ""
            }`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry Gallery */}
      <section className="photography__gallery">
        {filtered.map((photo, i) => (
          <div
            key={photo.id}
            className="photography__gallery-item"
            data-aos="fade-up"
            data-aos-delay={Math.min(i * 60, 400)}
            data-aos-duration="600"
          >
            <img
              className="photography__gallery-img"
              src={photo.src}
              alt={photo.caption}
              loading="lazy"
            />
            <div className="photography__gallery-overlay">
              <p className="photography__gallery-caption">{photo.caption}</p>
              <p className="photography__gallery-location">{photo.location}</p>
            </div>
          </div>
        ))}
      </section>

      {/* About photography */}
      <section className="photography__about">
        <h2 className="tusker-font photography__about-title">
          CAPTURING <span style={{ color: "#a41623" }}>MOMENTS</span>
        </h2>
        <p className="photography__about-text">
          Photography has always been part of how I see the world. From
          studying electronics to building websites, the eye for detail carries
          through — every frame is a problem to solve, a story to tell.
          <br />
          <br />
          I shoot landscapes, street scenes, and drone footage mainly across
          Colombia. Always looking for the next interesting light.
        </p>
        <div className="photography__about-tags">
          {["LANDSCAPE", "STREET", "DRONE", "VIDEOGRAPHY", "COLOMBIA"].map(
            (tag) => (
              <span key={tag} className="photography__about-tag">
                {tag}
              </span>
            )
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="photography__contact">
        <h2 className="tusker-font photography__contact-title">
          LET'S WORK TOGETHER
        </h2>
        <p className="photography__contact-text">
          Looking for a photographer for your project, event, or brand? Get in
          touch and let's create something.
        </p>
        <a
          href="mailto:pepe.lancheros@gmail.com"
          className="tusker-font photography__contact-btn"
        >
          SEND ME AN EMAIL
        </a>
      </section>
    </main>
  );
}
