/*
    // Patern Normal

    Patern UnrealBloom
    Patern Afterimage
    Patern Sobel
    Patern Distortion
    Patern MatCap
    Patern DotScreen
 */
//Postprocessing Common

import { resizeHandler } from "./utils";

if (module.hot) {
  module.hot.accept();
}

import texture from "data-url:../img/texture.jpg";

import * as THREE from "three";
import gsap, { Quart } from "gsap";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { LuminosityShader } from "three/examples/jsm/shaders/LuminosityShader";
import { AfterimagePass } from "three/examples/jsm/postprocessing/AfterimagePass";
import { UnrealBloomPass } from "./threeCustom/UnrealBloomPass";
import { DotScreenShader } from "three/examples/jsm/shaders/DotScreenShader";

import ua from "./ua";
import {SoberShader} from "./threeCustom/SoberShader";

const ThreeDFile = new URL("../img/3d.obj", import.meta.url);

export default class {
  constructor() {
    this.init();
  }

  init() {
    this.odeling_data = null;
    this.ua = ua;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.widthH = this.width / 2;
    this.heightH = this.height / 2;
    this.MAX_WIDTH = 1280;
    this.MAX_WIDTH_SP = 750;
    this.mouseX = this.pastMouseX = 0;
    this.mouseY = this.pastMouseY = 90;
    this.difMouseX = this.difMouseY = 0;
    this.canvasContainer = document.querySelector("#canvasContainer");
    this.canvas = this.canvasContainer.querySelector("#canvas");
    this.lines = document.querySelectorAll(".line img");
    this.paterns = {};
    this.paterns.NORMAL = "normal";
    this.paterns.DOT_SCREEN = "dot_screen";
    this.paterns.UNREAL_BLOOM = "unreal_bloom";
    this.paterns.AFTER_IMAGE = "after_image";
    this.paterns.SOBEL = "sobel";
    this.paterns.DISTORTION = "distortion";
    this.paterns.MAT_CAP = "mat_cap";
    this.currentPatern = this.paterns.UNREAL_BLOOM;
    this.cntPatern = 0;
    this.durPatern = 600;
    this.attentionScrollList = [0, 22, 11, 33];
    this.cntForScrollAttention = 0;
    this.cntForScrollAttentionInterval = 0;
    this.isScrollAnimationInterval = false;
    this.boxList = [];
    this.objectResponseListPC = [
      0.001, //box1
      0.003, //box2
      0.005, //box3
      0.008, //pipe
    ];
    this.objectResponseListSP = [
      0.01, //box1
      0.03, //box2
      0.05, //box3
      0.08, //pipe
    ];
    this.loadOBJ();
  }
  loadOBJ() {
    const sc = this;
    const loader = new OBJLoader();
    loader.load(
      ThreeDFile.href,
      function (object) {
        sc.modeling_data = object;
        sc.loadTexture();
      },
      function (xhr) {
        // trace( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
      },
      function (error) {
        // trace( 'An error happened' );
      }
    );
  }
  loadTexture() {
    const img = new Image();

    img.onload = () => {
      this.matcap = new THREE.Texture(img);
      this.matcap.encoding = THREE.sRGBEncoding;
      this.matcap.needsUpdate = true;
      this.onLoadHandler();
    };

    img.src = texture;
  }
  onLoadHandler() {
    this.initEvents();
    this.initWebGL();
    this.resizeHandler();
    resizeHandler();
    // window.SoVeC.main.showDocument();
  }
  initEvents() {
    // this.resizeEvent = navigator.userAgent.match(/(iPhone|iPod|iPad)/) ? 'orientationchange' : 'resize';
    this.resizeEvent =
      this.ua.isTablet || this.ua.isMobile ? "orientationchange" : "resize";
    window.addEventListener(
      this.resizeEvent,
      this.resizeHandler.bind(this),
      false
    );
    this.touchCnt = 0;
    this.canvasContainer.addEventListener(
      "mousemove",
      this.mouseMoveHandler.bind(this),
      false
    );
    this.canvasContainer.addEventListener(
      "touchmove",
      this.mouseMoveHandler.bind(this),
      false
    );
    this.canvasContainer.addEventListener(
      "touchstart",
      this.mouseMoveHandler.bind(this),
      false
    );
    this.canvasContainer.addEventListener(
      "touchend",
      this.mouseMoveHandler.bind(this),
      false
    );
  }
  initWebGL() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
    }); // this.renderer.setPixelRatio(window.devicePixelRatio);

    let devicePixelRatio;
    if (this.ua.isSmartPhone) devicePixelRatio = window.devicePixelRatio;
    else devicePixelRatio = 1;
    this.renderer.setPixelRatio(devicePixelRatio); // this.renderer.setPixelRatio(1);

    this.renderer.setSize(this.width, this.height);
    this.renderer.autoClear = false; // シーンを作成

    this.scene = new THREE.Scene(); // カメラを作成
    // this.fieldOfView = 45;
    // this.defCameraZ = this.height / Math.tan(this.fieldOfView * Math.PI / 360) / 2;
    // this.cameraZ = this.defCameraZ;
    // this.camera = new THREE.PerspectiveCamera(this.fieldOfView, this.width / this.height, 1, -this.defCameraZ);
    // this.camera.position.z = this.defCameraZ;
    // this.camera = new THREE.OrthographicCamera(-480, +480, 270, -270, 1, 1000);

    this.camera = new THREE.OrthographicCamera(
      -this.widthH,
      this.widthH,
      this.heightH,
      -this.heightH,
      1,
      1000
    );
    this.ambient_light = new THREE.AmbientLight(0xbbbbbb, 1);
    this.directional_light = new THREE.DirectionalLight(0xdddddd, 1);
    this.scene.add(this.ambient_light);
    this.scene.add(this.directional_light);
    this.directional_light2 = new THREE.DirectionalLight(0xdddddd, 1);
    this.directional_light2.position.set(0, 0, 1);
    this.scene.add(this.directional_light2); // this.createMeshes();

    this.initComposer();
    this.enterFrame();
  }
  createMeshes() {
    const sc = this;

    if (this.boxList.length > 0) {
      for (let i = 0, len = this.boxList.length; i < len; i++) {
        let box = this.boxList[i];
        this.scene.remove(box);
        box.geometry.dispose();
        box.material.dispose();
        box = null;
      }

      if (this.material) this.material.dispose();
      this.boxList.length = 0;
    } //Normal Material

    this.material_normal = new THREE.MeshLambertMaterial({
      color: 0x333333,
    }); //Material for Unreal bloom

    this.material_for_unreal_bloom = new THREE.MeshPhongMaterial({
      color: 0x333333,
      wireframe: false,
    }); //Material for Matcap

    this.material_for_matcap = new THREE.MeshMatcapMaterial({
      color: 0xbbbbbb,
      matcap: this.matcap,
    }); //Material for Distortion

    this.material_for_distortion = new THREE.MeshLambertMaterial({
      color: 0x333333,
      wireframe: false,
    });
    this.material = this.material_for_unreal_bloom;
    this.materialShader = null;
    this.twistCnt = 0;
    this.inputTwist = null;
    this.difTwist = 0;

    this.material_for_distortion.onBeforeCompile = function (shader) {
      const UniformsUtils = THREE.UniformsUtils;
      const UniformsLib = THREE.UniformsLib;
      const Color = THREE.Color; //MeshPhongMaterial用uniformsをベースにしている

      const uniforms = UniformsUtils.merge([
        UniformsLib.common, // UniformsLib.specularmap,
        // UniformsLib.envmap,
        // UniformsLib.aomap,
        // UniformsLib.lightmap,
        // UniformsLib.emissivemap,
        // UniformsLib.bumpmap,
        UniformsLib.normalmap, // UniformsLib.displacementmap,
        // UniformsLib.gradientmap,
        // UniformsLib.fog,
        UniformsLib.lights,
        {
          emissive: {
            value: new Color(0x000000),
          },
          specular: {
            value: new Color(0x111111),
          },
          shininess: {
            value: 30,
          },
          twistType: {
            type: "i",
            value: 0,
          },
          twistTime: {
            type: "f",
            value: 1.0,
          },
          twistHeight: {
            type: "f",
            value: 1.0,
          },
          twistAngleDegMax: {
            type: "f",
            value: 90.0,
          },
        },
      ]);
      shader.uniforms = uniforms;
      shader.uniforms.twistType.value = 0; // shader.uniforms.twistTime.value = -3.0;

      shader.uniforms.twistTime.value = 0.5;
      shader.uniforms.twistHeight.value = 70.0;
      shader.uniforms.twistAngleDegMax.value = 360.0;
      const customShader = [
        // twist uniforms
        "uniform int twistType;",
        "uniform float twistTime;",
        "uniform float twistHeight;",
        "uniform float twistAngleDegMax;",
        "vec4 twist( vec4 pos, float t )",
        "{",
        "float st = sin(t);",
        "float ct = cos(t);",
        "vec4 new_pos;",
        "if (twistType == 0){",
        "new_pos.x = pos.x * ct - pos.z * st;",
        "new_pos.z = pos.x * st + pos.z * ct;",
        "new_pos.y = pos.y;",
        "}else if (twistType == 1){",
        "new_pos.y = pos.y * ct - pos.z * st;",
        "new_pos.z = pos.y * st + pos.z * ct;",
        "new_pos.x = pos.x;",
        "}else{",
        "new_pos.y = pos.y * ct - pos.x * st;",
        "new_pos.x = pos.y * st + pos.x * ct;",
        "new_pos.z = pos.z;",
        "}",
        "new_pos.w = pos.w;",
        "return( new_pos );",
        "}\n",
      ].join("\n");
      shader.vertexShader = customShader + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        [
          "float angleDeg = twistAngleDegMax * sin(twistTime);",
          "float angleRad = angleDeg * 3.14159 / 180.0;",
          "float angle = (twistHeight * 0.5 + position.y) / twistHeight * angleRad;",
          "vec4 twistedPosition = twist(vec4( position, 1.0 ), angle);",
          "vec4 mvPosition = modelViewMatrix * twistedPosition;", // 'vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );',
          "gl_Position = projectionMatrix * mvPosition;",
        ].join("\n")
      );
      sc.materialShader = shader;
    };

    let windowWidth = window.innerWidth;
    if (windowWidth < 1280 && windowWidth > 750) windowWidth = 1280;
    let ratio;
    if (windowWidth <= 750) {
      ratio = windowWidth / this.MAX_WIDTH_SP;
      this.setMeshPositionForSP(ratio);
    } else {
      ratio = windowWidth / this.MAX_WIDTH;
      if (ratio > 1) ratio = 1;
      this.setMeshPositionForPC(ratio);
    }
  }
  setMeshPositionForPC(ratio) {
   /* for (let i = 0; i < 3; i++) {
      let geometry = null;
      let box_width = null;
      if (i === 0) box_width = 277;
      // else if (i === 1) box_width = 321;
      else box_width = 274;
      geometry = new THREE.BoxGeometry(
        box_width * ratio,
        54 * ratio,
        54 * ratio
      );
      const box = new THREE.Mesh(geometry, this.material);
      box.userData.speed = 0.0003 /!*+ 0.002 * i*!/;
      box.position.x = -133 + i * 330;
      box.position.y = -13.6;
      box.position.z = -272;
      box.position.x *= ratio;
      box.position.y *= ratio;
      box.position.z *= ratio;
      // if (i === 1) box.rotation.z = this.d2r(45);
      // if (i === 2) box.rotation.z = this.d2r(90);
      this.boxList.push(box);
      this.scene.add(box);
    }*/

    const pipe = this.modeling_data;
    pipe.rotation.x = this.d2r(90);
    pipe.rotation.y = 0;
    pipe.rotation.z = 0;
    pipe.position.x = -8;
    pipe.position.y = 0;
    pipe.position.z = -800;
    pipe.position.x *= ratio;
    pipe.position.y *= ratio;
    pipe.position.z *= ratio;
    // pipe.position.z = -800;

    pipe.scale.x = 0.634;
    pipe.scale.y = 0.634;
    pipe.scale.z = 0.634;
    pipe.children[0].material = this.material;
    pipe.userData.speed = 0.002;
    this.scene.add(pipe);
  }
  setMeshPositionForSP(ratio) {
    const boxPositionList = [
      {
        x: 164,
        y: 188,
      },
      {
        x: -150,
        y: -140,
      },
      {
        x: 179,
        y: -140,
      },
    ];

   /* for (let i = 0; i < 3; i++) {
      let geometry = void 0;
      let box_width = void 0;
      if (i === 0) box_width = 277;
      else if (i === 1) box_width = 321;
      else box_width = 274;
      geometry = new THREE.BoxGeometry(
        box_width * ratio,
        54 * ratio,
        54 * ratio
      );
      const box = new THREE.Mesh(geometry, this.material);
      box.userData.speed = 0.0003 + 0.002 * i;
      box.position.x = boxPositionList[i].x;
      box.position.y = boxPositionList[i].y;
      box.position.z = -272;
      box.position.x *= ratio;
      box.position.y *= ratio;
      box.position.z *= ratio;
      if (i === 1) box.rotation.z = this.d2r(45);
      if (i === 2) box.rotation.z = this.d2r(90);
      this.boxList.push(box);
      this.scene.add(box);
    }*/

    const pipe = this.modeling_data;
    pipe.rotation.x = this.d2r(90);
    pipe.rotation.y = 0;
    pipe.rotation.z = 0;
    pipe.position.x = 0;
    pipe.position.y = 0;
    pipe.position.z = -800;
    pipe.position.x *= ratio;
    pipe.position.y *= ratio;
    pipe.position.z *= ratio;
    pipe.scale.x = 1 * ratio;
    pipe.scale.y = 1 * ratio;
    pipe.scale.z = 1 * ratio;
    pipe.children[0].material = this.material;
    pipe.userData.speed = 0.001;
    this.scene.add(pipe);
  }
  initComposer() {
    //DotScreenShader Postprocessing
    this.composer_dotscreen = new EffectComposer(this.renderer);
    this.composer_dotscreen.addPass(new RenderPass(this.scene, this.camera));
    const effect = new ShaderPass(DotScreenShader);
    if (this.ua.isSmartPhone) effect.uniforms["scale"].value = 2;
    else effect.uniforms["scale"].value = 4;
    this.composer_dotscreen.addPass(effect);

    this.composer_sobel = new EffectComposer(this.renderer);
    this.composer_sobel.addPass(new RenderPass(this.scene, this.camera));
    const effectGrayScale = new ShaderPass(LuminosityShader);
    this.composer_sobel.addPass(effectGrayScale);
    this.effectSobel = new ShaderPass(SoberShader);
    this.effectSobel.uniforms["resolution"].value.x =
      this.width * window.devicePixelRatio;
    this.effectSobel.uniforms["resolution"].value.y =
      this.height * window.devicePixelRatio;
    this.composer_sobel.addPass(this.effectSobel);

    //Unreal bloom Postprocessing
    const params = {
      exposure: 1,
      bloomStrength: 1.7,
      bloomThreshold: 0.1,
      bloomRadius: 1,
    };
    this.composer_unreal_bloom = new EffectComposer(this.renderer);
    this.composer_unreal_bloom.addPass(new RenderPass(this.scene, this.camera));
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.5,
      0.4,
      0.85
    );
    bloomPass.threshold = params.bloomThreshold;
    bloomPass.strength = params.bloomStrength;
    bloomPass.radius = params.bloomRadius;
    this.composer_unreal_bloom.addPass(bloomPass);

    //Afterimage Postprocessing
    this.composer_after_image = new EffectComposer(this.renderer);
    this.composer_after_image.addPass(new RenderPass(this.scene, this.camera));
    this.afterimagePass = new AfterimagePass();
    this.composer_after_image.addPass(this.afterimagePass);
    this.afterimagePass.uniforms["damp"].value = 0.96;
  }
  d2r(d) {
    return (d * Math.PI) / 180;
  }
  mouseMoveHandler(event) {
    let clientX, clientY;

    if (event.type.indexOf("touch") === 0) {
      // event.preventDefault();
      const touches = event.changedTouches[0];
      clientX = touches.clientX;
      clientY = touches.clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const currentX = (clientX - this.widthH) / 2;
    const currentY = (clientY - this.heightH) / 2; // if(currentX == this.mouseX && currentY == this.mouseY) return;

    this.pastMouseX = this.mouseX;
    this.pastMouseY = this.mouseY;

    if (event.type === "touchstart") {
      //touchstartしたタイミングのclientYを過去のmouseYに代入しておく
      this.pastMouseY = event.changedTouches[0].clientY;
    } else if (event.type === "touchend") {
      //touchCntをリセット
      this.touchCnt = 0;
    }

    this.mouseX = currentX;
    this.mouseY = currentY;
    this.difMouseX = this.pastMouseX - this.mouseX;
    this.difMouseY = this.pastMouseY - this.mouseY;

    if (event.type.indexOf("touch") === 0) {
      this.touchCnt++; //下にスワイプ以外はpreventDefault

      if (this.difMouseY <= 0) event.preventDefault(); //.5秒touchmoveしたらpreventDefault

      if (this.touchCnt > 30) event.preventDefault();
    }
  }
  resizeHandler(event) {
    /*        if ('orientation' in window) {
                this.orientationAngle = window.orientation;
            }*/
    const sc = this;

    if (event && event.type === "orientationchange") {
      setTimeout(function () {
        sc.resize();
      }, 100);
    } else this.resize();
  }
  resize() {
    this.width = window.innerWidth;
    if (this.width < 1280 && this.width > 750) this.width = 1280;
    this.height = window.innerHeight;
    this.widthH = this.width / 2;
    this.heightH = this.height / 2;
    this.camera.aspect = this.width / this.height;
    this.camera.left = -this.widthH;
    this.camera.right = this.widthH;
    this.camera.top = this.heightH;
    this.camera.bottom = -this.heightH;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height); //Sobel Postprocessing

    this.effectSobel.uniforms["resolution"].value.x =
      this.width * window.devicePixelRatio;
    this.effectSobel.uniforms["resolution"].value.y =
      this.height * window.devicePixelRatio;
    this.composer_dotscreen.setSize(this.width, this.height);
    this.composer_sobel.setSize(this.width, this.height);
    this.composer_unreal_bloom.setSize(this.width, this.height);
    this.composer_after_image.setSize(this.width, this.height);
    let ratio;

    for (let i = 0, len = this.lines.length; i < len; i++) {
      const line = this.lines[i];
      if (line.style.opacity === "") line.style.opacity = 1;

      if (i === 0) {
        ratio = this.width / this.MAX_WIDTH;
        if (ratio > 1) ratio = 1;
        line.style.transform = "scale(" + ratio + ")";
       /* line.style.marginTop = 27 * ratio + "px";
        line.style.marginLeft = -47 * ratio + "px";*/
      } else {
        ratio = this.width / this.MAX_WIDTH_SP;
        if (ratio > 1) ratio = 1;
        line.style.transform = "scale(" + ratio + ")";
        /*line.style.marginTop = -50 * ratio + "px";
        line.style.marginLeft = -4 * ratio + "px";*/
      }
    }

    this.createMeshes(); // this.bg.style.width = this.width * ratio + 'px';
    // this.bg.style.height = this.height * ratio + 'px';
  }
  enterFrame() {
    let responseList;
    if (this.ua.isTablet || this.ua.isMobile)
      responseList = this.objectResponseListSP;
    else responseList = this.objectResponseListPC;

    for (let i = 0, len = this.boxList.length; i < len; i++) {
      const box = this.boxList[i];

     /* if (i === 0) {
        box.rotation.x +=
          (this.d2r(-this.mouseX) - box.rotation.x) * responseList[0];
        box.rotation.y += box.userData.speed;
        box.rotation.z +=
          (this.d2r(-this.mouseY) - box.rotation.z) * responseList[0];
      } else if (i === 1) {
        box.rotation.x += box.userData.speed;
        box.rotation.y +=
          (this.d2r(-this.mouseY) - box.rotation.y) * responseList[1];
        box.rotation.z +=
          (this.d2r(-this.mouseX) - box.rotation.z) * responseList[1];
      } else {
        box.rotation.x +=
          (this.d2r(-this.mouseY) - box.rotation.x) * responseList[2];
        box.rotation.y +=
          (this.d2r(-this.mouseX) - box.rotation.y) * responseList[2];
        box.rotation.z += box.userData.speed;
      }*/
     /* box.rotation.x +=
        (this.d2r(-this.mouseY) - box.rotation.x) * responseList[2];
      box.rotation.y +=
        (this.d2r(-this.mouseX) - box.rotation.y) * responseList[2];
      box.rotation.z += box.userData.speed;*/
    }

    this.modeling_data.rotation.x +=
      (this.d2r(-this.mouseX) - this.modeling_data.rotation.x) *
      responseList[3];
    this.modeling_data.rotation.y += this.modeling_data.userData.speed;
    this.modeling_data.rotation.z +=
      (this.d2r(-this.mouseY) - this.modeling_data.rotation.z) *
      responseList[3]; //For distortion

    if (this.currentPatern === this.paterns.DISTORTION) {
      if (this.materialShader) {
        let difMouse, inputTwist;
        if (Math.abs(this.difMouseX) > Math.abs(this.difMouseY))
          difMouse = this.difMouseX;
        else difMouse = this.difMouseY;
        inputTwist = difMouse; //SPの場合

        if (this.ua.isMobile) {
          inputTwist *= 2; //twistTypeが0の場合

          if (this.materialShader.uniforms.twistType.value === 0)
            inputTwist *= 2;
        }

        this.materialShader.uniforms.twistTime.value +=
          (inputTwist / 200 - this.materialShader.uniforms.twistTime.value) /
          10;

        if (this.twistCnt >= 900) {
          this.twistCnt = 0;
          this.materialShader.uniforms.twistType.value = 0;
        } else if (this.twistCnt === 300) {
          this.materialShader.uniforms.twistType.value = 1;
        } else if (this.twistCnt === 600) {
          this.materialShader.uniforms.twistType.value = 2;
        }

        this.twistCnt++;
      }
    }

    if (
      this.currentPatern === this.paterns.NORMAL ||
      this.currentPatern === this.paterns.MAT_CAP ||
      this.currentPatern === this.paterns.DISTORTION
    )
      this.renderer.render(this.scene, this.camera);
    else if (this.currentPatern === this.paterns.DOT_SCREEN)
      this.composer_dotscreen.render();
    else if (this.currentPatern === this.paterns.SOBEL)
      this.composer_sobel.render();
    else if (this.currentPatern === this.paterns.UNREAL_BLOOM) {
      this.composer_unreal_bloom.render();
    } else if (this.currentPatern === this.paterns.AFTER_IMAGE)
      this.composer_after_image.render();
    requestAnimationFrame(this.enterFrame.bind(this));
    this.cntPatern++;

    if (this.cntPatern === this.durPatern - 10) {
      this.shake();
    }

    if (this.cntPatern >= this.durPatern) {
      this.changePattern();
      this.cntPatern = 0;
    }

    this.animateScroll();
    // window.SoVeC.main.enterframe();
  }
  shake() {
    for (let i = 0, len = this.boxList.length; i < len; i++) {
      const box = this.boxList[i];
      const _r = box.rotation;
      gsap.to(_r, 1, {
        y: box.rotation.y + Math.PI / 2,
        ease: Quart.easeOut,
      });
    }

    const pipe = this.modeling_data;
    const r = pipe.rotation;
    gsap.to(r, 1, {
      y: pipe.rotation.y + Math.PI / 2,
      ease: Quart.easeOut,
    });
  }
  changePattern() {
    if (this.currentPatern === this.paterns.UNREAL_BLOOM) {
      this.currentPatern = this.paterns.AFTER_IMAGE;
      this.material = this.material_for_unreal_bloom;
      this.adaptMaterial();
    } else if (this.currentPatern === this.paterns.AFTER_IMAGE) {
      this.currentPatern = this.paterns.SOBEL;
      this.material = this.material_normal;
      this.adaptMaterial();
    } else if (this.currentPatern === this.paterns.SOBEL) {
      this.currentPatern = this.paterns.DISTORTION;
      this.material = this.material_for_distortion;
      this.adaptMaterial();
    } else if (this.currentPatern === this.paterns.DISTORTION) {
      this.currentPatern = this.paterns.MAT_CAP;
      this.material = this.material_for_matcap;
      this.adaptMaterial();
    } else if (this.currentPatern === this.paterns.MAT_CAP) {
      this.currentPatern = this.paterns.DOT_SCREEN;
      this.material = this.material_normal;
      this.adaptMaterial();
    } else if (this.currentPatern === this.paterns.DOT_SCREEN) {
      this.currentPatern = this.paterns.UNREAL_BLOOM;
    }
  }
  adaptMaterial() {
    for (let i = 0, len = this.boxList.length; i < len; i++) {
      const box = this.boxList[i];
      box.material = this.material;
    }

    this.modeling_data.children[0].material = this.material;
  }
  animateScroll() {
    if (this.isScrollAnimationInterval) {
      this.cntForScrollAttentionInterval++;

      if (this.cntForScrollAttentionInterval >= 120) {
        this.isScrollAnimationInterval = false;
        this.cntForScrollAttentionInterval = 0;
      }

      return;
    }

    this.cntForScrollAttention++;
    if (this.cntForScrollAttention % 4 !== 0) return;

    for (let i = 0; i < 4; i++) {
      const icon = document.querySelector(".attention .icon" + (i + 1));
      let y = this.attentionScrollList[i];
      if (y === 0) y = 33;
      else if (y === 22) y = 0;
      else if (y === 11) y = 22;
      else if (y === 33) y = 11;
      this.attentionScrollList[i] = y;
      icon.style.backgroundPositionX = y + "px";
    }

    if (this.cntForScrollAttention === 32) {
      this.cntForScrollAttention = 0;
      this.isScrollAnimationInterval = true;
    }
  }
}
