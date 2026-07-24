import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowDimensions from "../../utilities/useWindowDimensions.jsx";
import "./Photography.scss";

// Country + photo data — placeholders (Lorem Picsum) until real photos are
// supplied per country. Structure (heights/aspects/camera/date cycles)
// mirrors the Claude Design reference so swapping in real `src` values later
// is a drop-in replacement.
// Content only — no layout info here. Adding a country just means adding a
// row; the grid (CSS columns, see Photography.scss) sizes each tile to its
// own cover photo's aspect ratio automatically.
//
// `photoUrls` is optional, temporary bootstrapping: while photos are added
// to Cloudinary one country at a time by hand, list the real URLs here for
// that country. Once tag-based listing is wired up, this goes away and every
// country's photos come from Cloudinary directly — no code changes needed.
const AUSTRIA_PHOTO_URLS = [
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838673/16-DSC04892_lipizf.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838673/15-DSC04893_q1or6k.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838672/14-DSC04897_owynj2.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838671/11-DSC05007_kkxqhv.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838672/12-DSC05000_wgwf9n.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838670/9-DSC05014_oqqhoz.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838670/10-DSC05010_wau4dx.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838670/8-DSC05019_tayrb2.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838668/6-DSC05033_gxh49g.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838668/5-DSC05037_fmzppp.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838668/7-DSC05031_ouo4t8.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838667/4-DSC05046_wj58q8.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838667/3-DSC05048_imj39w.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838667/2-DSC05074_tdpgjl.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784838667/1-DSC05077_idqazj.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784837702/DSC05061_2_jrtjht.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784837700/DSC05057_1_p0uxmg.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784837699/DSC05005_3_b306u0.jpg",
  "https://res.cloudinary.com/dsiqjkgaw/image/upload/v1784837698/DSC04888_3_df71bv.jpg",
];

const COUNTRY_DEFS = [
  { name: "Ecuador", city: "Quito", slug: "ecuador" },
  { name: "Colombia", city: "Bogotá", slug: "colombia" },
  { name: "Austria", city: "Vienna", slug: "austria", photoUrls: AUSTRIA_PHOTO_URLS },
  { name: "Bolivia", city: "La Paz", slug: "bolivia" },
  { name: "Italia", city: "Roma", slug: "italia" },
  { name: "México", city: "Ciudad de México", slug: "mexico" },
];
const PHOTOS_PER_COUNTRY = 20;
const HEIGHTS = [500, 380, 480, 340, 490, 400, 460, 320];
const ASPECTS = ["3/4", "4/5", "1/1", "5/4", "4/3"];
const CAMERAS = ["Sony A7 III", "Fujifilm X100V", "Canon EOS R6", "DJI Mavic 3"];
const YEARS = [2021, 2022, 2023, 2024];

