/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const SceneObject = require('./SceneObject.js');

class Building extends SceneObject {
  constructor(size) {
    let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    let material = new THREE.MeshLambertMaterial({
      color: 0x333333
    });

    super(geometry, material);

    this.type = "building";
    this.buildingType = null;
  }

  assign(objectsArray, coords) {
    // make cubes idle
    for(let i in objectsArray) {
      objectsArray[i].removeJob({
        job: 'move'
      });
    }
    return true;
  }
}

module.exports = Building;
