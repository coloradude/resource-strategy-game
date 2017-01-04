/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ResourceNode = require('./ResourceNode.js');

class GoldResourceNode extends ResourceNode {
  constructor() {
    let geometry = null;
    let material = new THREE.MeshLambertMaterial({
      color: 0xFFFF00
    });
    super(geometry, material);
    this.resourceType = "gold";
  }
}

module.exports = GoldResourceNode;
