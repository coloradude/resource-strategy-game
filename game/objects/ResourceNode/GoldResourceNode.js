/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ResourceNode = require('./ResourceNode.js');
const GameSettings = require('../../GameSettings.js');

class GoldResourceNode extends ResourceNode {
  constructor(
    game,
    size,
    resourceRemaining
  ) {
    let model = GameSettings.goldResourceNode.model;
    super(game, model, size, resourceRemaining);

    this.baseColor = GameSettings.goldResourceNode.baseColor;
    this.topColor = GameSettings.goldResourceNode.topColor;

    this.resourceType = "gold";
  }
}

module.exports = GoldResourceNode;
