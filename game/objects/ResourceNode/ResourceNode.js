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
    let size = 50;
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
}

module.exports = ResourceNode;
