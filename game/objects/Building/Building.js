/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const SceneObject = require('../SceneObject.js');

class Building extends SceneObject {
  constructor(
    geometry = new THREE.BoxGeometry(100, 100, 100),
    material = new THREE.MeshLambertMaterial({
      color: 0x333333
    }),
    status = null
  ) {

    super(geometry, material);

    this.type = "building";
    this.buildingType = null;
    this.status = status;
    this.destination = null;
    this.buildSpeed = 1;
    this.buildQueue = 0;

    this.completeColor = 0x333333;
    this.incompleteColor = 0x999999;

    // set this.completion based on status
    switch(this.status) {
      case 'incomplete':
        this.completion = 0;
        break;
      case 'complete':
        this.completion = 100;
        break;
      default:
        this.completion = 100;
        break;
    }
  }

  update() {
    this.buildCheck();
    super.update();
  }

  updateColorByCompletion() {
    if(this.completion === 100) {
      this.material.color.setHex(this.completeColor);
    } else if (this.completion === 0) {
      this.material.color.setHex(this.incompleteColor);
    } else {
      let newColor = this.completeColor / this.completion;
      this.material.color.setHex(newColor);
    }
  }

  buildCheck() {
    if(this.completion >= 100) {
      // do nothing
      this.completion = 100;
      this.status = 'complete';
      this.updateColorByCompletion();
    } else {
      // build
      this.completion += this.buildQueue;
      this.buildQueue = 0;
      this.updateColorByCompletion();
    }
  }

  build(buildSpeed) {
    if(this.completion < 100) {
      this.buildQueue += this.buildSpeed * buildSpeed;
      return true;
    } else {
      return false;
    }
  }

  /*
    @objArray an array of current selectedObjects
    @coords the intersection of mouse raycast and this object
    This is called whenever a player right-clicks on this object while selectedObjects.length > 0
  */
  assign(objArray, coords) {
    for(let i in objArray) {
      // if incomplete, build me
      if(this.status === 'incomplete') {
        objArray[i].queueJob({
          job: 'build',
          building: this
        });
      } else if (this.status == 'complete') {
        // move towards me
        objArray[i].queueJob({
          job: 'move',
          coordinates: this.position
        });
      }
    }

    return true; // stop bubbling
  }
}

module.exports = Building;
