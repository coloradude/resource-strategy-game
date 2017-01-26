/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Building = require('./Building.js');
const GameSettings = require('../../GameSettings.js');

class Base extends Building {
  constructor(game, size = new THREE.Vector3(
      GameSettings.base.defaultSize.x,
      GameSettings.base.defaultSize.y,
      GameSettings.base.defaultSize.z
    ),
    type = 'base',
    status = 'incomplete'
  ) {
    let model = GameSettings.base.model;
    super(game, model, size, status);

    this.buildingType = GameSettings.base.type;

    this.buildingHasNotBegunTexture = GameSettings.base.buildingHasNotBegunTexture;
    this.buildingInProgressTexture = GameSettings.base.buildingInProgressTexture;
    this.buildingCompleteTexture = GameSettings.base.buildingCompleteTexture;

    this.buildCost = GameSettings.base.buildCost;

    this.completeColor = GameSettings.base.completeColor;
    this.incompleteColor = GameSettings.base.incompleteColor;
  }

  update() {
    super.update();
  }

  onModelLoad() {
    super.onModelLoad();
  }

  updateAppearanceByCompletion() {

  }
}

module.exports = Base;
