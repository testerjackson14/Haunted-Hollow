import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { VRButton } from 'three/addons/webxr/VRButton.js';

const $ = (id) => document.getElementById(id);
const gameRoot = $('game');

let scene, camera, renderer, clock;
let worldGroup, charmGroup, gateGroup, reticle;
let charms = [];
let collected = 0;
let started = false;
let arPlaced = false;
let arMode = false;
let hitTestSource = null;
let hitTestSourceRequested = false;
let audioContext = null;
let soundOn = false;
let toastTimer = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const keys = new Set();
const clues = [
  'The first charm is close to the old stone path. Follow the warm orange glow.',
  'Look around the crooked trees. The Hollow likes to hide its light among the branches.',
  'A little purple sparkle is waiting near the grave markers.',
  'The charms are scattered around the clearing. Turn slowly and look near the ground.',
  'One last charm remains. Trust the glow, not the shadows.'
];
let clueIndex = 0;

init();
buildWorld();
buildCharms();
buildGate();
setupUI();
setupAR();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x100b22);
  scene.fog = new THREE.FogExp2(0x100b22, 0.035);

  camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.05, 100);
  camera.position.set(0, 1.7, 7.8);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight);
  renderer.xr.enabled = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  gameRoot.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  worldGroup = new THREE.Group();
  charmGroup = new THREE.Group();
  gateGroup = new THREE.Group();
  scene.add(worldGroup, charmGroup, gateGroup);

  scene.add(new THREE.HemisphereLight(0xc5b7ff, 0x24132b, 1.65));
  const moon = new THREE.DirectionalLight(0x9aaaff, 2.1);
  moon.position.set(-4, 8, 5);
  scene.add(moon);
  const warm = new THREE.PointLight(0xff7a35, 25, 18, 2);
  warm.position.set(0, 2.2, -1);
  scene.add(warm);

  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  window.addEventListener('keydown', (e) => {
    keys.add(e.key.toLowerCase());
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('resize', onResize);
}

function mat(color, roughness = 0.8, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, ...extra });
}
function addMesh(parent, geometry, material, pos, scale = null) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...pos);
  if (scale) mesh.scale.set(...scale);
  parent.add(mesh);
  return mesh;
}

