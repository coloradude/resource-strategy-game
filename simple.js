/*jshint
esversion: 6
*/

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);

/**
  Drawing context
**/
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;
let windowHalfX = SCREEN_WIDTH / 2;
let windowHalfY = SCREEN_HEIGHT / 2;
let radious = 10;
let theta = 45;
let phi = 60;
const FOV = 90;
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
const NEARFRUSTRAM = 0.1;
const FAFRUSTRAM = 10000;
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM);
let renderer = new THREE.WebGLRenderer({
  antialias: true
});
renderer.setClearColor(0x000000);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
renderer.domElement.style.position = "relative";

/**
  Game Settings
**/

/* mouse */
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let mouseX = 0;
let mouseY = 0;
let ray = new THREE.Ray(camera.position, null);
let isMouseDown = false;
let onMouseDownPosition = new THREE.Vector2();
let onMouseDownTheta = 45;
let onMouseDownPhi = 60;

/**
  Global Game Settings
**/
const mapWidth = 1000;
const mapLength = 1000;

/**
  Game Objects
**/
let geometry,
    material;

// draw cube
geometry = new THREE.BoxGeometry(100, 100, 100);
material = new THREE.MeshPhongMaterial({
  color: 0x2194ce,
  emissive: 0x2194ce,
  specular: 0x2194ce,
  shininess: 5,
  shading: THREE.SmoothShading
});
let numCubes = 25;
let cubes = [];
for(let i in numCubes) {
  cubes.push(new THREE.Mesh(geometry, material));
}

// Draw ground
geometry = new THREE.PlaneBufferGeometry(mapWidth, mapLength, 1, 1);
material = new THREE.MeshPhongMaterial({
  emissive: 0xffff00
});
let ground = new THREE.Mesh(geometry, material);
ground.position.set(mapWidth/2, mapLength/2, 0);

class worker {
  constructor() {
    this.
  }
}

/**
  Functions
**/
const addObjectsToScene = () => {
  cubes.map((cube) => {
      cube.position.set(0, 0, 0);

      scene.add(cube);
  });

  scene.add(ground);
};

const watchEvents = () => {
  // keyboard controls
  document.addEventListener('keydown', onDocumentKeyPressed, false);

  // mouse controls
	document.addEventListener('mousemove', onDocumentMouseMove, false );
	document.addEventListener('mousedown', onDocumentMouseDown, false );
	document.addEventListener('mouseup', onDocumentMouseUp, false );
  document.addEventListener('mousewheel', onDocumentMouseWheel, false );
  document.addEventListener('contextmenu', (e)=>{e.preventDefault();return false;}, false); // disable right clicks

  // resize window
  window.addEventListener('resize', onWindowResize, false);
};

const logCamera = () => {
  let ticker = setInterval(() => {
    console.log(camera.position);
  }, 250);
};

const update = () => {

  cubes.map((cube) => {
    // rotate cubes
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    cube.rotation.z += 0.01;

    // move cubes
    cube.position.x += 1;
    cube.position.y += 1;
  });
};

const setup = () => {
  logCamera();

  camera.position.x = mapWidth/2;
  camera.position.y = mapLength/2;
  camera.position.z = 500;

  watchEvents();

  addObjectsToScene();

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
};

const render = () => {
  update();
  requestAnimationFrame(render);
  renderer.render(scene, camera);
};

const onDocumentKeyPressed = (event) => {

  console.log('something pressed: ' + event.which);

  switch (event.which) {
    case 37: // left arrow
      camera.position.x -= 5;
      break;
    case 39: // right arrow
      camera.position.x += 5;
      break;
    case 38: // up arrow
      camera.position.z -= 5;
      break;
    case 40: // down arrow
      camera.position.z += 5;
      break;
    default:
      console.log(camera.position);
      break;
  }
};

const onDocumentMouseUp = (event) => {

  event.preventDefault();

  isMouseDown = false;

  onMouseDownPosition.x = event.clientX - onMouseDownPosition.x;
  onMouseDownPosition.y = event.clientY - onMouseDownPosition.y;
};

const onDocumentMouseWheel = (event) => {

  radious -= event.wheelDeltaY;

  camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
  camera.updateMatrix();
};

const onDocumentMouseDown = (event) => {

  event.preventDefault();

  isMouseDown = true;

  onMouseDownTheta = theta;
  onMouseDownPhi = phi;
  onMouseDownPosition.x = event.clientX;
  onMouseDownPosition.y = event.clientY;
};

const onDocumentMouseMove = (event) => {
  event.preventDefault();

  mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
  mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;


  if (isMouseDown) {
    // rotate camera if mouse held down
    // theta = -((event.clientX - onMouseDownPosition.x) * 0.5) + onMouseDownTheta;
    // phi = ((event.clientY - onMouseDownPosition.y) * 0.5) + onMouseDownPhi;
    // phi = Math.min(180, Math.max(0, phi));
    //
    // camera.position.x = radious * Math.sin(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    // camera.position.y = radious * Math.sin(phi * Math.PI / 360);
    // camera.position.z = radious * Math.cos(theta * Math.PI / 360) * Math.cos(phi * Math.PI / 360);
    // camera.updateMatrix();
  }

  raycaster.setFromCamera(mouse, camera);
};

const onWindowResize = () => {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

setup();
render();
