import * as THREE from "three";
import { CHUNK_SIZE } from "../data/definitions.js";
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

function createCamera(player) {
  const aspectRatio = window.innerWidth / window.innerHeight;
  const camera = new THREE.PerspectiveCamera(
    FIELD_OF_VIEW,
    aspectRatio,
    NEAREST_VISIBLE,
    FARTHEST_VISIBLE,
  );
  const chunkCentre = CHUNK_SIZE / 2;
  camera.position.set(player.x, EYE_HEIGHT, player.y);
  camera.lookAt(chunkCentre, 0, chunkCentre);
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

export function renderWorld(state) {
  const scene = createScene();
  const camera = createCamera(state.player);
  const renderer = createRenderer();

  addLights(scene);
  drawChunk(scene, state);

  document.getElementById("game").appendChild(renderer.domElement);
  renderer.render(scene, camera);
}
