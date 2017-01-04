/*
jshint
node: true,
esversion: 6,
browser: true
*/
'use strict';

const THREE = require('three');

const CANVAS = document.getElementById('game');
const CONTAINER = document.getElementById('container');
const MENU = document.getElementById('menu');
const SCREEN_WIDTH = CANVAS.width;
const SCREEN_HEIGHT = CANVAS.height;
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

/* Game Settings */
const MAPWIDTH = 10000;
const MAPLENGTH = 10000;
const MAPHEIGHT = 1000;
const SHADOWS = true;

/* Camera Settings */
const FOV = 90;
const MAXFRAMERATE = 1000 / 60; // 30fps
const NEARFRUSTRAM = 0.1;
const FAFRUSTRAM = 10000;
const CAMERA_START_X = MAPWIDTH / 2;
const CAMERA_START_Y = MAPLENGTH / 2;
const CAMERA_START_Z = 3000;
const SCROLL_SCALE = 1;

/* Interface Settings */
const MAXZOOM = 3500;
const MINZOOM = 1000;
const MENU_WIDTH = parseInt(window.getComputedStyle(MENU, null).getPropertyValue('width'));

/* Import Objects */
const Player = require('./objects/Player.js');
const Camera = require('./objects/Camera.js');
const Menu = require('./objects/Menu.js');
const SceneObject = require('./objects/SceneObject.js');
const InterfaceObject = require('./objects/InterfaceObject/InterfaceObject.js');
const SelectionBox = require('./objects/InterfaceObject/SelectionBox.js');
const Ground = require('./objects/Ground.js');
const Cube = require('./objects/Cube.js');
const Building = require('./objects/Building.js');
const ResourceNode = require('./objects/ResourceNode/ResourceNode.js');
const MetalResourceNode = require('./objects/ResourceNode/MetalResourceNode.js');
const GoldResourceNode = require('./objects/ResourceNode/GoldResourceNode.js');
const FoodResourceNode = require('./objects/ResourceNode/FoodResourceNode.js');

/* Control Settings */
const CONTROLS = {
  backspace: 8,
  tab: 9,
  space: 32,
  leftArrow: 37,
  upArrow: 38,
  rightArrow: 39,
  downArrow: 40,
  enter: 13,
  shift: 16,
  ctrl: 17,
  alt: 18,
  capsLock: 20, // turning on only
  delete: 46,
  num0: 48,
  num1: 49,
  num2: 50,
  num3: 51,
  num4: 52,
  num5: 53,
  num6: 54,
  num7: 55,
  num8: 56,
  num9: 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  leftApple: 91,
  rightApple: 92
};

class Game{
    constructor() {
      this.initializeRenderer();
      this.initializeScene();
      this.initializeCamera();
      this.initializeLight();
      this.initializeMouse();

      this.theta = 45;
      this.phi = 60;
      this.worldMouseCoordinatesStart = new THREE.Vector3(0, 0, 0);
      this.worldMouseCoordinatesEnd = new THREE.Vector3(0, 0, 0);

      this.cubes = [];
      this.buildings = [];
      this.resourceNodes = [];

      this.selectedObjects = [];

      this.player = new Player();

      this.addGround();

      this.addMenu();

      this.watchEvents();

      this.loadScenario(require('../output/assets/scenario1.json'));
    }

    update() {
        this.renderScore();

        for(let i in this.selectedObjects) {
          this.selectedObjects[i].select(true);
        }

        for(let i in this.cubes) {
          this.cubes[i].update();
        }

        for(let i in this.resourceNodes) {
          this.resourceNodes[i].update();
        }
    }

    render() {
      // perform game updates
      this.update();
      // move camera according to keyboard controls
      this.keyboardCameraControls();
      this.renderer.render(this.scene, this.camera);

      // limit animation request to FRAMERATE
      setTimeout(() => {
        let that = this;
        requestAnimationFrame(() => {
          that.render();
        });
      }, MAXFRAMERATE);
    }

