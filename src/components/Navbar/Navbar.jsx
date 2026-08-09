import { NavLink, useLocation } from "react-router-dom";
import Icon from "../Icon/Icon.jsx";
import "./Navbar.scss";

export default function Navbar() {
  const { pathname } = useLocation();
  const isPhotography = pathname.startsWith("/photography");

  return (
    <nav className={`navbar${isPhotography ? " navbar--dark" : ""}`}>
      <NavLink to="/" className="navbar__brand">
        <span className="navbar__title">
          <span className="red-text">&lt;P</span>epeligroso{" "}
          <span className="red-text">/&gt;</span>
        </span>
        {isPhotography && <Icon variant="navbar" />}
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