function buildWorld() {
  // Dusky ground and a subtle path
  addMesh(worldGroup, new THREE.PlaneGeometry(80, 80), mat(0x171328), [0, -0.06, 0]).rotation.x = -Math.PI / 2;
  const path = addMesh(worldGroup, new THREE.PlaneGeometry(2.5, 25), mat(0x34243b), [0, -0.045, -4]);
  path.rotation.x = -Math.PI / 2;

  // Little patches of ghostly mist
  for (let i = 0; i < 16; i++) {
    const mist = new THREE.Mesh(
      new THREE.CircleGeometry(0.35 + Math.random() * 0.65, 20),
      new THREE.MeshBasicMaterial({ color: 0x8b78b8, transparent: true, opacity: 0.055, depthWrite: false })
    );
    mist.rotation.x = -Math.PI / 2;
    mist.position.set((Math.random() - .5) * 16, .015 + Math.random() * .03, -Math.random() * 16);
    mist.scale.set(1.7, .7, 1);
    worldGroup.add(mist);
  }

  // Crooked trees with angular branches
  for (let i = 0; i < 15; i++) {
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * (2.6 + Math.random() * 5.4);
    const z = 2 - Math.random() * 17;
    const height = 2.4 + Math.random() * 2.2;
    const trunk = addMesh(worldGroup, new THREE.CylinderGeometry(.12, .23, height, 7), mat(0x30223d), [x, height / 2, z]);
    trunk.rotation.z = side * (0.04 + Math.random() * .12);
    for (let b = 0; b < 3; b++) {
      const branch = addMesh(worldGroup, new THREE.CylinderGeometry(.045, .09, 1.1 + Math.random() * .7, 5), mat(0x392641), [x + side * (b * .18), height * (.55 + b * .12), z]);
      branch.rotation.z = side * (-.75 + b * .35);
      branch.rotation.x = (Math.random() - .5) * .3;
    }
    // Sparse, dark, stylized canopy clusters
    if (i % 3 === 0) {
      addMesh(worldGroup, new THREE.IcosahedronGeometry(.65 + Math.random() * .35, 0), mat(0x20172f), [x, height + .25, z], [1.3, .8, 1]);
    }
  }

  // Gravestones
  for (let i = 0; i < 17; i++) {
    const x = (Math.random() - .5) * 11;
    const z = -1 - Math.random() * 12;
    if (Math.abs(x) < 1.7 && z > -7) continue;
    const stoneMat = mat(i % 3 === 0 ? 0x665a77 : 0x48405c);
    const stone = addMesh(worldGroup, new THREE.BoxGeometry(.55, .8 + Math.random() * .3, .18), stoneMat, [x, .4, z]);
    stone.rotation.y = (Math.random() - .5) * .3;
    addMesh(worldGroup, new THREE.BoxGeometry(.67, .12, .22), stoneMat, [x, .82, z]);
    // Tiny glowing rune on some stones
    if (i % 4 === 0) {
      addMesh(worldGroup, new THREE.BoxGeometry(.035, .25, .025), mat(0xa887dc, .3, { emissive: 0x7a35c8, emissiveIntensity: 1.2 }), [x, .46, z + .11]);
    }
  }

  // Floating firefly dots
  const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xffc16f });
  for (let i = 0; i < 45; i++) {
    const dot = addMesh(worldGroup, new THREE.SphereGeometry(.025, 6, 6), fireflyMat, [
      (Math.random() - .5) * 14, .3 + Math.random() * 2.6, -Math.random() * 17
    ]);
    dot.userData.firefly = true;
    dot.userData.phase = Math.random() * 6;
  }

  // A big moon and a distant silhouette
  const moon = addMesh(worldGroup, new THREE.SphereGeometry(1.1, 24, 24), new THREE.MeshBasicMaterial({ color: 0xe2d7ff }), [-5.5, 7.5, -19]);
  const halo = addMesh(worldGroup, new THREE.SphereGeometry(1.4, 24, 24), new THREE.MeshBasicMaterial({ color: 0x9e7cff, transparent: true, opacity: .1 }), [-5.5, 7.5, -19]);
  // Haunted mansion silhouette
  const houseMat = mat(0x100d20);
  addMesh(worldGroup, new THREE.BoxGeometry(3.5, 2.7, 1.6), houseMat, [0, 1.35, -16]);
  addMesh(worldGroup, new THREE.ConeGeometry(1.35, 1.8, 4), houseMat, [0, 3.5, -16], [1, 1, .8]).rotation.y = Math.PI / 4;
  addMesh(worldGroup, new THREE.BoxGeometry(.35, 1.3, .1), mat(0xff913f, .4, { emissive: 0xff5a19, emissiveIntensity: 1.5 }), [-.7, 1.1, -15.15]);
  addMesh(worldGroup, new THREE.BoxGeometry(.35, 1.3, .1), mat(0xff913f, .4, { emissive: 0xff5a19, emissiveIntensity: 1.5 }), [.7, 1.1, -15.15]);
}

function makePumpkin() {
  const group = new THREE.Group();
  const orange = mat(0xff852f, .45, { emissive: 0x7d2500, emissiveIntensity: .35 });
  const body = addMesh(group, new THREE.SphereGeometry(.28, 18, 14), orange, [0, 0, 0], [1, .82, .85]);
  // Ridges
  for (let i = 0; i < 7; i++) {
    const ridge = addMesh(group, new THREE.SphereGeometry(.25, 12, 10), orange, [0, 0, 0], [0.24, .78, .82]);
    ridge.rotation.y = i * Math.PI / 7;
  }
  const stem = addMesh(group, new THREE.CylinderGeometry(.045, .06, .16, 7), mat(0x52652d), [0, .25, 0]);
  stem.rotation.z = -.16;
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffe6a0 });
  addMesh(group, new THREE.ConeGeometry(.045, .1, 3), eyeMat, [-.09, .035, .235]).rotation.z = Math.PI;
  addMesh(group, new THREE.ConeGeometry(.045, .1, 3), eyeMat, [.09, .035, .235]).rotation.z = Math.PI;
  addMesh(group, new THREE.ConeGeometry(.055, .12, 3), eyeMat, [0, -.09, .25]).rotation.x = Math.PI / 2;
  return group;
}

