import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.scss";

export default function Navbar() {
  const { pathname } = useLocation();
  const isPhotography = pathname.startsWith("/photography");

  return (
    <nav className={`navbar${isPhotography ? " navbar--dark" : ""}`}>
      <NavLink to="/" className="navbar__title">
        <span className="red-text">&lt;P</span>epeligroso{" "}
        <span className="red-text">/&gt;</span>
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
