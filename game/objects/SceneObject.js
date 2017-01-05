/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');

class SceneObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);

    // movement options
    this.speed = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);

    this.castShadow = true;
    this.receiveShadow = true;

    this.boundingBox = null;
    this.destination = null;

    this.selectedColor = 0xFFFFFF;
    this.unselectedColor = 0xCC0000;

    this.destinationRange = new THREE.Vector3(25, 25, 25); // tolerance for how close an object must get before stopping
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
    this.boundingBox = new THREE.Box3().setFromObject(this.sceneObject);
    return new THREE.Vector3(
      this.boundingBox.max.x - this.boundingBox.min.x,
      this.boundingBox.max.y - this.boundingBox.min.y,
      this.boundingBox.max.z - this.boundingBox.min.z
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

  select(selected) {
    if(selected) {
      this.material.color.setHex(this.selectedColor);
    } else {
      this.material.color.setHex(this.unselectedColor);
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

module.exports = SceneObject;