function makeGhost() {
  const group = new THREE.Group();
  const ghostMat = mat(0xe6e0ff, .25, { emissive: 0x8b7bd8, emissiveIntensity: .65, transparent: true, opacity: .95 });
  addMesh(group, new THREE.SphereGeometry(.23, 18, 14), ghostMat, [0, .1, 0], [1, 1.1, .8]);
  addMesh(group, new THREE.CylinderGeometry(.23, .28, .28, 18, 1, true), ghostMat, [0, -.08, 0]);
  const eye = new THREE.MeshBasicMaterial({ color: 0x23183c });
  addMesh(group, new THREE.SphereGeometry(.035, 8, 8), eye, [-.075, .13, .19]);
  addMesh(group, new THREE.SphereGeometry(.035, 8, 8), eye, [.075, .13, .19]);
  return group;
}
function makeCrystal() {
  const group = new THREE.Group();
  const crystalMat = mat(0xb99aff, .25, { emissive: 0x7a35ff, emissiveIntensity: 1.4, metalness: .15 });
  addMesh(group, new THREE.OctahedronGeometry(.27, 0), crystalMat, [0, 0, 0], [.8, 1.3, .8]);
  addMesh(group, new THREE.TorusGeometry(.39, .018, 6, 32), mat(0xffb96d, .3, { emissive: 0xff8a33, emissiveIntensity: .8 }), [0, 0, 0]).rotation.x = Math.PI / 2;
  return group;
}
function makeLantern() {
  const group = new THREE.Group();
  const metal = mat(0x3e314d, .45, { metalness: .45 });
  addMesh(group, new THREE.BoxGeometry(.3, .36, .3), metal, [0, 0, 0]);
  addMesh(group, new THREE.SphereGeometry(.115, 12, 10), mat(0xffc36d, .25, { emissive: 0xff7a1c, emissiveIntensity: 2.4 }), [0, 0, .02]);
  const top = addMesh(group, new THREE.CylinderGeometry(.18, .18, .05, 8), metal, [0, .2, 0]);
  addMesh(group, new THREE.TorusGeometry(.11, .018, 6, 16, Math.PI), metal, [0, .28, 0]).rotation.z = Math.PI;
  return group;
}
function makeCandy() {
  const group = new THREE.Group();
  const wrapper = mat(0xff5e91, .35, { emissive: 0x8a123f, emissiveIntensity: .8 });
  addMesh(group, new THREE.SphereGeometry(.19, 12, 10), wrapper, [0, 0, 0], [1.2, .65, .65]);
  addMesh(group, new THREE.ConeGeometry(.11, .18, 6), wrapper, [-.25, 0, 0]).rotation.z = Math.PI / 2;
  addMesh(group, new THREE.ConeGeometry(.11, .18, 6), wrapper, [.25, 0, 0]).rotation.z = -Math.PI / 2;
  return group;
}

function buildCharms() {
  const makers = [makePumpkin, makeGhost, makeCrystal, makeLantern, makeCandy];
  const positions = [
    [-2.2, .75, 1.3],
    [2.9, 1.05, -2.1],
    [-3.5, .85, -5.2],
    [1.2, 1.0, -7.8],
    [4.0, .7, -10.2]
  ];
  const names = ['Pumpkin Charm', 'Little Ghost', 'Moon Crystal', 'Ghost Lantern', 'Enchanted Candy'];
  makers.forEach((make, i) => {
    const group = make();
    group.position.set(...positions[i]);
    group.userData = { collectible: true, index: i, name: names[i], collected: false, baseY: positions[i][1], phase: i * 1.7 };
    group.traverse(obj => { if (obj.isMesh) { obj.userData.collectibleParent = group; obj.userData.index = i; } });
    charmGroup.add(group);
    charms.push(group);
  });
}

