/*jshint
node: true,
esversion: 6,
browser: true
*/
'use strict';

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const SCREEN_WIDTH = window.innerWidth;
const SCREEN_HEIGHT = window.innerHeight;

/* Camera Settings */
const FOV = 90;
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
const NEARFRUSTRAM = 0.1;
const FAFRUSTRAM = 10000;

/* Game Settings */
const mapWidth = 1000;
const mapLength = 1000;

/* Interface Settings */
const MAXZOOM = 550;
const MINZOOM = 100;

class Game{
    constructor() {
      this.initializeRenderer();
      this.initializeScene();
      this.initializeCamera();
      this.initializeMouse();

      this.windowHalfX = SCREEN_WIDTH / 2;
      this.windowHalfY = SCREEN_HEIGHT / 2;
      this.radius = 10;
      this.theta = 45;
      this.phi = 60;

      // this.addCube();
      this.addCubes();
      this.addGround();
      // this.drawRaycaster();

      // this.listObjectsInScene();

      this.watchEvents();
    }

    update() {
        // this.ground.rotation.x += 0.01;
        // this.ground.rotation.y += 0.01;
        // this.ground.rotation.z += 0.01;
    }

    render() {
        this.update();
        this.renderer.render(this.scene, this.camera);
    }

    watchEvents() {
      // keyboard controls
      document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
      document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false);

