/*
jshint
node: true,
esversion: 6,
browser: true
*/
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var THREE = require('three');

var CANVAS = document.getElementById('game');
var CONTAINER = document.getElementById('container');
var MENU = document.getElementById('leftMenu');
var SCREEN_WIDTH = CANVAS.width;
var SCREEN_HEIGHT = CANVAS.height;
var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

/* Game Settings */
var MAPWIDTH = 10000;
var MAPLENGTH = 10000;
var MAPHEIGHT = 1000;
var SHADOWS = true;
var LEVEL = require('../../game/assets/scenario1.json');
var MAP = 'build/output/assets/map.png';

/* Camera Settings */
var FOV = 90;
var MAXFRAMERATE = 1000 / 60;
var NEARFRUSTRAM = 0.1;
var FAFRUSTRAM = 10000;
var CAMERA_START_X = 4000;
var CAMERA_START_Y = 4000;
var CAMERA_START_Z = 3500;
var SCROLL_SCALE = 1;

/* Interface Settings */
var MAXZOOM = 3500;
var MINZOOM = 1000;
var MOUSEDRAGSENSITIVITY = 0.005;
var MENU_WIDTH = parseInt(window.getComputedStyle(MENU, null).getPropertyValue('width'));

/* Import Objects */
var ColladaLoader = require('./objects/ColladaLoader.js');
var Model = require('./objects/Model.js');
var Player = require('./objects/Player.js');
var Camera = require('./objects/Camera.js');
var Menu = require('./objects/Menu/Menu.js');
var LeftMenu = require('./objects/Menu/LeftMenu.js');
var RightMenu = require('./objects/Menu/RightMenu.js');
var SceneObject = require('./objects/SceneObject.js');
var InterfaceObject = require('./objects/InterfaceObject/InterfaceObject.js');
var SelectionBox = require('./objects/InterfaceObject/SelectionBox.js');
var Ground = require('./objects/Ground.js');
var Cube = require('./objects/Cube.js');
var WorkerUnit = require('./objects/Units/Worker.js');
var Building = require('./objects/Building/Building.js');
var Mine = require('./objects/Building/Mine.js');
var Colony = require('./objects/Building/Colony.js');
var Base = require('./objects/Building/Base.js');
var ResourceNode = require('./objects/ResourceNode/ResourceNode.js');
var MetalResourceNode = require('./objects/ResourceNode/MetalResourceNode.js');
var GoldResourceNode = require('./objects/ResourceNode/GoldResourceNode.js');
var FoodResourceNode = require('./objects/ResourceNode/FoodResourceNode.js');

