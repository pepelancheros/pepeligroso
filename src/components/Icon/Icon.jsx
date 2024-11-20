import "./icon.scss";
import { useEffect } from "react";

import avatar from "../../../public/assets/images/avatars.svg";
import avatarNoEyes from "../../../public/assets/images/avatar-no-eyes.svg";
import eye from "../../../public/assets/images/eye.png";
import useWindowDimensions from "../../utilities/useWindowDimensions.jsx";

export default function icon() {
  const { pageWidth } = useWindowDimensions();

  useEffect(() => {
    const eyes = document.querySelectorAll(".icon__eye");
    const anchor = document.getElementById("anchor");
    const rekt = anchor.getBoundingClientRect();
    const anchorX = rekt.left + rekt.width / 2;
    const anchorY = rekt.top + rekt.height / 2;

    let animationFrameId;

    const handleMouseMove = (ev) => {
      if (animationFrameId) return; // Prevent multiple frames

      animationFrameId = requestAnimationFrame(() => {
        const mouseX = ev.clientX;
        const mouseY = ev.clientY;
        const angleDeg = angle(mouseX, mouseY, anchorX, anchorY);

        eyes.forEach((eye) => {
          eye.style.transform = `rotate(${270 + angleDeg}deg)`;
        });

        animationFrameId = null; // Reset the animation frame ID
      });
    };

    function angle(cx, cy, ex, ey) {
      const dy = ey - cy;
      const dx = ex - cx;
      const rad = Math.atan2(dy, dx);
      const deg = (rad * 180) / Math.PI;
      return deg;
    }

    document.addEventListener("mousemove", handleMouseMove);

    // Cleanup function to remove the event listener
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Cancel any pending animation frame
      }
    };
  }, []); // Empty dependency array to run only on mount and unmount

  return (
    <div id="anchor" className="icon__container">
      <img
        id="icon"
        className="icon"
        src={pageWidth < 768 ? avatar : avatarNoEyes}
        alt="icon of a bald person with beard and a hoodie"
      />
      {pageWidth > 768 && (
        <div className="icon__eyes-container">
          <img className="icon__eye icon__eye--left" src={eye} alt="" />
          <img className="icon__eye icon__eye--right" src={eye} alt="" />
        </div>
      )}
    </div>
  );
}
