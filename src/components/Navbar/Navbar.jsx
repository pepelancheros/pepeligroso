import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Icon from "../Icon/Icon.jsx";
import "./Navbar.scss";

// El ícono del hero de Home. `Navbar` es hermano de `Routes` en App.jsx, así
// que no puede recibir una ref desde la vista y lo busca en el DOM.
const HERO_ICON_SELECTOR = ".icon__container--hero";

export default function Navbar() {
  const { pathname } = useLocation();
  const isPhotography = pathname.startsWith("/photography");
  const navRef = useRef(null);
  const [heroIconHidden, setHeroIconHidden] = useState(false);

  useEffect(() => {
    // En /photography no hay ícono en el hero, así que el del navbar va fijo.
    if (isPhotography) return;

    // Al entrar a Home se asume que el hero se ve; el observer corrige de
    // inmediato si se llegó con la página ya scrolleada.
    setHeroIconHidden(false);

    const heroIcon = document.querySelector(HERO_ICON_SELECTOR);
    if (!heroIcon) return;

    // El navbar es fijo y tapa la franja de arriba. Sin descontar su altura,
    // el ícono del hero contaría como visible mientras pasa por detrás y los
    // dos se verían al tiempo, que es justo lo que se quiere evitar.
    const navHeight = navRef.current?.getBoundingClientRect().height ?? 0;

    const observer = new IntersectionObserver(
      ([entry]) => setHeroIconHidden(!entry.isIntersecting),
      { rootMargin: `-${navHeight}px 0px 0px 0px` }
    );
    observer.observe(heroIcon);
    return () => observer.disconnect();
  }, [isPhotography, pathname]);

  const showsIcon = isPhotography || heroIconHidden;

  return (
    <nav
      ref={navRef}
      className={`navbar${isPhotography ? " navbar--dark" : ""}`}
    >
      <NavLink to="/" className="navbar__brand">
        <span className="navbar__title">
          <span className="red-text">&lt;P</span>epeligroso{" "}
          <span className="red-text">/&gt;</span>
        </span>
        <span
          className={`navbar__icon${showsIcon ? " navbar__icon--visible" : ""}`}
        >
          <Icon variant="navbar" />
        </span>
      </NavLink>
      <div className="navbar__links">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `navbar__link${isActive ? " navbar__link--active" : ""}`
          }
        >
          DEV
        </NavLink>
        <span className="navbar__separator red-text">/</span>
        <NavLink
          to="/photography"
          className={({ isActive }) =>
            `navbar__link${isActive ? " navbar__link--active" : ""}`
          }
        >
          PHOTO
        </NavLink>
      </div>
    </nav>
  );
}