// Inserts a Cloudinary transformation (format/quality/width) into a delivery
// URL. No-op for non-Cloudinary URLs (e.g. the Picsum placeholders), so a
// country can mix real and mock photos safely.
function cloudinaryUrl(url, transform) {
  if (!url.includes("res.cloudinary.com")) return url;
  return url.replace("/image/upload/", `/image/upload/${transform}/`);
}

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
    const urls =
      c.photoUrls ??
      Array.from(
        { length: PHOTOS_PER_COUNTRY },
        (_, i) => `https://picsum.photos/seed/${c.slug}${i}/900/1200`
      );
    const photos = urls.map((url, i) => ({
      id: i,
      height: HEIGHTS[i % HEIGHTS.length],
      aspect: ASPECTS[i % ASPECTS.length],
      location: `${c.city}, ${c.name}`,
      date: YEARS[(i + ci) % YEARS.length],
      camera: CAMERAS[(i + ci) % CAMERAS.length],
      // Small variant for the grid cover, filmstrip and thumbnails — those
      // never render wider than a few hundred px. Full variant only for the
      // lightbox, the one place photos are shown large.
      thumbSrc: cloudinaryUrl(url, "f_auto,q_auto,w_700"),
      src: cloudinaryUrl(url, "f_auto,q_auto,w_1600"),
    }));
    return {
      ...c,
      // Real cover aspect ratio — the CSS column layout sizes each tile to
      // this, so the mosaic reads as photo-driven rather than grid-driven.
      coverAspect: ASPECTS[Math.floor(Math.random() * ASPECTS.length)],
      photoCount: photos.length,
      coverSrc: photos[0].thumbSrc,
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
  const { pageWidth } = useWindowDimensions();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  // The <img> keeps showing its previous bitmap until the new src finishes
  // loading, which reads as "the swipe/click did nothing". This tracks
  // whether the current lightbox photo has finished loading so we can show
  // a loader over the stale image instead.
  const [photoLoading, setPhotoLoading] = useState(true);

  // On mobile there's no separate filmstrip page — a country opens straight
  // into the lightbox, which doubles as the whole gallery experience there.
  const isMobile = pageWidth < 700;

  const view = slug ? "gallery" : "grid";
  const country = slug ? COUNTRIES.find((c) => c.slug === slug) || null : null;
  const lightboxOpen = !!country && lightboxIndex !== null;
  const lightboxPhoto = lightboxOpen ? country.photos[lightboxIndex] : null;

  const openCountry = (countrySlug) => navigate(`/photography/${countrySlug}`);
  const backToGrid = () => navigate("/photography");
  const openLightbox = (idx) => setLightboxIndex(idx);
  // On mobile, closing the lightbox means leaving the country entirely —
  // there's no filmstrip underneath to fall back to.
  const closeLightbox = () => (isMobile ? backToGrid() : setLightboxIndex(null));
  const nextPhoto = () =>
    setLightboxIndex((i) => (i + 1) % country.photos.length);
  const prevPhoto = () =>
    setLightboxIndex((i) => (i - 1 + country.photos.length) % country.photos.length);

  // Swipe to change photo (mobile lightbox has no arrows, only this + the
  // thumbnail carousel). A horizontal-dominant drag past the threshold
  // changes photo; anything more vertical is left alone so it can scroll.
  const touchStartRef = useRef(null);
  const SWIPE_THRESHOLD = 50;
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD) {
      if (dx < 0) nextPhoto();
      else prevPhoto();
    }
  };

  useEffect(() => {
    setPhotoLoading(true);
  }, [lightboxIndex]);

  useEffect(() => {
    // Deep link to an unknown country slug — fall back to the grid instead
    // of rendering an empty gallery.
    if (slug && !country) navigate("/photography", { replace: true });
  }, [slug, country, navigate]);

  useEffect(() => {
    setLightboxIndex(isMobile && slug ? 0 : null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, isMobile]);

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

          {!isMobile && (
            <>
              <div className="photography__gallery-title">{country.name}</div>

              <div className="photography__filmstrip">
                {country.photos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="photography__filmstrip-item"
                    style={{ height: photo.height + "px", aspectRatio: photo.aspect }}
                    onClick={() => openLightbox(i)}
                  >
                    <img src={photo.thumbSrc} alt={photo.location} loading="lazy" />
                  </div>
                ))}
              </div>
            </>
          )}

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
                <div
                  className="photography__lightbox-stage"
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  {!isMobile && (
                    <button
                      className="photography__lightbox-nav photography__lightbox-nav--prev"
                      onClick={prevPhoto}
                      aria-label="Previous photo"
                    >
                      ‹
                    </button>
                  )}
                  <div className="photography__lightbox-frame">
                    <img
                      src={lightboxPhoto.src}
                      alt={lightboxPhoto.location}
                      onLoad={() => setPhotoLoading(false)}
                    />
                    {photoLoading && (
                      <div className="photography__lightbox-loader" aria-hidden="true" />
                    )}
                  </div>
                  {!isMobile && (
                    <button
                      className="photography__lightbox-nav photography__lightbox-nav--next"
                      onClick={nextPhoto}
                      aria-label="Next photo"
                    >
                      ›
                    </button>
                  )}
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
                      <img src={photo.thumbSrc} alt={photo.location} loading="lazy" />
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
