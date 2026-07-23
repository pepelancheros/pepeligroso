import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Photography.scss";

// Country + photo data — placeholders (Lorem Picsum) until real photos are
// supplied per country. Structure (heights/aspects/camera/date cycles)
// mirrors the Claude Design reference so swapping in real `src` values later
// is a drop-in replacement.
// Content only — no layout info here. Adding a country just means adding a
// row; the grid (CSS columns, see Photography.scss) sizes each tile to its
// own cover photo's aspect ratio automatically.
const COUNTRY_DEFS = [
  { name: "Ecuador", city: "Quito", slug: "ecuador" },
  { name: "Colombia", city: "Bogotá", slug: "colombia" },
  { name: "Austria", city: "Vienna", slug: "austria" },
  { name: "Bolivia", city: "La Paz", slug: "bolivia" },
  { name: "Italia", city: "Roma", slug: "italia" },
  { name: "México", city: "Ciudad de México", slug: "mexico" },
];
const PHOTOS_PER_COUNTRY = 20;
const HEIGHTS = [500, 380, 480, 340, 490, 400, 460, 320];
const ASPECTS = ["3/4", "4/5", "1/1", "5/4", "4/3"];
const CAMERAS = ["Sony A7 III", "Fujifilm X100V", "Canon EOS R6", "DJI Mavic 3"];
const YEARS = [2021, 2022, 2023, 2024];

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildCountries() {
  const withPhotos = COUNTRY_DEFS.map((c, ci) => {
    const photos = Array.from({ length: PHOTOS_PER_COUNTRY }, (_, i) => ({
      id: i,
      height: HEIGHTS[i % HEIGHTS.length],
      aspect: ASPECTS[i % ASPECTS.length],
      location: `${c.city}, ${c.name}`,
      date: YEARS[(i + ci) % YEARS.length],
      camera: CAMERAS[(i + ci) % CAMERAS.length],
      src: `https://picsum.photos/seed/${c.slug}${i}/900/1200`,
    }));
    return {
      ...c,
      // Real cover aspect ratio — the CSS column layout sizes each tile to
      // this, so the mosaic reads as photo-driven rather than grid-driven.
      coverAspect: ASPECTS[Math.floor(Math.random() * ASPECTS.length)],
      photoCount: photos.length,
      coverSrc: photos[0].src,
      photos,
    };
  });
  // Reshuffle tile order on every page load so the mosaic re-flows.
  return shuffle(withPhotos);
}

const COUNTRIES = buildCountries();

export function PhotographyView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const view = slug ? "gallery" : "grid";
  const country = slug ? COUNTRIES.find((c) => c.slug === slug) || null : null;
  const lightboxOpen = !!country && lightboxIndex !== null;
  const lightboxPhoto = lightboxOpen ? country.photos[lightboxIndex] : null;

  const openCountry = (countrySlug) => navigate(`/photography/${countrySlug}`);
  const backToGrid = () => navigate("/photography");
  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);
  const nextPhoto = () =>
    setLightboxIndex((i) => (i + 1) % country.photos.length);
  const prevPhoto = () =>
    setLightboxIndex((i) => (i - 1 + country.photos.length) % country.photos.length);

  useEffect(() => {
    // Deep link to an unknown country slug — fall back to the grid instead
    // of rendering an empty gallery.
    if (slug && !country) navigate("/photography", { replace: true });
  }, [slug, country, navigate]);

  useEffect(() => {
    setLightboxIndex(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) closeLightbox();
        else if (view === "gallery") backToGrid();
      } else if (lightboxIndex !== null) {
        if (e.key === "ArrowRight") nextPhoto();
        if (e.key === "ArrowLeft") prevPhoto();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, lightboxIndex, slug]);

  return (
    <main className="photography">
      {view === "grid" && (
        <>
          <section className="photography__hero">
            <p className="photography__hero-eyebrow">Through my eyes</p>
            <h1 className="photography__hero-title">
              VISUAL <span className="red-text">STORIES</span>
            </h1>
            <p className="photography__hero-description">
              I find life in traveling with my camera — a
              collection of places, stories and memories.
            </p>
          </section>

          <div className="photography__grid">
            {COUNTRIES.map((c) => (
              <div
                key={c.slug}
                className="photography__tile"
                style={{ aspectRatio: c.coverAspect }}
                onClick={() => openCountry(c.slug)}
              >
                <img
                  className="photography__tile-img"
                  src={c.coverSrc}
                  alt={c.name}
                  loading="lazy"
                />
                <div className="photography__tile-overlay">
                  <div className="photography__tile-text">
                    <div className="photography__tile-name">{c.name}</div>
                    <div className="photography__tile-cta">See Project →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <section className="photography__contact">
            <h2 className="photography__contact-title">
              LET'S WORK TOGETHER
            </h2>
            <p className="photography__contact-text">
              Looking for a photographer for your project, event, or brand?
              Get in touch and let's create something.
            </p>
            <a
              href="mailto:pepe.lancheros@gmail.com"
              className="photography__contact-btn"
            >
              SEND ME AN EMAIL
            </a>
          </section>
        </>
      )}

      {view === "gallery" && country && (
        <div className="photography__gallery">
          <div className="photography__gallery-topbar">
            <button className="photography__back" onClick={backToGrid}>
              <span>←</span>
              <span>Back</span>
            </button>
          </div>

          <div className="photography__gallery-title">{country.name}</div>

          <div className="photography__filmstrip">
            {country.photos.map((photo, i) => (
              <div
                key={photo.id}
                className="photography__filmstrip-item"
                style={{ height: photo.height + "px", aspectRatio: photo.aspect }}
                onClick={() => openLightbox(i)}
              >
                <img src={photo.src} alt={photo.location} loading="lazy" />
              </div>
            ))}
          </div>

          {lightboxOpen && (
            <div className="photography__lightbox" onClick={closeLightbox}>
              <div
                className="photography__lightbox-inner"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="photography__lightbox-close"
                  onClick={closeLightbox}
                  aria-label="Close"
                >
                  ×
                </button>
                <div className="photography__lightbox-stage">
                  <button
                    className="photography__lightbox-nav photography__lightbox-nav--prev"
                    onClick={prevPhoto}
                    aria-label="Previous photo"
                  >
                    ‹
                  </button>
                  <div
                    className="photography__lightbox-frame"
                    style={{ aspectRatio: lightboxPhoto.aspect }}
                  >
                    <img src={lightboxPhoto.src} alt={lightboxPhoto.location} />
                  </div>
                  <button
                    className="photography__lightbox-nav photography__lightbox-nav--next"
                    onClick={nextPhoto}
                    aria-label="Next photo"
                  >
                    ›
                  </button>
                </div>
                <div className="photography__lightbox-info">
                  {lightboxPhoto.location} — {lightboxPhoto.date} —{" "}
                  {lightboxPhoto.camera}
                </div>
                <div className="photography__thumbrow photography__thumbrow--lightbox">
                  {country.photos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className={`photography__thumb${
                        i === lightboxIndex ? " photography__thumb--active" : ""
                      }`}
                      onClick={() => openLightbox(i)}
                    >
                      <img src={photo.src} alt={photo.location} loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
