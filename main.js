import "./style.css";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// ==========================
// SCENE
// ==========================
const scene = new THREE.Scene();

// ==========================
// CAMERA
// ==========================
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);

// ==========================
// RENDERER
// ==========================
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(15, 0, 30);

// ==========================
// BACKGROUND + FOG
// ==========================
scene.background = new THREE.Color(0x0a0e27);
scene.fog = new THREE.Fog(0x0a0e27, 50, 100);

// ==========================
// LIGHTING
// ==========================
scene.add(new THREE.AmbientLight(0x4a90e2, 0.3));

const spotlight1 = new THREE.PointLight(0x00ffff, 2, 50);
spotlight1.position.set(20, 10, 10);
scene.add(spotlight1);

const spotlight2 = new THREE.PointLight(0xff006e, 1.5, 50);
spotlight2.position.set(-20, -10, 5);
scene.add(spotlight2);

// ==========================
// AVATAR
// ==========================
const avatar = new THREE.Mesh(
  new THREE.CircleGeometry(6, 64),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("/images/myface.png"),
    transparent: true,
  }),
);
avatar.position.set(30, 0, 5);
scene.add(avatar);

const ring = new THREE.Mesh(
  new THREE.RingGeometry(6.3, 6.7, 64),
  new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
  }),
);
ring.position.set(30, 0, 4.9);
scene.add(ring);

// ==========================
// DNA HELIX
// ==========================
const helixPoints = [];
for (let i = 0; i < 200; i++) {
  const y = (i / 200) * 30 - 15;
  const angle = (i / 200) * Math.PI * 8;

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
    }),
  );

  sphere.position.set(Math.cos(angle) * 3 - 15, y, Math.sin(angle) * 3);
  helixPoints.push(sphere);
  scene.add(sphere);
}

// ==========================
// PARTICLES
// ==========================
const particles = [];
for (let i = 0; i < 150; i++) {
  const p = new THREE.Mesh(
    new THREE.TetrahedronGeometry(0.3),
    new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? 0x00ffff : 0xff006e,
      emissive: Math.random() > 0.5 ? 0x00ffff : 0xff006e,
      emissiveIntensity: 0.7,
    }),
  );

  const angle = Math.random() * Math.PI * 2;
  const radius = 15 + Math.random() * 25;

  p.userData = { angle, radius, speed: 0.001 + Math.random() * 0.003 };
  p.position.set(
    Math.cos(angle) * radius,
    THREE.MathUtils.randFloatSpread(40),
    Math.sin(angle) * radius,
  );

  particles.push(p);
  scene.add(p);
}

// ==========================
// STARS
// ==========================
const starGeo = new THREE.BufferGeometry();
const starVerts = [];
for (let i = 0; i < 3000; i++) {
  starVerts.push(
    THREE.MathUtils.randFloatSpread(200),
    THREE.MathUtils.randFloatSpread(200),
    THREE.MathUtils.randFloatSpread(200),
  );
}
starGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVerts, 3),
);
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ size: 0.7 })));

// ==========================
// 🚀 ROCKET
// ==========================
const rocket = new THREE.Mesh(
  new THREE.PlaneGeometry(5, 8),
  new THREE.MeshBasicMaterial({
    map: new THREE.TextureLoader().load("/images/rocket.png"),
    transparent: true,
  }),
);
rocket.position.set(27, -10, 20);
scene.add(rocket);

// ==========================
// 👽 UFO (GLB)
// ==========================
const loader = new GLTFLoader();
let ufo;

loader.load("/models/ufo.glb", (gltf) => {
  ufo = gltf.scene;

  ufo.scale.set(3, 3, 3);
  ufo.position.set(-10, 5, 0);

  // 🔥 UFO internal light
  const ufoLight = new THREE.PointLight(0x88ffff, 1.5, 20);
  ufoLight.position.set(0, 2, 0);
  ufo.add(ufoLight);

  scene.add(ufo);
});

// ==========================
// SCROLL
// ==========================
document.body.onscroll = () => {
  const t = document.body.getBoundingClientRect().top;
  camera.position.y = t * -0.008;
  ring.rotation.z = t * 0.001;
};

// ==========================
// ANIMATE
// ==========================
let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  particles.forEach((p) => {
    p.userData.angle += p.userData.speed;
    p.position.x = Math.cos(p.userData.angle) * p.userData.radius;
    p.position.z = Math.sin(p.userData.angle) * p.userData.radius;
  });

  helixPoints.forEach((p, i) => (p.rotation.y = time + i * 0.01));

  rocket.position.y += 0.12;
  rocket.rotation.z = Math.sin(time * 2) * 0.015;
  if (rocket.position.y > 45) rocket.position.y = -45;

  if (ufo) {
    ufo.position.y = 5 + Math.sin(time * 1.5) * 1.2;
    ufo.rotation.y += 0.01;
  }

  renderer.render(scene, camera);
}

animate();

// ==========================
// RESIZE
// ==========================
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
