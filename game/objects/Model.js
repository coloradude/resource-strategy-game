/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ColladaLoader = require('./ColladaLoader.js');

class Model extends THREE.Object3D {
  constructor(
    game,
    model,
    size = new THREE.Vector3(100, 100, 100)
  ) {
    super();

    this.game = game;
    this.size = size;
    this.canAssign = true;

    this.model = model;

    this.loader = new THREE.ColladaLoader();
    this.textureLoader = new THREE.TextureLoader();

    // load model asyncronously
    this.isLoaded = false;
    this.onModelLoadRun = false;
    this.load();

    // movement options
    this.speed = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.destination = null;

    // render options
    this.castShadow = true;
    this.receiveShadow = true;

    this.selectedColor = 0xFFFFFF;
    this.unselectedColor = 0xCC0000;

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

  moveTowardDestination(destination = null) {

    if(destination !== null) {

      let dif = new THREE.Vector3(0, 0, 0);

      // define true dif distance (incoorperating size)
      for(let i in {'x':null, 'y':null, 'z':null}) {
        if(this.position[i] > destination[i]) {
          dif[i] = destination[i] - this.position[i];
        } else if (
          this.position[i] <= destination[i] &&
          this.position[i] + this.size[i] >= destination[i]
        ) {
          if(i == 'z') {
            dif[i] = 0;
          } else {
            dif[i] = destination[i] - (this.position[i] + this.size[i]/2);
          }
        } else {
          dif[i] = destination[i] - this.position[i] + this.size[i];
        }
      }

      /*
        dif is now the distance from the outer edge of model to destination point (3 dimensions)
      */

      let absDif = new THREE.Vector3(
        Math.abs(dif.x),
        Math.abs(dif.y),
        Math.abs(dif.z)
      );

      // only move if farther than this.destinationTolerance
      if(
        absDif.x > this.destinationTolerance.x ||
        absDif.y > this.destinationTolerance.y ||
        absDif.z > this.destinationTolerance.z
      ) {

        let d = Math.sqrt(Math.pow(dif.x, 2) + Math.pow(dif.y, 2) + Math.pow(dif.z, 2));

        // move at constant speed no matter the direction
        this.velocity.x = (this.speed * dif.x) / d;
        this.velocity.y = (this.speed * dif.y) / d;
        this.velocity.z = (this.speed * dif.z) / d;

        // update position
        if(absDif.x > Math.abs(this.velocity.x)) {
          this.position.x += this.velocity.x;
        } else {
          this.position.x += dif.x;
        }

        if(absDif.y > Math.abs(this.velocity.y)) {
          this.position.y += this.velocity.y;
        } else {
          this.position.y += dif.y;
        }

        if(absDif.z > Math.abs(this.velocity.z)) {
          this.position.z += this.velocity.z;
        } else {
          this.position.z += dif.z;
        }
      } else {
        // close enough, don't moving
      }
    } else {
      // destination is null, don't move
    }
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

    let destination = new THREE.Vector3();

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
}

module.exports = Model;
