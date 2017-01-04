/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');

class InterfaceObject extends THREE.Mesh {
  constructor(geometry, material) {
    super(geometry, material);
    this.size = new THREE.Vector3(0, 0, 0);
  }

  setName(name) {
    this.name = name;
  }

  getName() {
    return this.name;
  }

  setSceneObject(sceneObject) {
    this.boundingBox = new THREE.Box3().setFromObject(sceneObject);
    this.size.x = this.boundingBox.max.x - this.boundingBox.min.x;
    this.size.y = this.boundingBox.max.y - this.boundingBox.min.y;
    this.size.z = this.boundingBox.max.z - this.boundingBox.min.z;
  }

  getSize() {
    return new THREE.Vector3(this.size.x, this.size.y, this.size.z);
  }
}

module.exports = InterfaceObject;