function buildGate() {
  const frameMat = mat(0x3b2549, .5, { emissive: 0x42126b, emissiveIntensity: .35 });
  const orangeGlow = mat(0xff8c42, .25, { emissive: 0xff4f12, emissiveIntensity: 1.2 });
  addMesh(gateGroup, new THREE.BoxGeometry(3.1, .22, .25), frameMat, [0, 2.35, -13]);
  addMesh(gateGroup, new THREE.BoxGeometry(.22, 2.4, .25), frameMat, [-1.45, 1.2, -13]);
  addMesh(gateGroup, new THREE.BoxGeometry(.22, 2.4, .25), frameMat, [1.45, 1.2, -13]);
  const pumpkin = makePumpkin();
  pumpkin.scale.setScalar(1.35);
  pumpkin.position.set(0, 2.65, -13);
  gateGroup.add(pumpkin);
  const ring = addMesh(gateGroup, new THREE.TorusGeometry(1.0, .035, 8, 48), orangeGlow, [0, 1.15, -12.85]);
  ring.rotation.y = 0;
  gateGroup.visible = false;
}

function setupUI() {
  $('startBtn').addEventListener('click', () => {
    started = true;
    $('intro').classList.add('hidden');
    $('hud').classList.remove('hidden');
    showToast('The hunt is on. Find the five glowing charms!');
  });
  $('clueBtn').addEventListener('click', () => {
    const remaining = charms.find(c => !c.userData.collected);
    $('clueText').textContent = remaining ? clues[Math.min(clueIndex, clues.length - 1)] : 'You found every charm. The Hollow thanks you!';
    clueIndex = (clueIndex + 1) % clues.length;
    $('clueModal').classList.remove('hidden');
  });
  $('closeClue').addEventListener('click', () => $('clueModal').classList.add('hidden'));
  $('clueOk').addEventListener('click', () => $('clueModal').classList.add('hidden'));
  $('playAgainBtn').addEventListener('click', resetGame);
  $('soundBtn').addEventListener('click', toggleSound);
}

function setupAR() {
  const mount = document.createElement('div');
  mount.id = 'arButtonMount';
  document.body.appendChild(mount);
  try {
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body }
    });
    arButton.textContent = 'Try AR Hunt';
    mount.appendChild(arButton);
    arButton.addEventListener('click', () => {
      // ARButton starts the session asynchronously. Session state is detected below.
      started = true;
      $('intro').classList.add('hidden');
      $('hud').classList.remove('hidden');
    });
    const vrButton = VRButton.createButton(renderer, { optionalFeatures: ['local-floor', 'bounded-floor'] });
    vrButton.textContent = 'Try VR';
    mount.appendChild(vrButton);
    vrButton.addEventListener('click', () => {
      started = true;
      $('intro').classList.add('hidden');
      $('hud').classList.remove('hidden');
    });
  } catch (e) {
    mount.remove();
    console.warn('AR button could not be created in this browser.', e);
  }

  reticle = new THREE.Mesh(
    new THREE.RingGeometry(.12, .17, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffb56a, transparent: true, opacity: .95 })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  const controller = renderer.xr.getController(0);
  controller.addEventListener('select', onXRSelect);
  scene.add(controller);
  const rayLine = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1)]),
    new THREE.LineBasicMaterial({ color: 0xffb36a, transparent: true, opacity: .65 })
  );
  rayLine.scale.z = 4;
  controller.add(rayLine);

  renderer.xr.addEventListener('sessionstart', () => {
    arMode = true;
    arPlaced = false;
    hitTestSourceRequested = false;
    hitTestSource = null;
    scene.background = null;
    scene.fog = null;
    worldGroup.visible = false;
    gateGroup.visible = false;
    charmGroup.visible = false;
    reticle.visible = false;
    $('controlHint').textContent = 'Move your phone to find a flat surface, then tap to place the charms.';
    showToast('Scan the floor or a table, then tap to place the hunt.');
  });
  renderer.xr.addEventListener('sessionend', () => {
    arMode = false;
    scene.background = new THREE.Color(0x100b22);
    scene.fog = new THREE.FogExp2(0x100b22, 0.035);
    worldGroup.visible = true;
    charmGroup.visible = true;
    gateGroup.visible = collected >= 5;
    reticle.visible = false;
    $('controlHint').textContent = 'WASD / arrows to move · drag to look · click a glowing charm';
    if (!started) $('intro').classList.remove('hidden');
  });
}