    renderScore() {
      this.menu.updateScore(this.player.score);
      this.menu.updateGold(this.player.resources.gold);
      this.menu.updateFood(this.player.resources.food);
      this.menu.updateMetal(this.player.resources.metal);
    }

    watchEvents() {
      // keyboard controls
      document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
      document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false);

      // mouse controls
    	document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false );
    	document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false );
      document.addEventListener('contextmenu', this.onDocumentMouseRightDown.bind(this), false);
    	document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false );
      document.addEventListener('mousewheel', this.onDocumentMouseWheel.bind(this), false );

      // resize window
      window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    listObjectsInScene() {
      this.scene.traverse((object) => {
        console.log(object);
      });
    }

    /*
    @coordinates: (x, y, z) vector
    @size: (x, y, z) vector
    */
    addCube(
      coordinates = new THREE.Vector3(0, 0, 0),
      size = new THREE.Vector3(100, 100, 100),
      name = `cube${this.cubes.length}`
    ) {
      let cube = new Cube(size);

      cube.name = name;
      cube.position.set(coordinates.x, coordinates.y, coordinates.z);

      this.scene.add(cube);
      this.cubes.push(cube);

      cube.setName(name);
      cube.setSceneObject(this.scene.getObjectByName(name));
    }

    addBuilding(
      coordinates = new THREE.Vector3(0, 0, 0),
      size = new THREE.Vector3(100, 100, 100),
      name = `building${this.cubes.length}`
    ) {
      let building = new Building(size);

      building.name = name;
      building.position.set(coordinates.x, coordinates.y, coordinates.z);

      this.scene.add(building);
      this.buildings.push(building);

      building.setName(name);
      building.setSceneObject(this.scene.getObjectByName(name));
    }

    removeBuilding(building) {
      // remove from this.scene
      this.scene.remove(building);

      // remove from this.buildings
      for(let i in this.buildings) {
        if(this.buildings[i] == building) {
          this.buildings.splice(i, 1);
        }
      }
    }

    removeAllBuildings() {
      let numDeleted = 0;
      for(let i = this.cubes.length - 1; i >= 0; i--) {
        this.removeBuilding(this.buildings[i]);
      }
    }

    /*
    @coordinates: (x, y, z) vector
    @size: (x, y, z) vector
    */
    addResourceNode(
      coordinates = new THREE.Vector3(0, 0, 0),
      size = new THREE.Vector3(100, 100, 100),
      type = "metal"
    ) {
      let resourceNode;
      switch(type) {
        case "metal":
          resourceNode = new MetalResourceNode();
          break;
        case "food":
          resourceNode = new FoodResourceNode();
          break;
        case "gold":
          resourceNode = new GoldResourceNode();
          break;
        default:
          console.error('invalid resourceNode type');
          break;
      }

      let name = `resourceNode${this.resourceNodes.length}`;

      resourceNode.name = name;
      resourceNode.position.set(coordinates.x, coordinates.y, coordinates.z);

      this.scene.add(resourceNode);
      this.resourceNodes.push(resourceNode);

      resourceNode.setName(name);
      resourceNode.setSceneObject(this.scene.getObjectByName(name));
    }

    /*
      Adds 1000 randomly sized cubes in random places
    */
    addRandomCubes(
      coordinates = new THREE.Vector3(0, 0, 0),
      number = 1000
    ) {
      for(let i = 0; i < number; i++) {
        let random = Math.random();
        let width = random * 100;
        let length = random * 100;
        let height = random * 100;
        let size = new THREE.Vector3(width, length, height);

        coordinates = new THREE.Vector3(Math.random() * MAPWIDTH, Math.random() * MAPLENGTH, random * 50);

        let name = `cube${this.cubes.length}`;

        this.addCube(coordinates, size, name);
      }
    }

    removeAllCubes() {
      let numDeleted = 0;
      let numCubes = this.cubes.length;
      for(let i =0; i < numCubes; i++) {
        this.removeCube(this.cubes[0]);
        numDeleted++;
      }
    }

    removeSelectedCubes() {
      // could down to avoid skipping nodes
      for(let i = this.selectedObjects.length - 1; i >= 0; i-- ) {
        this.removeCube(this.selectedObjects[i]);
      }
    }

    listAllCubes() {
      for(let i in this.cubes) {
        console.log(this.cubes[i]);
      }
    }

    loadScenario(jsonFile) {
      this.scenario = jsonFile;

      for(let i in this.scenario) {
        let obj = this.scenario[i];
        let coords;
        let size;
        let name;
        let type;

        switch(obj.type) {
          case 'cube':
            coords = obj.data.coordinates;
            size = obj.data.size;
            name = obj.data.name;

            this.addCube(coords, size, name);
            break;
          case 'building':
            coords = obj.data.coordinates;
            size = obj.data.size;
            name = obj.data.name;

            this.addBuilding(coords, size, name);
            break;
          case 'resourceNode':
            console.log(`I am a ${obj.data.resourceType} resourceNode`);
            coords = obj.data.coordinates;
            size = obj.data.size;
            type = obj.data.type;

            this.addResourceNode(coords, size, type);
            break;
          default:
            console.error(`Error reading scenario file: unrecognized node type ${obj.type}`);
            break;
        }
      }
    }

    scenario1() {
      // add 4 home cubes
      let size = new THREE.Vector3(50, 50, 50);

      this.addCube(new THREE.Vector3(500, 300, size.z/2), size, 'soldier1');

      this.addCube(new THREE.Vector3(400, 300, size.z/2), size, 'soldier2');

      this.addCube(new THREE.Vector3(400, 300, size.z/2), size, 'soldier3');

      this.addCube(new THREE.Vector3(400, 300, size.z/2), size, 'soldier4');

      // add buildings
      size = new THREE.Vector3(400, 400, 200);
      this.addBuilding(new THREE.Vector3(800, 800, size.z/2), size, 'building1');

      // add resource nodes
      // this.addResourceNode(new THREE.Vector3(1000, 300, 25), size, 'metal');

      // this.addResourceNode(new THREE.Vector3(2000, 1200, 25), size, 'food');

      // this.addResourceNode(new THREE.Vector3(3000, 2400, 25), size, 'gold');
    }

    addGround() {
      let ground = new Ground(MAPWIDTH, MAPLENGTH);
      ground.name = "ground";
      ground.position.set(MAPWIDTH/2, MAPLENGTH/2, 0);
      this.scene.add(ground);
    }

    addMenu() {
      this.menu = new Menu(this);
    }

    addUnit() {
      let size = new THREE.Vector3(50, 50, 50);
      let coordinates = new THREE.Vector3(500, 300, 25);
      this.addCube(coordinates, size, `cube${this.cubes.length}`);
    }

    removeCube(sceneObject) {
      // remove from this.scene
      this.scene.remove(sceneObject);

      // remove from this.cubes
      for(let i in this.cubes) {
        if(this.cubes[i] == sceneObject) {
          this.cubes.splice(i, 1);
        }
      }

      // remove from this.selectedObjects
      for(let i in this.selectedObjects) {
        if(this.selectedObjects[i] == sceneObject) {
          this.selectedObjects.splice(i, 1);
        }
      }
    }

    addSelectionBox() {
      this.selectionBox = new SelectionBox();
      this.scene.add(this.selectionBox);
      this.selectionBox.setSceneObject(this.scene.getObjectByName('selectionBox'));
    }

    removeSelectionBox() {
      this.scene.remove(this.selectionBox);
      this.selectionBox = null;
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
      this.gameElem = window.getComputedStyle(CANVAS, null);
      this.gameElem.offsetLeft = parseInt(this.gameElem.getPropertyValue('margin-left'));
      this.gameElem.detectedHeight = parseInt(this.gameElem.getPropertyValue('height'));
      this.gameElem.detectedWidth = parseInt(this.gameElem.getPropertyValue('width'));
      this.gameElem.computedWidth = this.gameElem.detectedWidth - this.gameElem.offsetLeft;

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: CANVAS
      });
      this.renderer.setClearColor(0x000000);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.gameElem.computedWidth, this.gameElem.detectedHeight, false);

      this.renderer.autoClear = false;

      // enable shadows
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.renderer.shadowMapSoft = true; // false for better performance

      this.renderer.shadowCameraNear = 3;
      this.renderer.shadowCameraFar = 10000;
      this.renderer.shadowCameraFov = 50;

      this.renderer.shadowMapBias = 0.0039;
      this.renderer.shadowMapDarkness = 0.5;
      this.renderer.shadowMapWidth = MAPWIDTH;
      this.renderer.shadowMapHeight = MAPLENGTH;
    }

    initializeScene() {
      this.scene = new THREE.Scene();
    }

    initializeCamera() {
      this.camera = new Camera(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM, CAMERA_START_X, CAMERA_START_Y, CAMERA_START_Z, MAPWIDTH, MAPLENGTH, MAXZOOM, MINZOOM);

      this.cameraHelper = new THREE.CameraHelper(this.camera);
    }

    initializeLight() {
      this.light = new THREE.DirectionalLight(0xffffff, 1);
      this.light.position.set(0, 0, 1500);
      this.light.castShadow = true;
      this.light.shadowMapDarkness = 0.5;
      this.scene.add(this.light);
    }

    initializeMouse() {
      this.mouse = new THREE.Vector2();
      this.isMouseDown = false;
      this.mouseDownPosition = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();
    }

    getPlayer() {
      return this.player;
    }

    onWindowResize() {
      this.gameElem.offsetLeft = parseInt(this.gameElem.getPropertyValue('margin-left'));
      this.gameElem.detectedHeight = parseInt(this.gameElem.getPropertyValue('height'));
      this.gameElem.detectedWidth = parseInt(this.gameElem.getPropertyValue('width'));
      this.gameElem.computedWidth = this.gameElem.detectedWidth - this.gameElem.offsetLeft;

      this.camera.aspect = this.gameElem.computedWidth / this.gameElem.detectedHeight;
      this.renderer.setSize(this.gameElem.computedWidth, this.gameElem.detectedHeight, false);
      this.camera.updateProjectionMatrix();
    }

    onDocumentKeyUp() {
      switch (event.which) {
        case CONTROLS.leftArrow:
          this.leftArrowIsDown = false;
          break;
        case CONTROLS.rightArrow:
          this.rightArrowIsDown = false;
          break;
        case CONTROLS.upArrow:
          this.upArrowIsDown = false;
          break;
        case CONTROLS.downArrow:
          this.downArrowIsDown = false;
          break;
        case CONTROLS.shift:
          this.shiftIsDown = false;
          break;
        default:
          break;
      }
    }

    onDocumentKeyDown(event) {

      switch (event.which) {
        case CONTROLS.leftArrow:
          this.leftArrowIsDown = true;
          break;
        case CONTROLS.rightArrow:
          this.rightArrowIsDown = true;
          break;
        case CONTROLS.upArrow:
          this.upArrowIsDown = true;
          break;
        case CONTROLS.downArrow:
          this.downArrowIsDown = true;
          break;
        case CONTROLS.shift:
          this.shiftIsDown = true;
          break;
        default:
          break;
      }
    }

    keyboardCameraControls() {
      if(this.leftArrowIsDown || this.rightArrowIsDown || this.upArrowIsDown || this.downArrowIsDown) {
        let newCoords = this.camera.position;

        if(this.leftArrowIsDown) {
          newCoords.x -= SCROLL_SCALE * 100;
        }
        if(this.rightArrowIsDown) {
          newCoords.x += SCROLL_SCALE * 100;
        }
        if(this.upArrowIsDown) {
          newCoords.y += SCROLL_SCALE * 100;
        }
        if(this.downArrowIsDown) {
          newCoords.y -= SCROLL_SCALE * 100;
        }

        this.camera.moveTo(newCoords);
      }
    }

    onDocumentMouseUp(event) {
      event.preventDefault();

      this.isMouseDown = false;

      this.mouseDownPosition.x = event.offsetX;
      this.mouseDownPosition.y = event.offsetY;

      this.worldMouseCoordinatesEnd = this.groundMouseIntersectPoint();

      this.scene.remove(this.selectionBox);
    }

    onDocumentMouseDown(event) {

      event.preventDefault();

      if(this.mouseIsOnGame(event)) {

        this.isMouseDown = true;

        this.mouseDownPosition.x = event.offsetX;
        this.mouseDownPosition.y = event.offsetY;

        if(!this.shiftIsDown) {
          this.worldMouseCoordinatesStart = this.groundMouseIntersectPoint();

          if(this.worldMouseCoordinatesStart !== null) {
            this.addSelectionBox();
            this.selectionBox.startCoordinates(this.worldMouseCoordinatesStart);
          }
        }
      }
    }

    onDocumentMouseRightDown(event) {
      event.preventDefault();

      if(!this.shiftIsDown) {
        // get intersecting point with ground & add a resourceNode there
        this.addResourceNode(this.groundMouseIntersectPoint(), new THREE.Vector3(50, 50, 10));
      }
    }

    onDocumentMouseMove(event) {
      event.preventDefault();

      this.mouse.x = (event.offsetX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;

      if (this.isMouseDown && this.mouseIsOnGame(event)) {
        let oldX = this.mouseDownPosition.x,
            oldY = this.mouseDownPosition.y;

        this.mouseDownPosition.x = event.clientX;
        this.mouseDownPosition.y = event.clientY;

        // move camera along X-Y axis if shift held
        if(this.shiftIsDown) {
          let deltaX = this.mouseDownPosition.x - oldX,
              deltaY = this.mouseDownPosition.y - oldY;

          let screenPercentageX = deltaX / this.gameElem.computedWidth,
              screenPercentageY = deltaY / this.gameElem.detectedHeight;

          let worldDistanceToMoveX = MAPWIDTH * screenPercentageX,
              worldDistanceToMoveY = MAPLENGTH * screenPercentageY;

          // move camera along X-Y plane accordingly
          let newCoords = new THREE.Vector3(
            this.camera.position.x - worldDistanceToMoveX,
            this.camera.position.y + worldDistanceToMoveY,
            this.camera.position.z
          );

          this.camera.moveTo(newCoords);
        } else {
          // send mouse coordinates to selectionBox
          this.selectionBox.continueCoordinates(this.groundMouseIntersectPoint());

          // set this.selectedObjects to those in selectionBox
          for(let i in this.selectedObjects) {
            this.selectedObjects[i].select(false);
          }
          this.selectedObjects = this.selectionBox.getCubesInBox();
        }

        this.camera.updateMatrix();
      }

      this.raycaster.setFromCamera(this.mouse, this.camera);
    }

    onDocumentMouseWheel(event) {
      event.preventDefault();

      /*
        Scrolling up/down zooms camera
      */
      let deltaZ = event.wheelDeltaY/10;
      this.camera.moveTo(new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z - deltaZ));
    }

    groundMouseIntersectPoint() {
      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // calculate objects intersecting the picking ray
      let intersects = this.raycaster.intersectObjects(this.scene.children);

      for(let i in intersects) {
        if(intersects[i].object.name == "ground") {
          return intersects[i].point;
        }
      }

      // if mouse ray doesn't intersect ground, return null
      return null;
    }

    mouseIsOnGame(event) {
      if(event.clientX < MENU_WIDTH) {
        return false;
      } else {
        return true;
      }
    }

    resetScore() {
      this.player.score = 0;
    }

    resetResources() {
      for(let i in this.player.resources) {
        this.player.resources[i] = 0;
      }
    }
}

module.exports = Game;
