import "./Icon.scss";
import { useEffect, useRef } from "react";

import avatar from "../../../public/assets/images/avatars.svg";
import avatarNoEyes from "../../../public/assets/images/avatar-no-eyes.svg";
import eye from "../../../public/assets/images/eye.png";
import useWindowDimensions from "../../utilities/useWindowDimensions.jsx";

// Por debajo de esto no hay puntero que seguir, así que se usa el avatar
// plano (que ya trae los ojos dibujados) en vez del que los sigue.
const POINTER_BREAKPOINT = 768;

export default function Icon({ variant = "hero" }) {
  const { pageWidth } = useWindowDimensions();
  const containerRef = useRef(null);
  const tracksPointer = pageWidth > POINTER_BREAKPOINT;

  useEffect(() => {
    if (!tracksPointer) return;
    const container = containerRef.current;
    // Solo los ojos de ESTA instancia: con el ícono en el hero y en el
    // navbar a la vez, un querySelectorAll global movería los dos con el
    // mismo anchor.
    const eyes = container.querySelectorAll(".icon__eye");

    let animationFrameId = null;

    function angle(cx, cy, ex, ey) {
      return (Math.atan2(ey - cy, ex - cx) * 180) / Math.PI;
    }

    const handleMouseMove = (ev) => {
      if (animationFrameId) return;
      animationFrameId = requestAnimationFrame(() => {
        animationFrameId = null;
        // El rect se lee en cada frame, no una vez al montar: el ícono del
        // hero se mueve con el scroll y el del navbar con el resize, y un
        // rect cacheado hace que los ojos apunten a donde el ícono estaba.
        const rect = container.getBoundingClientRect();
        const deg = angle(
          ev.clientX,
          ev.clientY,
          rect.left + rect.width / 2,
          rect.top + rect.height / 2
        );
        eyes.forEach((el) => {
          el.style.transform = `rotate(${270 + deg}deg)`;
        });
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [tracksPointer]);

  const isNavbar = variant === "navbar";

  return (
    <div
      ref={containerRef}
      className={`icon__container icon__container--${variant}`}
      // En el navbar el ícono va dentro del link que ya dice "Pepeligroso",
      // así que para un lector de pantalla es decorativo.
      aria-hidden={isNavbar || undefined}
    >
      <div className="icon__art">
        <img
          className="icon"
          src={tracksPointer ? avatarNoEyes : avatar}
          alt={isNavbar ? "" : "icon of a bald person with beard and a hoodie"}
        />
        {tracksPointer && (
          <div className="icon__eyes-container">
            <img className="icon__eye icon__eye--left" src={eye} alt="" />
            <img className="icon__eye icon__eye--right" src={eye} alt="" />
          </div>
        )}
      </div>
    </div>
  );
}
