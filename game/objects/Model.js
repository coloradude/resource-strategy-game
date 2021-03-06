/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ColladaLoader = require('./ColladaLoader.js');

class Model extends THREE.Object3D {
  constructor(game, model, size) {
    super();

    this.game = game;
    this.size = size;
    this.isModel = true;
    this.model = model;

    this.loader = this.game.loader;
    this.textureLoader = this.game.textureLoader;

    // load model asyncronously
    this.isLoaded = false;
    this.onModelLoadRun = false;
    this.load();

    this.raycaster = new THREE.Raycaster();

    // movement options
    this.speed = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.destination = null;
    this.momentum = new THREE.Vector3(0, 0, 0);

    // render options
    this.castShadow = true;
    this.receiveShadow = true;

    this.selectedColor = 0xFFFFFF;
    this.unselectedColor = 0xCC0000;

    this.jobPriorities = {
      'move': 8,
      'build': 6,
      'collectResource': 5,
      'goToClosestResourceNode': 2,
      'idle': 1
    };

    // priority queue of jobs
    this.queue = [{
      job: 'idle',
      priority: 1
    }];

    this.destinationTolerance = new THREE.Vector3(1, 1, 1); // tolerance for how close an object must get before stopping
  }

  load() {
    if(this.model !== null && this.model !== undefined) {

      // asyncronously load model
      this.loader.load(this.model, ((result) => {

        // attach loaded model as child of this
        this.add(result.scene);

        this.matrixWorldNeedsUpdate = true;

        let tempSize = this.getSize();

        // set initial scale
        this.scale.set(
          this.size.x / tempSize.x,
          this.size.y / tempSize.y,
          this.size.z / tempSize.z
        );

        // add this to game scene
        this.game.scene.add(this);

        // calculate size
        this.size = this.getSize();

        this.onModelLoad();
        this.isLoaded = true;

      }).bind(this));

    } else {
      console.error(`Model() tried loading a null or undefined model`);
    }
  }

  onModelLoad() {
    this.boundingBox = new THREE.Box3().setFromObject(this);
    this.onModelLoadRun = true;
  }

  update() {
    if(this.isLoaded && this.onModelLoadRun) {
      // main update loop
      this.moveTowardDestination(this.destination);
    } else {
      // loading model...
    }
  }

