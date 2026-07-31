import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useWindowDimensions from "../../utilities/useWindowDimensions.jsx";
import "./Photography.scss";

// No per-country list here anymore — every photo gets the same shared tag
// below, and the country itself (name + slug) is derived from the Cloudinary
// folder it sits in (e.g. `photography/bolivia` → "Bolivia" / "bolivia").
// Tag a new folder's photos with PHOTOGRAPHY_TAG and it appears with zero
// code changes.
const PHOTOGRAPHY_TAG = "photography";
// Tag a photo `starred` to bump it to the front of its country's filmstrip
// (ahead of the rest, which stay in chronological order). Tag one photo per
// country `cover` to pin it as that country's grid tile — otherwise a random
// photo from the country is used.
const STARRED_TAG = "starred";
const COVER_TAG = "cover";
const HEIGHTS = [500, 380, 480, 340, 490, 400, 460, 320];
const CAMERAS = ["Sony A7 III", "Fujifilm X100V", "Canon EOS R6", "DJI Mavic 3"];

const CLOUDINARY_CLOUD_NAME = "dsiqjkgaw";

// Builds a Cloudinary delivery URL with a transformation from a resource
// returned by the tag-list API below.
function cloudinaryDeliveryUrl(resource, transform) {
  const { public_id: publicId, format, version } = resource;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transform}/v${version}/${publicId}.${format}`;
}

// Lists every image tagged `tag` via Cloudinary's unsigned "resource list by
// tag" endpoint (requires that setting on in Cloudinary: Settings → Security
// → Resource list). Returns [] if it's off or the tag has nothing on it.
async function fetchTaggedPhotos(tag) {
  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/list/${tag}.json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.resources || [];
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

// The last path segment of the asset's folder is the country slug, e.g.
// "photography/bolivia" -> "bolivia". Resources uploaded outside any
// sub-folder (asset_folder === "photography") have no country and are
// skipped rather than crashing on an empty slug.
function folderSlug(resource) {
  const segments = (resource.asset_folder || "").split("/");
  return segments.length > 1 ? segments[segments.length - 1] : null;
}

function slugToName(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

// Must match $size-640, the filmstrip item's max-width in Photography.scss.
const FILMSTRIP_MAX_WIDTH = 640;

function buildPhotos(resources, name, starredIds) {
  return [...resources]
    .sort((a, b) => {
      const aStarred = starredIds.has(a.public_id);
      const bStarred = starredIds.has(b.public_id);
      if (aStarred !== bStarred) return aStarred ? -1 : 1;
      return a.created_at.localeCompare(b.created_at);
    })
    .map((r, i) => {
      const aspectRatio = r.width / r.height;
      // A very wide (panoramic) photo simply doesn't have enough native
      // vertical resolution to fill a tall filmstrip row without the browser
      // upscaling it — that upscale is what reads as pixelation. Cap the
      // assigned height to what the photo can actually cover at its capped
      // display width, so it renders shorter instead of blurry.
      const maxHeightAtCap = FILMSTRIP_MAX_WIDTH / aspectRatio;
      const height = Math.round(
        Math.min(HEIGHTS[i % HEIGHTS.length], maxHeightAtCap)
      );
      return {
        id: r.public_id,
        // Real aspect ratio from Cloudinary — the filmstrip/grid size each
        // tile to this, so the layout is genuinely photo-driven.
        aspect: `${r.width}/${r.height}`,
        height,
        location: name,
        date: new Date(r.created_at).getFullYear(),
        camera: CAMERAS[i % CAMERAS.length],
        thumbSrc: cloudinaryDeliveryUrl(r, "f_auto,q_auto,w_1100"),
        src: cloudinaryDeliveryUrl(r, "f_auto,q_auto,w_1600"),
      };
    });
}

async function buildCountries() {
  const [resources, starredResources, coverResources] = await Promise.all([
    fetchTaggedPhotos(PHOTOGRAPHY_TAG),
    fetchTaggedPhotos(STARRED_TAG),
    fetchTaggedPhotos(COVER_TAG),
  ]);
  const starredIds = new Set(starredResources.map((r) => r.public_id));
  const coverIds = new Set(coverResources.map((r) => r.public_id));

  const bySlug = new Map();
  resources.forEach((r) => {
    const slug = folderSlug(r);
    if (!slug) return;
    if (!bySlug.has(slug)) bySlug.set(slug, []);
    bySlug.get(slug).push(r);
  });

  const countries = Array.from(bySlug, ([slug, group]) => {
    const name = slugToName(slug);
    const photos = buildPhotos(group, name, starredIds);
    // Pick randomly among the photos tagged `cover` (so re-tagging several
    // gives a different one each page load); if none are tagged, pick
    // randomly from every photo in the country instead.
    const coverCandidates = photos.filter((p) => coverIds.has(p.id));
    const coverPool = coverCandidates.length ? coverCandidates : photos;
    const coverPhoto = coverPool[Math.floor(Math.random() * coverPool.length)];
    return {
      name,
      slug,
      coverAspect: coverPhoto.aspect,
      photoCount: photos.length,
      coverSrc: coverPhoto.thumbSrc,
      photos,
    };
  });

  // Reshuffle tile order on every page load so the mosaic re-flows.
  return shuffle(countries);
}

// True masonry placement: each item goes into whichever column currently has
// the least accumulated height, using its real aspect ratio (columns share
// the same width, so 1/aspect is directly comparable across items). Avoids
// CSS column-count's balance-by-estimate, which gets lumpy with few items.
function distributeIntoColumns(countries, columnCount) {
  const columns = Array.from({ length: columnCount }, () => []);
  const heights = new Array(columnCount).fill(0);
  countries.forEach((country) => {
    const [w, h] = country.coverAspect.split("/").map(Number);
    let shortest = 0;
    for (let i = 1; i < columnCount; i++) {
      if (heights[i] < heights[shortest]) shortest = i;
    }
    columns[shortest].push(country);
    heights[shortest] += h / w;
  });
  return columns;
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

  // Matches the grid's width breakpoints (900px / 560px).
  const gridColumnCount = pageWidth <= 560 ? 1 : pageWidth <= 900 ? 2 : 3;
  const gridColumns = countries
    ? distributeIntoColumns(countries, gridColumnCount)
    : [];

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
              {gridColumns.map((column, ci) => (
                <div className="photography__grid-column" key={ci}>
                  {column.map((c) => (
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
