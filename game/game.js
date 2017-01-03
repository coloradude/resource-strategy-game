/*jshint
node: true,
esversion: 6,
browser: true
*/
'use strict';

const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);
const CANVAS = document.getElementById('game');
const CONTAINER = document.getElementById('container');
const SCREEN_WIDTH = CANVAS.width;
const SCREEN_HEIGHT = CANVAS.height;
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

/* Game Settings */
const MAPWIDTH = 10000;
const MAPLENGTH = 10000;
const MAPHEIGHT = 1000;

/* Camera Settings */
const FOV = 90;
const MAXFRAMERATE = 1000 / 30; // 30fps
const NEARFRUSTRAM = 0.1;
const FAFRUSTRAM = 10000;
const CAMERA_START_X = MAPWIDTH / 2;
const CAMERA_START_Y = MAPLENGTH / 2;
const CAMERA_START_Z = 2000;

/* Interface Settings */
const MAXZOOM = 2500;
const MINZOOM = 100;
const MENU_WIDTH = 200;

class Game{
    constructor() {
      this.initializeRenderer();
      this.initializeScene();
      this.initializeCamera();
      this.initializeLight();
      this.initializeMouse();

      this.radius = 10;
      this.theta = 45;
      this.phi = 60;
      this.worldMouseCoordinatesStart = new THREE.Vector3(0, 0, 0);
      this.worldMouseCoordinatesEnd = new THREE.Vector3(0, 0, 0);

      this.cubes = [];
      this.resourceNodes = [];

      this.selectedObjects = [];

      this.player = new Player();

      this.addGround();

      this.addMenu();

      this.watchEvents();

      this.scenario1();
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
      this.renderer.render(this.scene, this.camera);

      // limit animation request to FRAMERATE
      setTimeout(() => {
        let that = this;
        requestAnimationFrame(() => {
          that.render();
        }, MAXFRAMERATE);
      });
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
        console.log(object.name);
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

    scenario1() {
      // add 4 home cubes
      let size = new THREE.Vector3(50, 50, 50);

      this.addCube(new THREE.Vector3(500, 300, 25), size, 'soldier1');

      this.addCube(new THREE.Vector3(400, 300, 25), size, 'soldier2');

      this.addCube(new THREE.Vector3(400, 300, 25), size, 'soldier3');

      this.addCube(new THREE.Vector3(400, 300, 25), size, 'soldier4');

      // add resource nodes
      this.addResourceNode(new THREE.Vector3(1000, 300, 25), size, 'metal');

      this.addResourceNode(new THREE.Vector3(2000, 1200, 25), size, 'food');

      this.addResourceNode(new THREE.Vector3(3000, 2400, 25), size, 'gold');
    }

    addGround() {
      let ground = new Ground();
      ground.name = "ground";
      ground.position.set(MAPWIDTH/2, MAPLENGTH/2, 0);
      this.scene.add(ground);
    }

    addMenu() {
      this.menu = new Menu();
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
      let marginLeft = parseInt(this.gameElem.getPropertyValue('margin-left'));
      let height = parseInt(this.gameElem.getPropertyValue('height'));
      let width = parseInt(this.gameElem.getPropertyValue('width'));
      let computedWidth = width - marginLeft;

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: CANVAS
      });
      this.renderer.setClearColor(0x000000);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(computedWidth, height, false);

      this.renderer.autoClear = false;

