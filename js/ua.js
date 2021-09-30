//-----------------
//UserAgent
//------------------
const ua = {};
const userAgent = window.navigator.userAgent.toLowerCase();
const appVersion = window.navigator.appVersion.toLowerCase();

ua.isTablet = (function () {
  const u = userAgent;
  return (
    (u.indexOf("windows") != -1 && u.indexOf("touch") != -1) ||
    u.indexOf("ipad") != -1 ||
    (u.indexOf("android") != -1 && u.indexOf("mobile") == -1) ||
    (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1) ||
    u.indexOf("kindle") != -1 ||
    u.indexOf("silk") != -1 ||
    u.indexOf("playbook") != -1
  );
})();

ua.isMobile = (function () {
  var u = userAgent;
  return (
    (u.indexOf("windows") != -1 && u.indexOf("phone") != -1) ||
    u.indexOf("iphone") != -1 ||
    u.indexOf("ipod") != -1 ||
    (u.indexOf("android") != -1 && u.indexOf("mobile") != -1) ||
    (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1) ||
    u.indexOf("blackberry") != -1
  );
})();

ua.isSmartPhone = (function () {
  var media = [
    "iphone",
    "ipod",
    "ipad",
    "android",
    "dream",
    "cupcake",
    "blackberry9500",
    "blackberry9530",
    "blackberry9520",
    "blackberry9550",
    "blackberry9800",
    "webos",
    "incognito",
    "webmate",
  ];
  var pattern = new RegExp(media.join("|"), "i");
  return pattern.test(userAgent);
})();

ua.isiPad = (function () {
  var pattern = new RegExp("ipad", "i");
  return pattern.test(userAgent);
})();

ua.isiPhone = (function () {
  var pattern = new RegExp("iphone", "i");
  return pattern.test(userAgent);
})();

ua.isiOS = (function () {
  return ua.isiPad || ua.isiPhone;
})();

ua.isWin = (function () {
  if (navigator.platform.indexOf("Win") > -1) return true;
  else return false;
})();

ua.isIE = (function () {
  var pattern = new RegExp("msie", "i");
  var pattern2 = new RegExp("trident", "i");
  return pattern.test(userAgent) || pattern2.test(userAgent);
})();

ua.isIE11 = (function () {
  var pattern = new RegExp("rv:11.0", "i");
  return pattern.test(userAgent);
})();

ua.isEdge = (function () {
  if (userAgent.indexOf("edge") >= 0) return true;
  else return false;
})();

ua.isSafari = (function () {
  if (userAgent.indexOf("chrome") != -1) return false;
  if (userAgent.indexOf("lunascape") != -1) return false;
  var pattern = new RegExp("safari", "i");
  return pattern.test(userAgent);
})();

ua.isiOSChrome = (function () {
  var pattern = new RegExp("crios", "i");
  return pattern.test(userAgent);
})();

ua.isChrome = (function () {
  var pattern = new RegExp("chrome", "i");
  return pattern.test(userAgent);
})();

ua.isFirefox = (function () {
  var pattern = new RegExp("firefox", "i");
  return pattern.test(userAgent);
})();

ua.isOpera = (function () {
  var pattern = new RegExp("opera", "i");
  return pattern.test(userAgent);
})();

ua.isIEVersion = function () {
  if (appVersion.indexOf("trident") != -1) return "ie11";
  else if (appVersion.indexOf("msie 10.") != -1) return "ie10";
  else if (appVersion.indexOf("msie 9.") != -1) return "ie9";
  else if (appVersion.indexOf("msie 8.") != -1) return "ie8";
  else if (appVersion.indexOf("msie 7.") != -1) return "ie7";
  else if (appVersion.indexOf("msie 6.") != -1) return "ie6";
  else return "ie";
};

export default ua;
