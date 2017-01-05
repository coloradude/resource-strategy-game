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
    this.build();
    super.update();
  }

  updateColorByCompletion() {
    if(this.completion === 100) {
      this.material.color.setHex(this.completeColor);
    } else {
      this.material.color.setHex(this.incompleteColor);
    }
  }

  build() {
    switch(true) {
      case this.completion == 100:
        // do nothing
        this.status = 'complete';
        this.updateColorByCompletion();
        return;
      case this.completion < 100:
        this.completion += this.buildSpeed;
        this.updateColorByCompletion();
        break;
      default:
        console.error(`unrecognized this.completion`);
        break;
    }
  }

  /*
    @objArray an array of current selectedObjects
    @coords the intersection of mouse raycast and this object
    This is called whenever a player right-clicks on this object while selectedObjects.length > 0
  */
  assign(objArray, coords) {

    for(let i in objArray) {
      // move towards me
      objArray[i].queueJob({
        job: 'move',
        coordinates: this.position
      });
    }

    return true; // stop bubbling
  }
}

module.exports = Building;