      // enable shadows
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowMap;
      this.renderer.shadowMapSoft = true;

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
      this.camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM);
      this.camera.position.x = CAMERA_START_X;
      this.camera.position.y = CAMERA_START_Y;
      this.camera.position.z = CAMERA_START_Z;

      let marginLeft = parseInt(this.gameElem.getPropertyValue('margin-left'));
      let height = parseInt(this.gameElem.getPropertyValue('height'));
      let width = parseInt(this.gameElem.getPropertyValue('width'));
      let computedWidth = width - marginLeft;

      this.camera.aspect = computedWidth / height;

      this.cameraHelper = new THREE.CameraHelper(this.camera);
    }

    initializeLight() {
      let light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(0, 0, 2500);
      light.castShadow = true;
      this.scene.add(light);
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
      let marginLeft = parseInt(this.gameElem.getPropertyValue('margin-left'));
      let height = parseInt(this.gameElem.getPropertyValue('height'));
      let width = parseInt(this.gameElem.getPropertyValue('width'));
      let computedWidth = width - marginLeft;

      this.camera.aspect = computedWidth / height;
      this.renderer.setSize(computedWidth, height, false);
      this.camera.updateProjectionMatrix();
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
          break;
      }
    }

    onDocumentMouseUp(event) {
      event.preventDefault();

      this.isMouseDown = false;

      this.mouseDownPosition.x = event.offsetX;
      this.mouseDownPosition.y = event.offsetY;

      this.worldMouseCoordinatesEnd = this.groundMouseIntersectPoint();

      this.scene.remove(this.selectionBox);

      if(this.mouseIsOnGame(event)) {
        /*
          create bounding box to determine which objects were selected
          boundingBox = ((minX, minY), (maxX, maxY))
        */
        let boundingBox = new THREE.Vector2(
          new THREE.Vector2(
            Math.min(this.worldMouseCoordinatesStart.x, this.worldMouseCoordinatesEnd.x),
            Math.min(this.worldMouseCoordinatesStart.y, this.worldMouseCoordinatesEnd.y)
          ),
          new THREE.Vector2(
            Math.max(this.worldMouseCoordinatesStart.x, this.worldMouseCoordinatesEnd.x),
            Math.max(this.worldMouseCoordinatesStart.y, this.worldMouseCoordinatesEnd.y)
          )
        );

        // deselect all units
        for(let i in this.selectedObjects) {
          this.selectedObjects[i].select(false);
        }

        this.selectedObjects = [];

        // gather cubes in selection & add to this.selectedObjects
        for(let i in this.cubes) {
          if(
            this.cubes[i].position.x >= boundingBox.x.x &&
            this.cubes[i].position.y >= boundingBox.x.y &&
            this.cubes[i].position.x <= boundingBox.y.x &&
            this.cubes[i].position.y <= boundingBox.y.y
          ) {
            this.selectedObjects.push(this.cubes[i]);
          }
        }
      }
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

    addSelectionBox() {
      this.selectionBox = new SelectionBox();
      this.scene.add(this.selectionBox);
    }

    removeSelectionBox() {
      this.scene.remove(this.selectionBox);
      this.selectionBox = null;
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

      if (this.isMouseDown) {
        let oldX = this.mouseDownPosition.x,
            oldY = this.mouseDownPosition.y;

        this.mouseDownPosition.x = event.clientX;
        this.mouseDownPosition.y = event.clientY;

        // move camera along X-Y axis if shift held
        if(this.shiftIsDown) {
          let deltaX = this.mouseDownPosition.x - oldX,
              deltaY = this.mouseDownPosition.y - oldY;

          let screenPercentageX = deltaX / window.innerWidth,
              screenPercentageY = deltaY / window.innerHeight;

          // move camera along X-Y plane accordingly
          this.camera.position.x -= deltaX;
          this.camera.position.y += deltaY;
        } else {
          // send mouse coordinates to selectionBox
          this.selectionBox.continueCoordinates(this.groundMouseIntersectPoint());
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
      if(event.x < MENU_WIDTH) {
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

class SceneObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);

    // movement options
    this.speed = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);

    // rendering options
    this.castShadow = true;
    this.receiveShadow = true;

    this.boundingBox = null;
    this.destination = null;

    this.selectedColor = 0xFFFFFF;
    this.unselectedColor = 0xCC0000;
  }

  update() {
    this.moveTowardDestination(this.destination);
  }

  moveTowardDestination(destination = null) {
    if(destination !== null) {
      let difX = destination.x - this.position.x;
      let difY = destination.y - this.position.y;
      let difZ = destination.z - this.position.z;

      // correct destination
      difX -= Math.sign(difX) * this.size.x/2;
      difY -= Math.sign(difY) * this.size.y/2;
      difZ -= Math.sign(difZ) * this.size.z/2;

      let d = Math.sqrt(Math.pow(difX, 2) + Math.pow(difY, 2) + Math.pow(difZ, 2));

      // move at constant speed no matter the direction
      this.velocity.x = (this.speed * difX) / d;
      this.velocity.y = (this.speed * difY) / d;
      this.velocity.z = (this.speed * difZ) / d;

      if(this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0) {
        // update position
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;
        this.position.z += this.velocity.z;

        // store local position
        this.position.x = this.position.x;
        this.position.y = this.position.y;
        this.position.z = this.position.z;
      }
    }
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  setSceneObject(sceneObject) {
    this.boundingBox = new THREE.Box3().setFromObject(this);
    this.size = this.getSize();
  }

  getSize() {
    return new THREE.Vector3(this.boundingBox.max.x - this.boundingBox.min.x, this.boundingBox.max.y - this.boundingBox.min.y, this.boundingBox.max.z - this.boundingBox.min.z);
  }

  getDistanceFrom(sceneObject) {
    // 3-dimensional pythagorean formula
    return Math.sqrt(
      Math.pow(this.position.x - sceneObject.position.x, 2) +
      Math.pow(this.position.y - sceneObject.position.y, 2) +
      Math.pow(this.position.z - sceneObject.position.z, 2)
    );
  }

  select(selected) {
    if(selected) {
      this.material.color.setHex(this.selectedColor);
    } else {
      this.material.color.setHex(this.unselectedColor);
    }
  }
}

class Ground extends SceneObject {
  constructor() {
    let geometry = new THREE.PlaneBufferGeometry(MAPWIDTH, MAPLENGTH, 1, 1);
    let loader = new THREE.TextureLoader();
    let texture = loader.load('./build/output/assets/sand.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat = new THREE.Vector2(5, 5);
    let material = new THREE.MeshBasicMaterial({
      map: texture
    });

    super(geometry, material);
  }
}

class Cube extends SceneObject {
  constructor(size) {
    let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    let material = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });

    super(geometry, material);
    this.type = "Cube";

    this.speed = 10;
  }

  update() {
    // find & process all resource nodes
    let resourceNodes = window.game.resourceNodes.map((sceneObject) => {
      sceneObject.distance = this.getDistanceFrom(sceneObject);
      return sceneObject;
    });

    // move toward closest resource node
    if(resourceNodes.length > 0) {
      let minDistanceNode = resourceNodes[0];
      for(let i in resourceNodes) {
        if(resourceNodes[i].distance < minDistanceNode.distance) {
          minDistanceNode = resourceNodes[i];
        }
      }
      this.destination = minDistanceNode.position;

      // add resource points according to closest resource node
      if(this.getDistanceFrom(minDistanceNode) < 100) {
        window.game.player.resources[minDistanceNode.resourceType] += 1;
      }
    }

    super.update();
  }
}

class ResourceNode extends SceneObject {
  constructor(geometry, material) {
    let size = 50;
    let widthSegments = 5;
    let heightSegments = 5;
    geometry = geometry || new THREE.SphereGeometry(size, widthSegments, heightSegments);
    material = material || new THREE.MeshLambertMaterial({
      color: 0xcc44ac
    });

    super(geometry, material);

    this.type = "resourceNode";
    this.resourceType = null;
  }
}

class MetalResourceNode extends ResourceNode {
  constructor() {
    let geometry = null;
    let material = new THREE.MeshLambertMaterial({
      color: 0x333333
    });
    super(geometry, material);
    this.resourceType = "metal";
  }
}

class GoldResourceNode extends ResourceNode {
  constructor() {
    let geometry = null;
    let material = new THREE.MeshLambertMaterial({
      color: 0xFFFF00
    });
    super(geometry, material);
    this.resourceType = "gold";
  }
}

class FoodResourceNode extends ResourceNode {
  constructor() {
    let geometry = null;
    let material = new THREE.MeshLambertMaterial({
      color: 0xf4a742
    });
    super(geometry, material);
    this.resourceType = "food";
  }
}

class InterfaceObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  setSceneObject(sceneObject) {
    this.boundingBox = new THREE.Box3().setFromObject(sceneObject);
    this.size = this.getSize();
  }

  getSize() {
    return new THREE.Vector3(this.boundingBox.max.x - this.boundingBox.min.x, this.boundingBox.max.y - this.boundingBox.min.y, this.boundingBox.max.z - this.boundingBox.min.z);
  }
}

