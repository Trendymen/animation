import ua from "./ua";

const wrapper = document.querySelector("#wrap");
let width;
let height;

export const resizeHandler = (() => {
  return function () {
    width = window.innerWidth;
    height = window.innerHeight;

    if (!ua.isTablet && !ua.isMobile) {
      // document.body.style.height = wrapper.clientHeight + "px";
    }

    if (width > PC_MIN_W) {
      var dif = width - PC_MIN_W;
      var logo_bg_base_posi_x = 99;
      var adjust_x = logo_bg_base_posi_x + dif / 2;
      var target = document.querySelector("#wrap footer .child2 .logo"); // target.style.backgroundPositionX = adjust_x + 'px';
    }
  };
})();

export const touchManager = new (class {
  constructor() {
    this.touchStartY = null;
    this.touchMoveY = null;
    this.touchEndY = null;
  }
  touchStartHandler(event) {
    this.touchStartY = event.changedTouches[0].clientY;
  }
  touchMoveHandler(event) {
    this.touchMoveY = event.changedTouches[0].clientY;
  }
  touchEndHandler(event) {
    this.touchEndY = event.changedTouches[0].clientY;
  }
})();

export const PC_MIN_W = 1280;

export default {
  resizeHandler,
};
