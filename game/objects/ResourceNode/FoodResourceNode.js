/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ResourceNode = require('./ResourceNode.js');

class FoodResourceNode extends ResourceNode {
  constructor() {
    let geometry = null;
    let material = new THREE.MeshLambertMaterial({
      color: 0xf4a742
    });
    super(geometry, material);
    this.resourceType = "food";
  }
}

module.exports = FoodResourceNode;
