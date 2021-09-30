import ua from "./ua";
import Visual from "./visual";
// import "../css/normalize.css"
import "../css/visual.css";
import { resizeHandler, touchManager } from "./utils";

if (module.hot) {
  module.hot.accept();
}

window.SoVeC = window.SoVeC || {};
window.SoVeC.ua = ua;
window.SoVeC.main = {};

function initEvents() {
  if (!ua.isTablet && !ua.isMobile) {
    // document.querySelector("#wrap").style.position = "fixed";
    window.addEventListener("resize", resizeHandler);
  } else {
    window.addEventListener("touchstart", touchManager.touchStartHandler);
    window.addEventListener("touchend", touchManager.touchEndHandler);
    window.addEventListener("touchmove", touchManager.touchMoveHandler);
  }
}

const init = () => {
  initEvents();
  resizeHandler();
};

init();
new Visual();
