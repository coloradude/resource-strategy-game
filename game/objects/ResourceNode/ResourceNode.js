/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Model = require('../Model.js');

/*
  Resource nodes give resources to miners/gatherers/etc.
  Most have a set resource limit (until which they expire).
  Generally, collection can only be done on player's claimed territory.
  As a general rule, resource collection speed should be faster from resource nodes than from production buildings.
*/

class ResourceNode extends Model {
  constructor(
    game,
    model,
    size,
    resourceRemaining
  ) {
    super(game, model, size);

    this.model = model;
    this.type = "resourceNode";
    this.resourceType = null;
    this.collectionSpeed = 1;
    this.resourceRemaining = 1;
    this.speed = 0;
  }

  onModelLoad() {
    this.topMesh = this.children[0].children[0].children[0].material.materials[0];
    this.baseMesh = this.children[0].children[0].children[0].material.materials[1];


    this.setBaseColor(this.baseColor);
    this.setTopColor(this.topColor);

    super.onModelLoad();
  }

  setBaseColor(color) {
    if(this.baseMesh.color !== color) {
      this.baseMesh.color = new THREE.Color(color);
    }
  }

  setTopColor(color) {
    if(this.topMesh.color !== color) {
      this.topMesh.color = new THREE.Color(color);
    }
  }

  assign(objArray, coords) {

    for(let i in objArray) {

      objArray[i].queueJob({
        job: 'collectResource',
        resourceNode: this
      });

    }
    return true; // stop bubbling
  }
}

module.exports = ResourceNode;
