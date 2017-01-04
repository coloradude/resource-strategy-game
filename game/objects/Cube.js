/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const SceneObject = require('./SceneObject.js');

class Cube extends SceneObject {
  constructor(size) {
    let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    let material = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });

    super(geometry, material);
    this.type = "Cube";

    this.speed = 25;
    this.resourceCollectionRange = 100;
    this.resourceCollectionRate = 0.1;
  }

  update() {
    // find & process all resource nodes
    let sceneObject;
    let resourceNodes = window.game.resourceNodes.map((sceneObject) => {
      sceneObject.distance = this.getDistanceFrom(sceneObject);
      return sceneObject;
    });

    // move toward closest resource node
    if(resourceNodes.length > 0) {
      let minDistanceNode = resourceNodes[0];
      for(let i in resourceNodes) {
        if(resourceNodes[i].distance < minDistanceNode.distance) {
          minDistanceNode = resourceNodes[i];
        }
      }
      this.destination = minDistanceNode.position;

      // add resource points according to closest resource node
      if(this.getDistanceFrom(minDistanceNode) <= this.resourceCollectionRange) {
        // cancel destination (we're close enough)
        this.destination = null;

        // add resources
        window.game.player.resources[minDistanceNode.resourceType] += minDistanceNode.collectionSpeed * this.resourceCollectionRate;
      }
    }

    super.update();
  }
}

module.exports = Cube;
