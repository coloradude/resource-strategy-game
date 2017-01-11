/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const ResourceNode = require('./ResourceNode.js');
const GameSettings = require('../../GameSettings.js');

class FoodResourceNode extends ResourceNode {
  constructor(
    game,
    size,
    resourceRemaining
  ) {
    let model = GameSettings.foodResourceNode.model;
    super(game, model, size, resourceRemaining);

    this.baseColor = GameSettings.foodResourceNode.baseColor;
    this.topColor = GameSettings.foodResourceNode.topColor;

    this.resourceType = "food";
  }
}

module.exports = FoodResourceNode;
