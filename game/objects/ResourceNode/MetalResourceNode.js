/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ResourceNode = require('./ResourceNode.js');

class MetalResourceNode extends ResourceNode {
  constructor() {
    let geometry = null;
    let material = new THREE.MeshLambertMaterial({
      color: 0x333333
    });
    super(geometry, material);
    this.resourceType = "metal";
  }
}

module.exports = MetalResourceNode;
