# TODO

- [ ] Watermark on the lightbox's large photo (`src`, not thumbnails) — subtle text or logo, bottom-right corner, semi-transparent. Applied via a Cloudinary URL transform, no backend needed.

## Cleanup — dead code, all confirmed unused

- [ ] Remove `$color-blue-300` from `_variables.scss` — 0 uses outside its own declaration.
- [ ] Remove `webpackmockup.config.js` — not referenced from `package.json` or anywhere in `src/`.
- [ ] Decide on `$size-640/768/896/1024` — also 0 uses, but unlike the two above these may be deliberate: they complete the spacing scale, and deleting them leaves gaps (`…384, 512, 1280`) that read stranger than four unused tokens. Leaning keep.

## Design system

- [ ] `.photography__hero-title` asks for `font-weight: 700`, but TuskerGrotesk ships a single face declared `normal`, so the browser fakes the bold. It is the only synthetic weight left on the site. Fix it alongside the rewrite of the "VISUAL STORIES" copy. See `DESIGN_SYSTEM.md` §1.1.