function onXRSelect(event) {
  if (!renderer.xr.isPresenting) return;
  if (!arMode) {
    // In VR, point a controller at a charm and press the trigger.
    const controller = event.target;
    raycaster.setFromXRController(controller);
    const targets = [];
    charms.forEach(charm => {
      if (!charm.userData.collected && charm.visible) charm.traverse(o => { if (o.isMesh) targets.push(o); });
    });
    const hits = raycaster.intersectObjects(targets, false);
    if (hits.length) collectCharm(hits[0].object.userData.index);
    return;
  }
  if (!arPlaced) {
    if (!reticle.visible) {
      showToast('Keep moving your phone until the orange ring appears.');
      return;
    }
    placeARHunt();
    return;
  }
  const controller = event.target;
  raycaster.setFromXRController(controller);
  const targets = [];
  charms.forEach(charm => {
    if (!charm.userData.collected && charm.visible) charm.traverse(o => { if (o.isMesh) targets.push(o); });
  });
  const hits = raycaster.intersectObjects(targets, false);
  if (hits.length) collectCharm(hits[0].object.userData.index);
}

function placeARHunt() {
  const matrix = new THREE.Matrix4().fromArray(reticle.matrix.elements);
  const position = new THREE.Vector3().setFromMatrixPosition(matrix);
  const rotation = new THREE.Quaternion().setFromRotationMatrix(matrix);
  const origin = new THREE.Group();
  origin.position.copy(position);
  origin.quaternion.copy(rotation);
  scene.add(origin);
  // Arrange the hunt around a real-world surface in a small, safe radius.
  const offsets = [
    [-.65, .18, .15], [.6, .22, .1], [-.55, .2, -.55], [.55, .18, -.6], [0, .35, -.95]
  ];
  charms.forEach((charm, i) => {
    charm.position.set(...offsets[i]);
    charm.scale.setScalar(.55);
    charm.userData.baseY = offsets[i][1];
    origin.add(charm);
  });
  arPlaced = true;
  reticle.visible = false;
  showToast('Hunt placed! Tap the floating charms to collect them.');
  $('controlHint').textContent = 'Move around carefully · aim at a glowing charm and tap to collect';
}

function onPointerDown(event) {
  if (!started || arMode || !renderer.domElement) return;
  // Ignore taps on UI overlays, which sit outside the canvas anyway.
  pointer.x = (event.clientX / innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const targets = [];
  charms.forEach(charm => {
    if (!charm.userData.collected && charm.visible) charm.traverse(o => { if (o.isMesh) targets.push(o); });
  });
  const hits = raycaster.intersectObjects(targets, false);
  if (hits.length) {
    collectCharm(hits[0].object.userData.index);
  } else {
    // Clicking the scene also gives a small “look toward” nudge.
    const hit = raycaster.intersectObjects(charmGroup.children, true)[0];
    if (hit) showToast('A little closer — tap the glowing charm itself.');
  }
}

let drag = null;
function onPointerMove(event) {
  if (!started || arMode) return;
  // Drag-to-look only activates after a small movement, so tapping to collect still works.
  if (event.buttons === 1 && drag) {
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    camera.rotation.order = 'YXZ';
    camera.rotation.y -= dx * .004;
    camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * .003, -.75, .65);
    drag.x = event.clientX;
    drag.y = event.clientY;
  }
}
rendererPointerDragSetup();
function rendererPointerDragSetup() {
  renderer.domElement.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('pointerup', () => { drag = null; });
}

function collectCharm(index) {
  const charm = charms[index];
  if (!charm || charm.userData.collected) return;
  charm.userData.collected = true;
  charm.visible = false;
  collected++;
  $('score').textContent = `${collected} / 5`;
  $('progressFill').style.width = `${collected * 20}%`;
  $('statusText').textContent = collected === 5 ? 'The pumpkin gate is awake!' : `${5 - collected} ${5 - collected === 1 ? 'charm' : 'charms'} still hiding in the fog`;
  playChime();
  showToast(['A pumpkin spark! 🎃', 'A friendly ghost joins you! 👻', 'The moon crystal hums! ✨', 'The lantern lights the way! 🕯️', 'Sweet magic! 🍬'][index]);
  if (collected === 5) {
    gateGroup.visible = !arMode;
    $('winModal').classList.remove('hidden');
    showToast('All five charms found. You did it!');
  }
}