var CONTROLS = {
  leftClick: 1,
  rightClick: 3,
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

var Game = function () {
  function Game() {
    _classCallCheck(this, Game);

    this.initializeRenderer();
    this.initializeScene();
    this.initializeCamera();
    this.initializeLight();
    this.initializeMouse();
    this.onWindowResize();

    this.theta = 45;
    this.phi = 60;
    this.worldMouseCoordinatesStart = new THREE.Vector3(0, 0, 0);
    this.worldMouseCoordinatesEnd = new THREE.Vector3(0, 0, 0);

    this.rightTool = 'createRandomNode';

    this.mouseDragSensitivity = MOUSEDRAGSENSITIVITY;

    this.loader = new THREE.ColladaLoader();
    this.textureLoader = new THREE.TextureLoader();

    this.cubes = [];
    this.buildings = [];
    this.resourceNodes = [];

    this.selectedUnits = [];

    this.player = new Player();
    this.player.resources.metal = 2000;
    this.player.resources.food = 2000;
    this.player.resources.gold = 2000;

    this.loadMap(MAP);

    this.addSelectionBox();

    this.addMenu();

    this.watchEvents();

    this.loadScenario(LEVEL);

    // add grid
    this.grid = new THREE.GridHelper(1000, 10);
    this.grid.rotation.x = Math.PI / 2;
    this.grid.position.set(0, 0, 0);
    this.scene.add(this.grid);
  }

  _createClass(Game, [{
    key: 'update',
    value: function update() {
      this.renderScore();
      this.renderRightMenu();

      for (var i in this.selectedUnits) {
        this.selectedUnits[i].select(true);
      }

      for (var _i in this.cubes) {
        this.cubes[_i].update();
      }

      for (var _i2 in this.resourceNodes) {
        this.resourceNodes[_i2].update();
      }

      for (var _i3 in this.buildings) {
        this.buildings[_i3].update();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this = this;

      // limit animation request to FRAMERATE
      setTimeout(function () {
        var that = _this;
        requestAnimationFrame(function () {
          that.render();
        });
      }, MAXFRAMERATE);

      // perform game updates
      this.update();
      // move camera according to keyboard controls
      this.keyboardCameraControls();
      this.renderer.render(this.scene, this.camera);
    }
  }, {
    key: 'renderScore',
    value: function renderScore() {
      this.leftMenu.updateScore(this.player.score);
      this.leftMenu.updateGold(this.player.resources.gold);
      this.leftMenu.updateFood(this.player.resources.food);
      this.leftMenu.updateMetal(this.player.resources.metal);
    }
  }, {
    key: 'renderRightMenu',
    value: function renderRightMenu() {
      this.rightMenu.render();
    }
  }, {
    key: 'watchEvents',
    value: function watchEvents() {
      // keyboard controls
      document.addEventListener('keydown', this.onDocumentKeyDown.bind(this), false);
      document.addEventListener('keyup', this.onDocumentKeyUp.bind(this), false);

      // mouse controls
      document.addEventListener('mousemove', this.onDocumentMouseMove.bind(this), false);
      document.addEventListener('mousedown', this.onDocumentMouseDown.bind(this), false);
      document.addEventListener('contextmenu', this.onDocumentContextMenu.bind(this), false);
      document.addEventListener('mouseup', this.onDocumentMouseUp.bind(this), false);
      document.addEventListener('mousewheel', this.onDocumentMouseWheel.bind(this), false);

      // resize window
      window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }
  }, {
    key: 'listObjectsInScene',
    value: function listObjectsInScene() {
      this.scene.traverse(function (object) {
        console.log(object);
      });
    }
  }, {
    key: 'listObjectLocationsInScene',
    value: function listObjectLocationsInScene() {
      for (var i in this.scene.children) {
        var unit = this.scene.children[i];
        console.log(unit.name);
        console.log(unit.position);
      }
    }

    /*
      @coordinates: (x, y, z) vector
      @size: (x, y, z) vector
    */

  }, {
    key: 'addCube',
    value: function addCube(coordinates, size, name) {
      if (coordinates !== null) {
        var cube = new Cube(this, // game
        size, undefined // model
        );

        // automatically get unique name
        if (name === undefined) {
          if (this.cubes.length > 0) {
            // get name of last cube in array
            name = 'cube' + (parseInt(this.cubes[this.cubes.length - 1].name.match(/\d+/)) + 1);
          } else {
            name = 'cube0';
          }
        }

        cube.name = name;
        cube.position.set(coordinates.x, coordinates.y, coordinates.z);

        this.scene.add(cube);
        this.cubes.push(cube);

        return cube;
      } else {
        // do nothing; invalid location
      }
    }
  }, {
    key: 'addBuilding',
    value: function addBuilding(coordinates, size, name, type, status) {

      if (name === undefined) {
        name = 'building' + this.cubes.length;
      }

      if (status === undefined) {
        status = 'incomplete';
      }

      var building = void 0;
      switch (type) {
        case 'mine':
          building = new Mine(this, size, type, status);
          break;
        case 'colony':
          building = new Colony(this, size, type, status);
          break;
        case 'base':
          building = new Base(this, size, type, status);
          break;
        default:
          console.error('unrecognized building type ' + type);
          return;
      }

      building.name = name;
      building.position.set(coordinates.x, coordinates.y, coordinates.z);

      this.buildings.push(building);
    }
  }, {
    key: 'removeBuilding',
    value: function removeBuilding(building) {
      if (building.name === undefined) {
        building = this.scene.getObjectByName(building);
      }
      // remove from this.scene
      this.scene.remove(building);

      // remove from this.buildings
      for (var i in this.buildings) {
        if (this.buildings[i] == building) {
          this.buildings.splice(i, 1);
        }
      }
    }
  }, {
    key: 'removeResourceNode',
    value: function removeResourceNode(resourceNode) {

      // remove from this.scene
      this.scene.remove(resourceNode);

      // remove from this.resourceNode
      for (var i in this.resourceNodes) {
        if (this.resourceNodes[i] == resourceNode) {
          this.resourceNodes.splice(i, 1);
        }
      }
    }
  }, {
    key: 'removeAllBuildings',
    value: function removeAllBuildings() {
      var numDeleted = 0;
      for (var i = this.cubes.length - 1; i >= 0; i--) {
        this.removeBuilding(this.buildings[i]);
      }
    }

    /*
      @coordinates: (x, y, z) vector
      @size: (x, y, z) vector
      @type: i.e. 'metal'
    */

  }, {
    key: 'addResourceNode',
    value: function addResourceNode(coordinates, size, type) {
      if (coordinates !== null) {
        var resourceNode = void 0;

        switch (type) {
          case "metal":
            resourceNode = new MetalResourceNode(this, undefined, // size
            1000 // resourceLeft
            );
            break;
          case "food":
            resourceNode = new FoodResourceNode(this, undefined, // size
            1000 // resourceLeft
            );
            break;
          case "gold":
            resourceNode = new GoldResourceNode(this, undefined, // size
            1000 // resourceLeft
            );
            break;
          default:
            console.error('invalid resourceNode type');
            break;
        }

        var name = 'resourceNode' + this.resourceNodes.length;

        resourceNode.name = name;
        resourceNode.position.set(coordinates.x, coordinates.y, coordinates.z);

        this.scene.add(resourceNode);
        this.resourceNodes.push(resourceNode);
      }
    }

    /*
      Adds 100 randomly sized cubes in random places
    */

  }, {
    key: 'addRandomCubes',
    value: function addRandomCubes(number) {
      for (var i = 0; i < number; i++) {
        var random = Math.random();
        var width = random * 100;
        var length = random * 100;
        var height = random * 100;
        var size = new THREE.Vector3(width, length, height);
        var coordinates = new THREE.Vector3(Math.random() * MAPWIDTH, Math.random() * MAPLENGTH, random * 50);
        var name = 'cube' + this.cubes.length;

        this.addCube(coordinates, size, name);
      }
    }
  }, {
    key: 'removeAllCubes',
    value: function removeAllCubes() {
      var numDeleted = 0;
      var numCubes = this.cubes.length;
      for (var i = 0; i < numCubes; i++) {
        this.removeCube(this.cubes[0]);
        numDeleted++;
      }
    }
  }, {
    key: 'removeSelected',
    value: function removeSelected() {
      // could down to avoid skipping nodes
      for (var i = this.selectedUnits.length - 1; i >= 0; i--) {
        switch (this.selectedUnits[i].type) {
          case 'building':
            this.removeBuilding(this.selectedUnits[i]);
            break;
          case 'cube':
            this.removeCube(this.selectedUnits[i]);
            break;
          case 'resourceNode':
            this.removeResourceNode(this.selectedUnits[i]);
            break;
          default:
            console.error('unknown unit type ' + this.selectedUnits[i].type + ' when trying to removeSelected()');
        }
        this.removeCube(this.selectedUnits[i]);
      }
    }
  }, {
    key: 'listAllCubes',
    value: function listAllCubes() {
      for (var i in this.cubes) {
        console.log(this.cubes[i]);
      }
    }
  }, {
    key: 'listAllBuildings',
    value: function listAllBuildings() {
      for (var i in this.buildings) {
        console.log(this.buildings[i]);
      }
    }
  }, {
    key: 'listSelectedUnits',
    value: function listSelectedUnits() {
      console.log(this.selectedUnits);
    }
  }, {
    key: 'listNearbyToSelectedUnits',
    value: function listNearbyToSelectedUnits() {
      for (var i in this.selectedUnits) {
        console.log(this.selectedUnits[i].getClosebyUnits());
      }
    }
  }, {
    key: 'loadScenario',
    value: function loadScenario(jsonFile) {
      this.scenario = jsonFile;

      for (var i in this.scenario) {
        var obj = this.scenario[i];
        var coords = void 0;
        var size = void 0;
        var name = void 0;
        var type = void 0;

        switch (obj.type) {
          case 'cube':
            coords = obj.data.coordinates;
            size = obj.data.size;
            name = obj.data.name;

            this.addCube(coords, size, name);
            break;
          case 'building':

            this.addBuilding(obj.data.coordinates, obj.data.size, obj.data.name, obj.data.type, obj.data.status);
            break;
          case 'resourceNode':
            coords = obj.data.coordinates;
            size = obj.data.size;
            type = obj.data.type;

            this.addResourceNode(coords, size, type);
            break;
          default:
            console.error('Error reading scenario file: unrecognized node type ' + obj.type);
            break;
        }
      }
    }
  }, {
    key: 'snapUpToGround',
    value: function snapUpToGround(objects) {

      for (var i in objects) {
        var height = this.ground.getHeight(objects[i].position.x, objects[i].position.y);

        if (objects[i].position.z < height) {
          objects[i].position.z = height;
        }
      }
    }

    /*
      Loads image from @map, instantiates this.ground and applies the heightMap
    */

  }, {
    key: 'loadMap',
    value: function loadMap(map) {
      var _this2 = this;

      // need a canvas to getImageData()
      var canvas = window.document.createElement('canvas');
      var context = canvas.getContext('2d');

      var img = new Image();

      // assign async callback to do work on the image
      img.onload = function (e) {

        canvas.width = img.width;
        canvas.height = img.height;

        // copy image data pixel-by-pixel onto canvas
        context.drawImage(img, 0, 0);

        // returns an array in RGBA order
        var imgd = context.getImageData(0, 0, img.width, img.height);

        // array of heights, where (0, 0) is top left and iterates collumn-major
        var mapData = [];

        // parse image RGBA data into data array
        for (var i = 0; i < imgd.data.length; i += 4) {
          var r = imgd.data[i];
          var g = imgd.data[i + 1];
          var b = imgd.data[i + 2];
          var a = imgd.data[i + 3];

          var d = (r + b + g) / 3;

          mapData.push(d);
        }

        _this2.ground = new Ground(_this2, MAPWIDTH, MAPLENGTH, mapData);

        _this2.snapUpToGround([].concat(_this2.cubes, _this2.buildings, _this2.resourceNodes));
      };

      img.src = map;
    }
  }, {
    key: 'addMenu',
    value: function addMenu() {
      this.leftMenu = new LeftMenu(this);
      this.rightMenu = new RightMenu(this);
    }
  }, {
    key: 'addUnit',
    value: function addUnit(coords) {
      if (!coords) {
        coords = new THREE.Vector3(Math.random() * MAPWIDTH, Math.random() * MAPLENGTH, 25);
      }

      this.addCube(coords);
    }

    /*
      Send @unit queue job to @building
    */

  }, {
    key: 'queueUnit',
    value: function queueUnit(unit, building) {
      building = this.scene.getObjectByName(building);
      building.queueUnit(unit);
    }
  }, {
    key: 'removeCube',
    value: function removeCube(sceneObject) {
      // remove from this.scene
      this.scene.remove(sceneObject);

      // remove from this.cubes
      for (var i in this.cubes) {
        if (this.cubes[i] == sceneObject) {
          this.cubes.splice(i, 1);
        }
      }

      // remove from this.selectedUnits
      for (var _i4 in this.selectedUnits) {
        if (this.selectedUnits[_i4] == sceneObject) {
          this.selectedUnits.splice(_i4, 1);
        }
      }
    }
  }, {
    key: 'addSelectionBox',
    value: function addSelectionBox() {
      this.selectionBox = new SelectionBox();
      this.scene.add(this.selectionBox);
      this.selectionBox.setSceneObject(this.scene.getObjectByName('selectionBox'));
    }
  }, {
    key: 'removeSelectionBox',
    value: function removeSelectionBox() {
      this.scene.remove(this.selectionBox);
      this.selectionBox = null;
    }
  }, {
    key: 'initializeRenderer',
    value: function initializeRenderer() {
      this.gameElem = window.getComputedStyle(CANVAS, null);
      this.gameElem.offsetLeft = parseInt(this.gameElem.getPropertyValue('margin-left'));
      this.gameElem.detectedHeight = parseInt(this.gameElem.getPropertyValue('height'));
      this.gameElem.detectedWidth = parseInt(this.gameElem.getPropertyValue('width'));
      this.gameElem.computedWidth = this.gameElem.detectedWidth - this.gameElem.offsetLeft;

      // renderer
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: CANVAS
      });
      this.renderer.setClearColor(0x000000);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.gameElem.computedWidth, this.gameElem.detectedHeight, false);

      // shadows
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
  }, {
    key: 'initializeScene',
    value: function initializeScene() {
      this.scene = new THREE.Scene();
    }
  }, {
    key: 'initializeCamera',
    value: function initializeCamera() {
      this.camera = new Camera(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM, CAMERA_START_X, CAMERA_START_Y, CAMERA_START_Z, MAPWIDTH, MAPLENGTH, MAXZOOM, MINZOOM);

      this.camera.lookAt(new THREE.Vector3(MAPWIDTH / 2, MAPLENGTH / 2, 0));

      this.camera.rotation.x = -Math.cos(Math.PI * 0.55);
      this.camera.rotation.y = 0;
      this.camera.rotation.z = 0;

      this.cameraHelper = new THREE.CameraHelper(this.camera);
      this.camera.updateProjectionMatrix();
    }
  }, {
    key: 'initializeLight',
    value: function initializeLight() {

      this.ambientLight = new THREE.AmbientLight(0xaaaaaa);

      this.light = new THREE.DirectionalLight(0xffffff, 1);

      this.lightTarget = new THREE.Object3D();
      this.lightTarget.position.set(MAPWIDTH / 2, MAPLENGTH / 2, 0);
      this.scene.add(this.lightTarget);
      this.light.target = this.lightTarget;
      this.light.castShadow = true;
      this.light.position.set(0, 0, 2000);

      this.scene.add(this.ambientLight);
      this.scene.add(this.light);
    }
  }, {
    key: 'initializeMouse',
    value: function initializeMouse() {
      this.mouse = new THREE.Vector2();
      this.isMouseDown = false;
      this.mouseDownPosition = new THREE.Vector2();
      this.raycaster = new THREE.Raycaster();

      this.lastMousePosition = new THREE.Vector2();

      this.leftTool = 'select';
      this.rightTool = 'createNode';
    }
  }, {
    key: 'getPlayer',
    value: function getPlayer() {
      return this.player;
    }
  }, {
    key: 'onWindowResize',
    value: function onWindowResize() {
      this.gameElem.offsetLeft = parseInt(this.gameElem.getPropertyValue('margin-left'));
      this.gameElem.detectedHeight = parseInt(this.gameElem.getPropertyValue('height'));
      this.gameElem.detectedWidth = parseInt(this.gameElem.getPropertyValue('width'));
      this.gameElem.computedWidth = this.gameElem.detectedWidth - this.gameElem.offsetLeft;

      this.camera.aspect = this.gameElem.computedWidth / this.gameElem.detectedHeight;
      this.renderer.setSize(this.gameElem.computedWidth, this.gameElem.detectedHeight, false);
      this.camera.updateProjectionMatrix();
    }
  }, {
    key: 'onDocumentKeyUp',
    value: function onDocumentKeyUp() {
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
        case CONTROLS.w:
          this.wIsDown = false;
          break;
        case CONTROLS.a:
          this.aIsDown = false;
          break;
        case CONTROLS.s:
          this.sIsDown = false;
          break;
        case CONTROLS.d:
          this.dIsDown = false;
          break;
        default:
          break;
      }
    }
  }, {
    key: 'onDocumentKeyDown',
    value: function onDocumentKeyDown(event) {

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
        case CONTROLS.w:
          this.wIsDown = true;
          break;
        case CONTROLS.a:
          this.aIsDown = true;
          break;
        case CONTROLS.s:
          this.sIsDown = true;
          break;
        case CONTROLS.d:
          this.dIsDown = true;
          break;
        default:
          break;
      }
    }
  }, {
    key: 'keyboardCameraControls',
    value: function keyboardCameraControls() {
      if (this.leftArrowIsDown || this.rightArrowIsDown || this.upArrowIsDown || this.downArrowIsDown || this.wIsDown || this.aIsDown || this.sIsDown || this.dIsDown) {
        var newCoords = this.camera.position;

        if (this.leftArrowIsDown || this.aIsDown) {
          newCoords.x -= SCROLL_SCALE * 100;
        }
        if (this.rightArrowIsDown || this.dIsDown) {
          newCoords.x += SCROLL_SCALE * 100;
        }
        if (this.upArrowIsDown || this.wIsDown) {
          newCoords.y += SCROLL_SCALE * 100;
        }
        if (this.downArrowIsDown || this.sIsDown) {
          newCoords.y -= SCROLL_SCALE * 100;
        }

        this.camera.moveTo(newCoords);
      }
    }
  }, {
    key: 'onDocumentMouseUp',
    value: function onDocumentMouseUp(event) {
      event.preventDefault();

      if (event.which == CONTROLS.leftClick) {
        this.isMouseDown = false;

        var intersects = this.getObjectsUnderMouse();
        var ground = void 0;
        var building = void 0;
        var resourceNode = void 0;

        // iterate over all objects under mouse
        for (var i in intersects) {

          if (intersects[i].type == 'building') {
            building = intersects[i];
          }

          if (intersects[i].type == 'resourceNode') {
            resourceNode = intersects[i];
          }

          // cache ground for later reference
          if (intersects[i].object == this.ground) {
            ground = intersects[i];
          }
        }

        if (!this.shiftIsDown && this.mouseIsOnGame(event)) {

          if (ground) {
            this.worldMouseCoordinatesEnd = ground.point;
          }

          var mouseChangeSinceDown = new THREE.Vector2(this.mouseDownPosition.x - this.mouse.x, this.mouseDownPosition.y - this.mouse.y);

          if (Math.abs(mouseChangeSinceDown.x) < this.mouseDragSensitivity && Math.abs(mouseChangeSinceDown.y) < this.mouseDragSensitivity) {

            this.deselectAllUnits();

            if (building) {
              this.selectedUnits.push(building);
            }

            if (resourceNode) {
              this.selectedUnits.push(resourceNode);
            }
          }
        }

        this.mouseDownPosition.x = this.mouse.x;
        this.mouseDownPosition.y = this.mouse.y;
      } else if (event.which == CONTROLS.rightClick) {
        this.isRightMouseDown = false;

        if (this.selectedUnits.length > 0) {
          this.useRightTool('assign');
        } else {
          this.useRightTool(this.rightTool);
        }
      }

      this.scene.remove(this.selectionBox);
    }
  }, {
    key: 'onDocumentMouseDown',
    value: function onDocumentMouseDown(event) {

      event.preventDefault();

      if (this.mouseIsOnGame(event)) {

        if (event.which == CONTROLS.leftClick) {
          this.isMouseDown = true;

          this.mouseDownPosition.x = this.mouse.x;
          this.mouseDownPosition.y = this.mouse.y;

          if (!this.shiftIsDown) {
            this.worldMouseCoordinatesStart = this.mouseIntersectPoint(this.ground);

            if (this.worldMouseCoordinatesStart !== null) {
              this.addSelectionBox();
              this.selectionBox.startCoordinates(this.worldMouseCoordinatesStart);
            }
          }
        } else if (event.which == CONTROLS.rightClick) {
          this.isRightMouseDown = true;
        }
      }
    }
  }, {
    key: 'onDocumentContextMenu',
    value: function onDocumentContextMenu(event) {
      event.preventDefault();
    }
  }, {
    key: 'onDocumentMouseMove',
    value: function onDocumentMouseMove(event) {
      event.preventDefault();

      this.mouse.x = event.offsetX / window.innerWidth * 2 - 1;
      this.mouse.y = -(event.offsetY / window.innerHeight) * 2 + 1;

      // click down
      if (this.isMouseDown && this.mouseIsOnGame(event)) {

        // move camera along X-Y axis if shift held
        if (this.shiftIsDown) {

          // calculate movement since first clicked
          var deltaX = this.lastMousePosition.x - event.offsetX,
              deltaY = this.lastMousePosition.y - event.offsetY;

          // move camera along X-Y plane accordingly
          var newCoords = new THREE.Vector3(this.camera.position.x + deltaX * 10, this.camera.position.y - deltaY * 10, this.camera.position.z);

          this.camera.moveTo(newCoords);
        } else {
          // send mouse coordinates to selectionBox
          this.selectionBox.continueCoordinates(this.mouseIntersectPoint(this.ground));

          // set this.selectedUnits to those in selectionBox
          this.deselectAllUnits();
          this.selectedUnits = this.selectionBox.getCubesInBox();
        }

        this.camera.updateMatrix();
      }

      this.lastMousePosition = new THREE.Vector2(event.offsetX, event.offsetY);

      this.raycaster.setFromCamera(this.mouse, this.camera);
    }
  }, {
    key: 'onDocumentMouseWheel',
    value: function onDocumentMouseWheel(event) {
      event.preventDefault();

      /*
        Scrolling up/down zooms camera
      */
      var deltaZ = event.wheelDeltaY / 10;
      this.camera.moveTo(new THREE.Vector3(this.camera.position.x, this.camera.position.y, this.camera.position.z - deltaZ));
    }
  }, {
    key: 'mouseIntersectPoint',
    value: function mouseIntersectPoint(obj) {
      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      /*
        TODO: arg to intersectObjects should just be obj.
      */

      // calculate objects intersecting the picking ray
      var intersects = this.raycaster.intersectObjects(this.scene.children, true);

      for (var i in intersects) {
        if (intersects[i].object == obj) {
          return intersects[i].point;
        }
      }

      // if mouse ray doesn't intersect anything, return null
      return null;
    }
  }, {
    key: 'deselectAllUnits',
    value: function deselectAllUnits() {
      for (var i in this.selectedUnits) {
        this.selectedUnits[i].select(false);
      }
      this.selectedUnits = [];
    }
  }, {
    key: 'useRightTool',
    value: function useRightTool(tool) {
      var groundIntersect = void 0;
      switch (tool) {
        case 'createRandomNode':
          if (!this.shiftIsDown) {
            // get intersecting point with ground & add a random resourceNode there
            var nodeTypes = ['metal', 'gold', 'food'];
            var nodeToMake = nodeTypes[this.getRandomInt(0, nodeTypes.length - 1)];

            this.addResourceNode(this.mouseIntersectPoint(this.ground), new THREE.Vector3(50, 50, 10), nodeToMake);
          }
          break;
        case 'createResourceNode':
          if (!this.shiftIsDown) {
            // place a new cube at ground intersetion
            groundIntersect = this.mouseIntersectPoint(this.ground);

            if (groundIntersect) {
              this.rightToolArgs[0] = groundIntersect;
            }

            this.addResourceNode.apply(this, this.rightToolArgs);
          }
          break;
        case 'assign':
          // update the picking ray with the camera and mouse position
          this.raycaster.setFromCamera(this.mouse, this.camera);

          // calculate objects intersecting the picking ray
          // build array of objects to check for
          var objects = [];
          objects.push.apply(objects, this.buildings);
          objects.push.apply(objects, this.resourceNodes);
          objects.push.apply(objects, this.cubes);
          objects.push.call(objects, this.ground);

          var gameObjects = this.getObjectsUnderMouse(objects, true);

          // iterate over click intersect objects, camera -> ground
          for (var i in gameObjects) {

            var returnValue = gameObjects[i].assign(this.selectedUnits, gameObjects[i].point);

            /*
              object.assign() returns null and bubbles by default;
              if bubbling should continue, its object.assign() should return falsey
            */
            if (returnValue) {
              // stop bubbling
              break;
            }{
              // continue bubbling up gameObjects array
            }
          }

          break;
        case 'createCube':

          // place a new cube at ground intersetion
          groundIntersect = this.mouseIntersectPoint(this.ground);

          if (groundIntersect) {
            this.rightToolArgs[0] = groundIntersect;
          }

          // place new cube according to rightToolArgs
          this.addCube.apply(this, this.rightToolArgs);

          break;
        case 'createBuilding':
          // place a new building at ground intersetion
          groundIntersect = this.raycaster.intersectObjects([this.ground])[0];

          if (groundIntersect) {
            this.addBuilding(groundIntersect.point, undefined, undefined, 'mine', 'complete');
          }
          break;
        case 'buildBuilding':
          // place a new building at ground intersetion
          groundIntersect = this.raycaster.intersectObjects([this.ground])[0];

          if (groundIntersect) {
            this.addBuilding(groundIntersect.point, undefined, undefined, 'mine', 'incomplete');
          }
          break;
        default:
          console.error('no rightTool assigned');
          break;
      }
    }
  }, {
    key: 'mouseIsOnGame',
    value: function mouseIsOnGame(event) {
      if (event.target == CANVAS) {
        return true;
      } else {
        return false;
      }
    }
  }, {
    key: 'getObjectsUnderMouse',
    value: function getObjectsUnderMouse(objects, recursive) {
      if (objects === undefined) {
        objects = this.scene.children;
      }
      if (recursive === undefined) {
        recursive = true;
      }

      // update the picking ray with the camera and mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // calculate objects intersecting the picking ray
      var intersects = this.raycaster.intersectObjects(objects, recursive);

      var gameObjects = [];

      for (var i in intersects) {
        var obj = intersects[i].object;
        while (obj.parent !== null) {
          // only looking for game models
          if (obj.parent == this.scene) {
            // push unique obj onto gameObjects
            if (gameObjects.indexOf(obj) === -1) {
              obj.point = intersects[i].point;
              gameObjects.push(obj);
            }
            break;
          } else {
            obj = obj.parent;
          }
        }
      }

      return gameObjects;
    }
  }, {
    key: 'resetScore',
    value: function resetScore() {
      this.player.score = 0;
    }
  }, {
    key: 'resetResources',
    value: function resetResources() {
      for (var i in this.player.resources) {
        this.player.resources[i] = 0;
      }
    }
  }, {
    key: 'setRightTool',
    value: function setRightTool(tool, args) {
      this.rightTool = tool;

      if (args !== undefined) {
        this.rightToolArgs = args;
      } else {
        this.rightToolArgs = [];
      }
    }
  }, {
    key: 'getRandomInt',
    value: function getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }]);

  return Game;
}();

module.exports = Game;
//# sourceMappingURL=Game.js.map