      // mouse controls
    	document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false );
    	document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false );
    	document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false );
      document.addEventListener('mousewheel', this.onDocumentMouseWheel.bind(this), false );

      // disable right click
      document.addEventListener('contextmenu', (e)=>{e.preventDefault();return false;}, false);

      // resize window
      window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    listObjectsInScene() {
      this.scene.traverse((object) => {
        console.log(object.name);
        console.log(object);
      });
    }

    Cube(size) {
      let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      let material = new THREE.MeshPhongMaterial({
        color: 0x2194ce,
        emissive: 0x2194ce,
        specular: 0x2194ce,
        shininess: 5,
        shading: THREE.SmoothShading
      });
      return new THREE.Mesh(geometry, material);
    }

    Ground() {
      let geometry = new THREE.PlaneBufferGeometry(mapWidth, mapLength, 1, 1);
      let material = new THREE.MeshPhongMaterial({
        emissive: 0xffff00
      });
      return new THREE.Mesh(geometry, material);
    }

    /*
    @coordinates: (x, y, z) vector
    @size: (x, y, z) vector
    */
    addCube(coordinates = new THREE.Vector3(0, 0, 0), size = new THREE.Vector3(100, 100, 100), name = "") {
      // let cube = new this.Cube(new THREE.Vector3(100, 100, 100));
      // cube.position.set(coordinates);
      // cube.name = "cube" + Math.random() * 1000;
      // this.scene.add(cube);

      console.log('coordinates:');
      console.log(coordinates);

      let cube = new this.Cube(size);
      cube.name = name;
      cube.position.set(coordinates.x, coordinates.y, coordinates.z);
      this.scene.add(cube);

      console.log(`added cube to scene at position (${cube.position.x}, ${cube.position.y}, ${cube.position.z}) using coordinates (${coordinates.x}, ${coordinates.y}, ${coordinates.z})`);

      // this.listObjectsInScene();
    }

    /*
      Adds 100 randomly sized cubes in random places
    */
    addCubes(coordinates = new THREE.Vector3(0, 0, 0), number = 100) {
      for(let i = 0; i < number; i++) {
        let random = Math.random();
        let size = new THREE.Vector3(random * 100, random * 100, random * 100);
        coordinates = new THREE.Vector3(random * mapWidth, random * mapLength, 0);
        let name = `randomCube${i}`;
        this.addCube(coordinates, size, name);

        // let cube = new this.Cube(size);
        // cube.name = "cube" + i;
        // cube.position.set(Math.random() * 1000, Math.random() * 1000, 0);
        // this.scene.add(cube);
      }
    }

    addGround() {
      let ground = this.Ground();
      ground.name = "ground";
      ground.position.set(mapWidth/2, mapLength/2, 0);
      this.scene.add(ground);
    }

    drawRaycaster() {
      let material = new THREE.LineBasicMaterial({
      	color: 0x0000ff
      });

      let geometry = new THREE.Geometry();
      geometry.vertices.push(
      	new THREE.Vector3( -10, 0, 0 ),
      	new THREE.Vector3( 0, 10, 0 ),
      	new THREE.Vector3( 10, 0, 0 )
      );
      geometry.name = "raycaster";

      var line = new THREE.Line( geometry, material );
      this.scene.add( line );
    }

    initializeRenderer() {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.getElementById('game')
      });
      this.renderer.setClearColor(0x000000);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    initializeScene() {
      this.scene = new THREE.Scene();
    }

    initializeCamera() {
      this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM);
      this.camera.position.x = mapWidth/2;
      this.camera.position.y = mapLength/2;
      this.camera.position.z = 500;
    }

    initializeMouse() {
      this.mouse = {x: 0, y: 0};
      this.isMouseDown = false;
      this.mouseDownPosition = {x: 0, y: 0};
      this.raycaster = new THREE.Raycaster();
    }

    onWindowResize() {
      this.windowHalfX = window.innerWidth / 2;
      this.windowHalfY = window.innerHeight / 2;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onDocumentKeyUp() {
      switch (event.which) {
        case 37: // left arrow
          break;
        case 39: // right arrow
          break;
        case 38: // up arrow
          break;
        case 40: // down arrow
          break;
        case 16: // shift
          this.shiftIsDown = false;
          break;
        default:
          break;
      }
    }

    onDocumentKeyDown(event) {

      console.log('something pressed: ' + event.which);

      switch (event.which) {
        case 37: // left arrow
          this.camera.position.x -= 5;
          break;
        case 39: // right arrow
          this.camera.position.x += 5;
          break;
        case 38: // up arrow
          this.camera.position.z -= 5;
          break;
        case 40: // down arrow
          this.camera.position.z += 5;
          break;
        case 16: // shift
          this.shiftIsDown = true;
          break;
        default:
          console.log(this.camera.position);
          break;
      }
    }

    onDocumentMouseUp(event) {

      event.preventDefault();

      this.isMouseDown = false;

      console.log(`mouseup detected; \nold position: ${this.mouseDownPosition.x}, ${this.mouseDownPosition.y}`);

      this.mouseDownPosition.x = event.clientX;
      this.mouseDownPosition.y = event.clientY;

      console.log(`new position: ${this.mouseDownPosition.x}, ${this.mouseDownPosition.y}`);
    }

    onDocumentMouseDown(event) {

      event.preventDefault();

      this.isMouseDown = true;

      this.mouseDownPosition.x = event.clientX;
      this.mouseDownPosition.y = event.clientY;

      if(this.shiftIsDown) {
        // get intersecting point with ground & add a cube there

      	// update the picking ray with the camera and mouse position
      	this.raycaster.setFromCamera(this.mouse, this.camera);

      	// calculate objects intersecting the picking ray
      	let intersects = this.raycaster.intersectObjects(this.scene.children);

      	for(let intersect of intersects) {
          // console.log(`detected collision with ${intersect.object.name}`);
          // console.log(intersect.object);

          if(intersect.object.name == "ground") {
            // console.log(`intersected ground at:`);
            // console.log(intersect.point);

            this.addCube(intersect.point, new THREE.Vector3(100, 100, 100), "manually added cube");
          }
      	}
      }
    }

    onDocumentMouseMove(event) {
      event.preventDefault();

      this.mouse.x = (event.clientX / this.renderer.domElement.width) * 2 - 1;
      this.mouse.y = -(event.clientY / this.renderer.domElement.height) * 2 + 1;

      if (this.isMouseDown) {
        let oldX = this.mouseDownPosition.x,
            oldY = this.mouseDownPosition.y;

        this.mouseDownPosition.x = event.clientX;
        this.mouseDownPosition.y = event.clientY;

        // move camera if shift not held
        if(this.shiftIsDown) {

          // this.camera.position.x += this.mouseDownPosition.x - this.mouse.x;
          // this.camera.position.y += this.mouseDownPosition.y - this.mouse.y;
          this.camera.updateMatrix();
        } else {
          // move camera along X-Y axis if shift not held
          let deltaX = this.mouseDownPosition.x - oldX,
              deltaY = this.mouseDownPosition.y - oldY;

          let screenPercentageX = deltaX / window.innerWidth,
              screenPercentageY = deltaY / window.innerHeight;

          // move camera along X-Y plane accordingly
          this.camera.position.x -= deltaX;
          this.camera.position.y += deltaY;
        }
      }

      this.raycaster.setFromCamera(this.mouse, this.camera);
    }

    onDocumentMouseWheel(event) {
      event.preventDefault();

      /*
        Scrolling up/down zooms camera
      */
      this.radius -= event.wheelDeltaY/10;
      this.radius = Math.max(Math.min(MAXZOOM, this.radius), MINZOOM);

      let newPosition = this.radius;

      // limit camera z position to MAXZOOM and MINZOOM interface settings
      this.camera.position.z = newPosition;

      /*
        Scrolling left/right rotates camera
      */


      this.camera.updateMatrix();
    }
}

module.exports = Game;
