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

    this.destinationRange = new THREE.Vector3(25, 25, 25); // tolerance for how close an object must get before stopping
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

        // update ranges based on size
        this.destinationRange = new THREE.Vector3(
          this.size.x,
          this.size.y,
          this.size.z
        );

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

      let difX = destination.x - this.position.x;
      let difY = destination.y - this.position.y;
      let difZ = destination.z - this.position.z;

      // correct destination
      difX -= Math.sign(difX) * this.size.x/2;
      difY -= Math.sign(difY) * this.size.y/2;
      difZ -= Math.sign(difZ) * this.size.z/2;

      // only move if farther than this.destinationRange
      if(Math.abs(difX) > this.destinationRange.x || Math.abs(difY) > this.destinationRange.y || Math.abs(difZ) > this.destinationRange.z) {

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
