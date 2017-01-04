/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const SceneObject = require('../SceneObject.js');

class ResourceNode extends SceneObject {
  constructor(geometry, material) {
    let size = 100;
    let widthSegments = 5;
    let heightSegments = 5;

    geometry = geometry || new THREE.SphereGeometry(size, widthSegments, heightSegments);
    material = material || new THREE.MeshLambertMaterial({
      color: 0xcc44ac
    });

    super(geometry, material);

    this.type = "resourceNode";
    this.resourceType = null;
    this.collectionSpeed = 1;
  }

  assign(objArray, coords) {

    for(let i in objArray) {

      // move towards me
      objArray[i].queueJob({
        job: 'move',
        coordinates: this.position
      });

      // shrink by 1000
      let shrinkAmt = 1000;
      objArray[i].queueJob({
        job: 'shrink',
        size: new THREE.Vector3(shrinkAmt, shrinkAmt, shrinkAmt)
      });
    }
    return true; // stop bubbling
  }
}

module.exports = ResourceNode;