  /*
    Includes collision detection and automatic path correction
  */
  moveTowardDestination(destination) {

    if(destination !== null && destination !== undefined) {

      let dif = new THREE.Vector3(0, 0, 0),
          absDif = new THREE.Vector3(0, 0, 0);

      let centerPoint = new THREE.Vector3(
        this.position.x + this.size.x/2,
        this.position.y + this.size.y/2,
        this.position.z // we want the floor of the model to determine its position
      );

      let mapHeight = this.game.ground.getHeight(centerPoint.x, centerPoint.y);

      // calculate distance from center of floor of model to destination
      for(let i in {'x':null, 'y':null, 'z':null}) {
        dif[i] = destination[i] - centerPoint[i];
        absDif[i] = Math.abs(dif[i]);
      }

      // create collision detection bounding box for this
      this.boundingBox = new THREE.Box3().setFromObject(this);

      let isWithinDestinationTolerance = this.boundingBox.expandByVector(this.destinationTolerance).containsPoint(this.destination);

      // only move if not already there
      if(!isWithinDestinationTolerance) {

        // calculate euclidian speed (total 3d speed should be this.speed)
        let d = Math.sqrt(Math.pow(dif.x, 2) + Math.pow(dif.y, 2) + Math.pow(dif.z, 2));

        // determine 3d velocity
        for(let i in {'x':null, 'y':null, 'z':null}) {
          // move at constant speed no matter the direction
          this.velocity[i] = (this.speed * dif[i]) / d;

          // update position, but don't move more than the difference
          if(absDif[i] <= Math.abs(this.velocity[i])) {
            this.velocity[i] = dif[i];
          }
        }

        // track collision detections
        let col = new THREE.Vector3(0, 0, 0);

        // create list of collision-eligable units to check for
        let collisionChecklist = [].concat(
          this.game.buildings,
          this.game.resourceNodes
        );

        // check for potential collision, storing result in col
        for(let i in collisionChecklist) {
          let unit = collisionChecklist[i];

          if(unit != this) {
            if(
              (this.boundingBox.min.x + this.velocity.x <= unit.boundingBox.max.x && this.boundingBox.max.x >= unit.boundingBox.min.x) &&
              (this.boundingBox.min.y < unit.boundingBox.max.y && this.boundingBox.max.y > unit.boundingBox.min.y) &&
              this.velocity.x < 0
            ) {
              // moving -x collision
              col.x = -1;
            }

            if(
              (this.boundingBox.max.x + this.velocity.x >= unit.boundingBox.min.x && this.boundingBox.min.x + this.velocity.x <= unit.boundingBox.max.x) &&
              (this.boundingBox.min.y < unit.boundingBox.max.y && this.boundingBox.max.y > unit.boundingBox.min.y) &&
              this.velocity.x > 0
            ) {
              // moving +x collision
              col.x = 1;
            }

            if(
              (this.boundingBox.min.y + this.velocity.y <= unit.boundingBox.max.y && this.boundingBox.max.y + this.velocity.y >= unit.boundingBox.min.y) &&
              (this.boundingBox.min.x < unit.boundingBox.max.x && this.boundingBox.max.x > unit.boundingBox.min.x) &&
              this.velocity.y < 0
            ) {
              // moving -y collision
              col.y = -1;
            }

            if(
              (this.boundingBox.max.y + this.velocity.y >= unit.boundingBox.min.y && this.boundingBox.min.y + this.velocity.y <= unit.boundingBox.max.y) &&
              (this.boundingBox.min.x < unit.boundingBox.max.x && this.boundingBox.max.x > unit.boundingBox.min.x) &&
              this.velocity.y > 0
            ) {
              // moving +y collision
              col.y = 1;
            }
          }
        }

        // horizontal collision
        if(col.x) {

          this.velocity.x = 0;

          if(!this.momentum.y) {
            if(this.velocity.y < 0) {
              this.momentum.y = -1;
            } else {
              this.momentum.y = 1;
            }
          }

          this.momentum.x = 0;

          this.velocity.y = this.momentum.y * this.speed;

        }

        // vertical collision
        if(col.y) {

          this.velocity.y = 0;

          if(!this.momentum.x) {
            if(this.velocity.x < 0) {
              this.momentum.x = -1;
            } else {
              this.momentum.x = 1;
            }
          }

          this.momentum.y = 0;

          this.velocity.x = this.momentum.x * this.speed;

        }

        // if freely moving, reset momentum
        if(!col.y && !col.x) {
          this.momentum.x = 0;
          this.momentum.y = 0;
        }

        // do the movement
        for(let i in {'x':null, 'y':null}) {
          this.position[i] += this.velocity[i];
        }

        // snap to ground
        this.position.z = mapHeight;

      } else {
        // already within destinationTolerance, don't move
        this.momentum.x = 0;
        this.momentum.y = 0;
      }
    } else {
      // destination is null, don't move
    }
  }

  /*
    Collision detection within @radius over @intersectObjects

    @radius: radius to check for colliosion from center of this
    @intersectObjects: array of objects to check for collision
    @near: min distance collions can occur
    @far: max distance collisions can occur
  */
  getClosebyUnits(intersectObjects, near, far, numRays) {

    if(intersectObjects === undefined) {
      intersectObjects = [].concat(
        this.game.cubes,
        this.game.resourceNodes,
        this.game.buildings
      );
    }

    if(near === undefined) {
      near = 0;
    }

    if(far === undefined) {
      far = 1000;
    }

    if(numRays === undefined) {
      numRays = 100;
    }

    let centerPoint = new THREE.Vector3(
      this.position.x + this.size.x/2,
      this.position.y + this.size.y/2,
      this.position.z + this.size.z/2
    );

    let raycaster = new THREE.Raycaster(centerPoint, new THREE.Vector3(0, 0, 0), near, far);

    let units = [];

    let pi = 3.14;

    let theta, x, y, collisions;

    // cast rays in circle, starting in center of this
    for( let i = 0; i < numRays; i++ ) {

      theta = (i / numRays) * (pi * 2);
      x = Math.cos(theta);
      y = Math.sin(theta);

      // create normalized direction vector
      let direction = new THREE.Vector3(x, y, 0);

      raycaster.set(centerPoint, direction);

      collisions = raycaster.intersectObjects(intersectObjects, true);

      if(collisions.length > 0) {

          for(let i in collisions) {
            let obj = collisions[i].object;
            while(obj.parent !== this.game.scene) {
              obj = obj.parent;
            }

            if(obj !== this && units.indexOf(obj) < 0) {
              units.push(obj);
            }
          }
      }
    }

    return units;
  }

