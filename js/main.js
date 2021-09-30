import ua from "./ua"
import Visual from "./visual";
// import "../css/normalize.css"
import "../css/visual.css"

if (module.hot) {
  module.hot.accept()
}

window.SoVeC = window.SoVeC || {};
window.SoVeC.ua = ua;

new Visual();
