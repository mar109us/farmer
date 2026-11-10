import * as THREE from "three";
import { drawChunk } from "./tiles.js";

const EYE_HEIGHT = 1.6;
const SKY_COLOR = 0x87ceeb;
const FIELD_OF_VIEW = 70;
const NEAREST_VISIBLE = 0.1;
const FARTHEST_VISIBLE = 1000;

function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY_COLOR);
  return scene;
}

function createCamera() {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(
    FIELD_OF_VIEW,
    aspectRatio,
    NEAREST_VISIBLE,
    FARTHEST_VISIBLE,
  );
  camera.rotation.order = "YXZ";
  return camera;
}

function addLights(scene) {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  const sunlight = new THREE.DirectionalLight(0xffffff, 2);
  sunlight.position.set(10, 20, 5);
  scene.add(ambientLight);
  scene.add(sunlight);
}

function createRenderer() {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  return renderer;
}

function updateCamera(camera, player) {
  camera.position.set(player.x, EYE_HEIGHT, player.y);
  camera.rotation.set(player.pitch, player.yaw, 0);
}

export function createWorldView(state) {
  const scene = createScene();
  const camera = createCamera();
  const renderer = createRenderer();

  addLights(scene);
  drawChunk(scene, state);
  document.getElementById("game").appendChild(renderer.domElement);

  return {
    scene: scene,
    camera: camera,
    renderer: renderer,
  };
}

export function drawFrame(view, player) {
  updateCamera(view.camera, player);
  view.renderer.render(view.scene, view.camera);
}
