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
    })
  ) {

    super(geometry, material);

    this.type = "building";
    this.buildingType = null;
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