class SelectionBox extends InterfaceObject {
  constructor() {
    let geometry = new THREE.BoxGeometry(1000, 1000, 1000);
    let material = new THREE.MeshLambertMaterial({
      color: 0xCCCC00
    });

    super(geometry, material);
    this.name = "selectionBox";
    this.type = "interface";
    this.position.set(new THREE.Vector3(0, 0, 0));
  }

  startCoordinates(coords) {
    this.position.set(coords);
  }

  continueCoordinates(coords = new THREE.Vector3(0, 0, 0)) {
    this.geometry = new THREE.BoxGeometry(
      this.position.x + coords.x,
      this.position.y + coords.y,
      this.position.z + coords.z
    );
  }

  endCoordinates(coords) {

  }
}

class Menu {
  constructor() {
    this.element = document.getElementById('menu');
  }

  updateFood(food) {
    document.getElementById('player-food').innerHTML = food;
  }

  updateGold(gold) {
    document.getElementById('player-gold').innerHTML = gold;
  }

  updateMetal(metal) {
    document.getElementById('player-metal').innerHTML = metal;
  }

  updateScore(score) {
    document.getElementById('player-score').innerHTML = score;
  }
}

class Player {
  constructor() {
    this.resources = {
      gold: 0,
      metal: 0,
      food: 0
    };
    this.score = 0;
  }
}
