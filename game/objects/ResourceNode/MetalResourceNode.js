/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ResourceNode = require('./ResourceNode.js');
const GameSettings = require('../../GameSettings.js');

class MetalResourceNode extends ResourceNode {
  constructor(
    game,
    size,
    resourceRemaining
  ) {
    let model = GameSettings.metalResourceNode.model;
    super(game, model, size, resourceRemaining);

    this.baseColor = GameSettings.metalResourceNode.baseColor;
    this.topColor = GameSettings.metalResourceNode.topColor;

    this.resourceType = "metal";
  }
}

module.exports = MetalResourceNode;
