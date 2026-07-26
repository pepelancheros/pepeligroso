import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowDimensions from "../../utilities/useWindowDimensions.jsx";
import "./Photography.scss";

// Content only — no layout or photo info here. Photos come from Cloudinary
// at runtime, tagged with the country's slug (see fetchTaggedPhotos below).
// Adding a country still means adding a row here (Cloudinary has no public,
// unsigned way to say "list every tag that exists" — only "list resources
// for this known tag" — so we can't auto-discover new slugs without a
// backend). Once a slug is listed here, tagging its photos is enough to make
// it appear; a country with nothing tagged yet is simply skipped.
const COUNTRY_DEFS = [
  { name: "Austria", city: "Vienna", slug: "austria" },
  { name: "Hungary", city: "Budapest", slug: "hungary" },
];
const HEIGHTS = [500, 380, 480, 340, 490, 400, 460, 320];
const CAMERAS = ["Sony A7 III", "Fujifilm X100V", "Canon EOS R6", "DJI Mavic 3"];
const YEARS = [2021, 2022, 2023, 2024];

const CLOUDINARY_CLOUD_NAME = "dsiqjkgaw";

// Builds a Cloudinary delivery URL with a transformation from a resource
// returned by the tag-list API below.
function cloudinaryDeliveryUrl(resource, transform) {
  const { public_id: publicId, format, version } = resource;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/v${version}/${publicId}.${format}`;
}

// Lists every image tagged `tag` via Cloudinary's unsigned "resource list by
// tag" endpoint. Requires that setting to be turned on in the Cloudinary
// account (Settings → Security → Resource list) and photos to be tagged
// with the country's slug — until then, or for a country with nothing
// tagged, this returns [] and the caller falls back to mock photos.
async function fetchTaggedPhotos(tag) {
  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${tag}.json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.resources || []).sort((a, b) =>
      a.created_at.localeCompare(b.created_at)
    );
  } catch {
    return [];
  }
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildRealPhotos(resources, c, ci) {
  return resources.map((r, i) => ({
    id: r.public_id,
    // Real aspect ratio from Cloudinary — the filmstrip/grid size each tile
    // to this, so the layout is genuinely photo-driven, not just labeled so.
    aspect: `${r.width}/${r.height}`,
    height: HEIGHTS[i % HEIGHTS.length],
    location: `${c.city}, ${c.name}`,
    date: YEARS[(i + ci) % YEARS.length],
    camera: CAMERAS[(i + ci) % CAMERAS.length],
    thumbSrc: cloudinaryDeliveryUrl(r, "f_auto,q_auto,w_700"),
    src: cloudinaryDeliveryUrl(r, "f_auto,q_auto,w_1600"),
  }));
}

async function buildCountries() {
  const withPhotos = await Promise.all(
    COUNTRY_DEFS.map(async (c, ci) => {
      const resources = await fetchTaggedPhotos(c.slug);
      if (!resources.length) return null;
      const photos = buildRealPhotos(resources, c, ci);
      return {
        ...c,
        coverAspect: photos[0].aspect,
        photoCount: photos.length,
        coverSrc: photos[0].thumbSrc,
        photos,
      };
    })
  );
  // Reshuffle tile order on every page load so the mosaic re-flows.
  return shuffle(withPhotos.filter(Boolean));
}

// Fetches + builds the country/photo list once per page load (not once per
// component mount — Fast Refresh aside, this component only mounts once).
function useCountries() {
  const [countries, setCountries] = useState(null);

  useEffect(() => {
    let cancelled = false;
    buildCountries().then((result) => {
      if (!cancelled) setCountries(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return countries;
}

export function PhotographyView() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { pageWidth } = useWindowDimensions();
  const countries = useCountries();
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
  const country =
    slug && countries ? countries.find((c) => c.slug === slug) || null : null;
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
    // Warm the browser cache for the next/previous photo so swiping feels
    // instant instead of starting the download only once it's requested.
    if (!lightboxOpen || !country) return;
    const total = country.photos.length;
    [(lightboxIndex + 1) % total, (lightboxIndex - 1 + total) % total].forEach(
      (idx) => {
        const img = new Image();
        img.src = country.photos[idx].src;
      }
    );
  }, [lightboxOpen, country, lightboxIndex]);

  useEffect(() => {
    // Deep link to an unknown country slug — fall back to the grid instead
    // of rendering an empty gallery. Wait for countries to finish loading
    // first, otherwise every direct link would bounce before data arrives.
    if (slug && countries && !country) navigate("/photography", { replace: true });
  }, [slug, countries, country, navigate]);

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

          {countries ? (
            <div className="photography__grid">
              {countries.map((c) => (
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
          ) : (
            <div className="photography__loader" aria-hidden="true" />
          )}

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
                    {photoLoading && (
                      <img
                        key={`thumb-${lightboxPhoto.id}`}
                        className="photography__lightbox-frame-thumb"
                        src={lightboxPhoto.thumbSrc}
                        alt=""
                        aria-hidden="true"
                      />
                    )}
                    <img
                      key={`full-${lightboxPhoto.id}`}
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