  getSize() {
    let boundingBox = new THREE.Box3().setFromObject(this);

    return new THREE.Vector3(
      boundingBox.max.x - boundingBox.min.x,
      boundingBox.max.y - boundingBox.min.y,
      boundingBox.max.z - boundingBox.min.z
    );
  }

  getCollisionPointFrom(obj) {

    let destination = new THREE.Vector3(0, 0, 0);

    for(let i in {'x': null, 'y':null, 'z':null}) {

      if( this.position[i] > obj.position[i] + obj.size[i] ) { // obj to left of this
        destination[i] = this.position[i] - obj.size[i];
      } else if( this.position[i] + this.size[i] > obj.position[i] + obj.size[i] ) { // obj above/below this
        destination[i] = obj.position[i];
      } else { // obj to right of this
        destination[i] = this.position[i] + this.size[i];
      }
    }

    return destination;
  }

  /*
    @distances: a Vector3 obj describing the bounds to check within
    @obj: a scene object or Vector3 coordinate object to check how far we are
  */
  isWithinFrom(distances, obj) {

    if(obj.position === undefined) {
      obj.position = obj;
      obj.size = new THREE.Vector3(0, 0, 0);
    }

    for(let i in {'x': null, 'y':null, 'z':null}) {

      if(
        this.position[i] - distances[i] <= obj.position[i] + obj.size[i] &&
        this.position[i] + this.size[i] + distances[i] >= obj.position[i]
      ) {
        continue;
      } else {
        return false;
      }

    }

    return true;
  }

  getDistanceFrom(obj) {
    let point = new THREE.Vector3();

    if(
      obj.x !== undefined &&
      obj.y !== undefined &&
      obj.z !== undefined
    ) {
      // obj is Vector3
      point = obj;
    } else {
      // assume its a gameobj
      point = obj.position;
    }

    // 3-dimensional pythagorean formula
    return Math.sqrt(
      Math.pow(this.position.x - point.x, 2) +
      Math.pow(this.position.y - point.y, 2) +
      Math.pow(this.position.z - point.z, 2)
    );
  }

  select(selected = true) {
    if(selected) {
      // need to figure out a universal 'selection' effect and put it here
      // maybe something like a ring around them? or flag above them?
      console.log(`Model(): selected ${this.mine}, but haven't implemented appearance change yet. Try overriding?`);
    } else {
      console.log(`Model(): deselected ${this.mine}, but haven't implemented appearance change yet. Try overriding?`);
    }
  }

  /*
    @objArray an array of current selectedObjects
    @coords the intersection of mouse raycast and this object
    This is called whenever a player right-clicks on this object while selectedObjects.length > 0
  */
  assign(objectsArray, coords) {
    // if bubbling should continue, return falsey
    // otherwise, the click stops bubbling down
    return null;
  }

  /*
    HTML to display inside the selectedUnitsInterface div
    Intended to be ovverridden with "menu actions" for units/buildings/etc
  */
  getInterfaceHtml() {
    return `
    <p>${this.name} : ${this.type}</p>
    <ul class="actions">
      <li><span>No actions available.</span></li>
    </ul>
    `;
  }

  getQueueHTML() {
    return ``;
  }
}

module.exports = Model;