function resetGame() {
  collected = 0;
  clueIndex = 0;
  charms.forEach((charm, i) => {
    charm.userData.collected = false;
    charm.visible = true;
    if (!arMode) {
      const positions = [[-2.2,.75,1.3],[2.9,1.05,-2.1],[-3.5,.85,-5.2],[1.2,1,-7.8],[4,.7,-10.2]];
      charm.position.set(...positions[i]);
      charm.scale.setScalar(1);
      charm.userData.baseY = positions[i][1];
      charmGroup.add(charm);
    }
  });
  $('score').textContent = '0 / 5';
  $('progressFill').style.width = '0%';
  $('statusText').textContent = 'The graveyard is waiting...';
  $('winModal').classList.add('hidden');
  gateGroup.visible = false;
  if (arMode) {
    arPlaced = false;
    charms.forEach(c => { c.visible = false; });
    reticle.visible = false;
    showToast('Scan for a surface and tap to place a fresh hunt.');
  } else {
    showToast('A new hunt begins!');
  }
}

function showToast(message) {
  const toast = $('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2600);
}

function toggleSound() {
  soundOn = !soundOn;
  $('soundLabel').textContent = soundOn ? 'Sound on' : 'Sound off';
  $('soundBtn').style.borderColor = soundOn ? 'rgba(255,179,106,.65)' : '';
  if (soundOn) {
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      audioContext.resume();
      playChime();
    } catch (e) {
      showToast('Audio is not available in this browser.');
    }
  }
}
function playChime() {
  if (!soundOn || !audioContext) return;
  const now = audioContext.currentTime;
  [660, 880, 1100].forEach((freq, i) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.0001, now + i * .07);
    gain.gain.exponentialRampToValueAtTime(.07, now + i * .07 + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, now + i * .07 + .22);
    osc.connect(gain).connect(audioContext.destination);
    osc.start(now + i * .07);
    osc.stop(now + i * .07 + .24);
  });
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function updateMovement(delta) {
  if (!started || arMode) return;
  const speed = 3.1 * delta;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize().negate();
  if (keys.has('w') || keys.has('arrowup')) camera.position.addScaledVector(forward, speed);
  if (keys.has('s') || keys.has('arrowdown')) camera.position.addScaledVector(forward, -speed);
  if (keys.has('a') || keys.has('arrowleft')) camera.position.addScaledVector(right, -speed);
  if (keys.has('d') || keys.has('arrowright')) camera.position.addScaledVector(right, speed);
  camera.position.x = THREE.MathUtils.clamp(camera.position.x, -7, 7);
  camera.position.z = THREE.MathUtils.clamp(camera.position.z, -14, 6);
  camera.position.y = 1.7;
}

function animate() {
  renderer.setAnimationLoop(render);
}
function render() {
  const delta = Math.min(clock.getDelta(), .05);
  const time = clock.elapsedTime;
  updateMovement(delta);

  charms.forEach(charm => {
    if (!charm.userData.collected && charm.visible) {
      charm.position.y = charm.userData.baseY + Math.sin(time * 2.2 + charm.userData.phase) * .1;
      charm.rotation.y += delta * .65;
    }
  });
  worldGroup.children.forEach(obj => {
    if (obj.userData.firefly) {
      obj.position.y += Math.sin(time * 2 + obj.userData.phase) * .0008;
      obj.material.opacity = .65 + Math.sin(time * 3 + obj.userData.phase) * .25;
    }
  });
  gateGroup.rotation.y = Math.sin(time * .45) * .035;

  if (renderer.xr.isPresenting && arMode) {
    const session = renderer.xr.getSession();
    if (!hitTestSourceRequested) {
      session.requestReferenceSpace('viewer').then((referenceSpace) => {
        session.requestHitTestSource({ space: referenceSpace }).then((source) => { hitTestSource = source; }).catch(() => {});
      }).catch(() => {});
      hitTestSourceRequested = true;
    }
    const frame = renderer.xr.getFrame();
    if (frame && hitTestSource && !arPlaced) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const hits = frame.getHitTestResults(hitTestSource);
      if (hits.length) {
        const pose = hits[0].getPose(referenceSpace);
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
  }
  renderer.render(scene, camera);
}
