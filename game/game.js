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
const MAPWIDTH = 5000;
const MAPLENGTH = MAPWIDTH / ASPECT;
const MAPHEIGHT = 1000;

/* Camera Settings */
const FOV = 90;

const NEARFRUSTRAM = 0.1;
const FAFRUSTRAM = 10000;
const CAMERA_START_X = MAPWIDTH / 2;
const CAMERA_START_Y = MAPLENGTH / 2;
const CAMERA_START_Z = 2000;

/* Interface Settings */
const MAXZOOM = 2500;
const MINZOOM = 100;

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

      this.cubes = [];
      this.resourceNodes = [];

      this.addGround();

      this.addMenu();

      this.watchEvents();

      this.scenario1();
    }

    update() {
        for(let i in this.cubes) {
          this.cubes[i].update();
        }

        for(let i in this.resourceNodes) {
          this.resourceNodes[i].update();
        }
    }

    render() {
        this.update();
        this.renderer.render(this.scene, this.camera);
        // requestAnimationFrame(this.render());
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
    addCube(coordinates = new THREE.Vector3(0, 0, 0), size = new THREE.Vector3(100, 100, 100), name = `cube${this.cubes.length}`) {
      let cube = new Cube(size);

      cube.name = name;
      cube.position.set(coordinates.x, coordinates.y, coordinates.z);

      this.scene.add(cube);
      this.cubes.push(cube);

      cube.setName(name);
      cube.setScene(this.scene);
      cube.setSceneObject(this.scene.getObjectByName(name));

      // console.log(`added cube to scene at position (${cube.position.x}, ${cube.position.y}, ${cube.position.z}) using coordinates (${coordinates.x}, ${coordinates.y}, ${coordinates.z})`);
    }

    /*
    @coordinates: (x, y, z) vector
    @size: (x, y, z) vector
    */
    addResourceNode(coordinates = new THREE.Vector3(0, 0, 0), size = new THREE.Vector3(100, 100, 100), name = `resourceNode${this.resourceNodes.length}`) {
      let resourceNode = new ResourceNode();

      resourceNode.name = name;
      resourceNode.position.set(coordinates.x, coordinates.y, coordinates.z);

      this.scene.add(resourceNode);
      this.resourceNodes.push(resourceNode);

      resourceNode.setName(name);
      resourceNode.setScene(this.scene);
      resourceNode.setSceneObject(this.scene.getObjectByName(name));
    }

    /*
      Adds 1000 randomly sized cubes in random places
    */
    addRandomCubes(coordinates = new THREE.Vector3(0, 0, 0), number = 1000) {
      for(let i = 0; i < number; i++) {
        let random = Math.random();
        let width = random * 100;
        let length = random * 100;
        let height = 10;
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

    listAllCubes() {
      for(let i in this.cubes) {
        console.log(this.cubes[i]);
      }
    }

    scenario1() {
      this.addRandomCubes(null, 100);

      // add 4 home cubes
      let size = new THREE.Vector3(50, 50, 50);
      let coordinates = new THREE.Vector3(500, 300, 25);
      this.addCube(coordinates, size, 'soldier1');

      coordinates = new THREE.Vector3(400, 300, 25);
      this.addCube(coordinates, size, 'soldier2');

      coordinates = new THREE.Vector3(400, 300, 25);
      this.addCube(coordinates, size, 'soldier3');

      coordinates = new THREE.Vector3(400, 300, 25);
      this.addCube(coordinates, size, 'soldier4');

      // add resource nodes
      coordinates = new THREE.Vector3(1000, 300, 25);
      this.addResourceNode(coordinates, size);

      coordinates = new THREE.Vector3(2000, 1200, 25);
      this.addResourceNode(coordinates, size);
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
      for(let i in this.cubes) {
        if(this.cubes[i] == sceneObject) {
          let removed = this.cubes.splice(i, 1);
          this.scene.remove(sceneObject);
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
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.getElementById('game')
      });
      this.renderer.setClearColor(0x000000);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);

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

    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.renderer.setSize(window.innerWidth, window.innerHeight, false);
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
          break;
      }
    }

    onDocumentMouseUp(event) {

      event.preventDefault();

      this.isMouseDown = false;

      // console.log(`mouseup detected; \nold position: ${this.mouseDownPosition.x}, ${this.mouseDownPosition.y}`);

      this.mouseDownPosition.x = event.clientX;
      this.mouseDownPosition.y = event.clientY;

      // console.log(`new position: ${this.mouseDownPosition.x}, ${this.mouseDownPosition.y}`);
    }

    onDocumentMouseDown(event) {

      event.preventDefault();

      this.isMouseDown = true;

      this.mouseDownPosition.x = event.clientX;
      this.mouseDownPosition.y = event.clientY;

      if(!this.shiftIsDown) {
        // get intersecting point with ground & add a cube there

        // update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // calculate objects intersecting the picking ray
        let intersects = this.raycaster.intersectObjects(this.scene.children);

        // loop through intersecting objects
        for(let intersect of intersects) {
          if(intersect.object.type == "Cube") {
            this.removeCube(intersect.object);
            break;
          }
          // add cube on ground where user clicks
          else if(intersect.object.name == "ground") {
            this.addCube(new THREE.Vector3(intersect.point.x, intersect.point.y, 0), new THREE.Vector3(50, 50, 10));
          }
        }
      }
    }

    onDocumentMouseRightDown(event) {
      event.preventDefault();

      if(!this.shiftIsDown) {
        // get intersecting point with ground & add a resourceNode there
        this.addResourceNode(this.groundMouseIntersect(), new THREE.Vector3(50, 50, 10));
        console.log('right click');
      }
    }

    onDocumentMouseMove(event) {
      event.preventDefault();

      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

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

    groundMouseIntersect() {
      // calculate objects intersecting the picking ray
      let intersects = this.raycaster.intersectObjects(this.scene.children);

      for(let i in intersects) {
        if(intersects[i].object.name == "ground") {
          return intersects[i].point;
        }
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
    this.sceneObject = null;
    this.destination = null;
  }

  update() {
    if(this.sceneObject !== null) {
      this.moveTowardDestination(this.destination);
    }
  }

  moveTowardDestination(destination = null) {

    if(destination !== null) {
      let difX = this.sceneObject.position.x - destination.x;
      let difY = this.sceneObject.position.y - destination.y;
      let difZ = this.sceneObject.position.z - destination.z;

      if(Math.abs(difX) > this.size.x) {
        this.velocity.x = this.speed * -Math.sign(difX);
      } else {
        this.velocity.x = 0;
      }

      if(Math.abs(difY) > this.size.y) {
        this.velocity.y = this.speed * -Math.sign(difY);
      } else {
        this.velocity.y = 0;
      }

      if(Math.abs(difZ) > this.size.z) {
        this.velocity.z = this.speed * -Math.sign(difZ);
      } else {
        this.velocity.z = 0;
      }

      if(this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0) {
        // update position
        this.sceneObject.position.x += this.velocity.x;
        this.sceneObject.position.y += this.velocity.y;
        this.sceneObject.position.z += this.velocity.z;

        // store local position
        this.position.x = this.sceneObject.position.x;
        this.position.y = this.sceneObject.position.y;
        this.position.z = this.sceneObject.position.z;
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
    this.sceneObject = sceneObject;
    this.boundingBox = new THREE.Box3().setFromObject(this.sceneObject);
    this.size = this.getSize();
  }

  getSize() {
    return new THREE.Vector3(this.boundingBox.max.x - this.boundingBox.min.x, this.boundingBox.max.y - this.boundingBox.min.y, this.boundingBox.max.z - this.boundingBox.min.z);
  }

  getObject() {
    return this.sceneObject;
  }

  setScene(scene) {
    this.scene = scene;
  }

  getScene() {
    return this.scene;
  }

  getDistanceFrom(sceneObject) {
    // 3-dimensional pythagorean formula
    return Math.sqrt(
      Math.pow(this.position.x - sceneObject.position.x, 2) +
      Math.pow(this.position.y - sceneObject.position.y, 2) +
      Math.pow(this.position.z - sceneObject.position.z, 2)
    );
  }
}

class Ground extends SceneObject {
  constructor() {
    let geometry = new THREE.PlaneBufferGeometry(MAPWIDTH, MAPLENGTH, 1, 1);
    let material = new THREE.MeshPhongMaterial({
      emissive: 0xFFFFFF
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
    if(this.sceneObject !== null) {
      // check for wall collision
      if(this.sceneObject.position.x >= MAPWIDTH || this.sceneObject.position.x <= 0) {
        this.velocity.x = -this.velocity.x;
      }
      if (this.sceneObject.position.y >= MAPLENGTH || this.sceneObject.position.y <= 0) {
        this.velocity.y = -this.velocity.y;
      }
      if (this.sceneObject.position.z >= MAPHEIGHT || this.sceneObject.position.z <= 0) {
        this.velocity.z = -this.velocity.z;
      }

      const xTolerance = 1;
      const yTolerance = 1;
      const zTolerance = 1;

      // check for other cube collision
      for(let i = 0; i < this.scene.children.length; i++) {
        let obj = this.scene.children[i];

        if(obj != this.sceneObject && obj.type == "Cube") {
          if(Math.abs(obj.position.x - this.sceneObject.position.x) < xTolerance) {
            this.velocity.x = -this.velocity.x;
          }
          if(Math.abs(obj.position.y - this.sceneObject.position.y) < yTolerance) {
            this.velocity.y = -this.velocity.y;
          }
          if(Math.abs(obj.position.z - this.sceneObject.position.z) < zTolerance) {
            this.velocity.z = -this.velocity.z;
          }
        }
      }

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
      }
    }
    super.update();
  }
}

class ResourceNode extends SceneObject {
  constructor() {
    let size = 50;
    let widthSegments = 5;
    let heightSegments = 5;
    let geometry = new THREE.SphereGeometry(size, widthSegments, heightSegments);
    let material = new THREE.MeshLambertMaterial({
      color: 0xcc44ac
    });

    super(geometry, material);

    this.type = "resourceNode";
    this.resourceType = "metal";
  }
}

class Menu {
  constructor() {
    this.element = document.getElementById('menu');
  }
}
