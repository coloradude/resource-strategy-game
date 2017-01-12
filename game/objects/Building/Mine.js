/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Building = require('./Building.js');
const GameSettings = require('../../GameSettings.js');

class Mine extends Building {
  constructor(
    game,
    size = new THREE.Vector3(
      GameSettings.mine.defaultSize.x,
      GameSettings.mine.defaultSize.y,
      GameSettings.mine.defaultSize.z
    ),
    type = 'mine',
    status = 'incomplete'
  ) {
    let model = GameSettings.mine.model;
    super(game, model, size, status);

    this.buildingType = GameSettings.mine.type;

    this.buildingHasNotBegunTexture = GameSettings.mine.buildingHasNotBegunTexture;
    this.buildingInProgressTexture = GameSettings.mine.buildingInProgressTexture;
    this.buildingCompleteTexture = GameSettings.mine.buildingCompleteTexture;

    this.buildCost = GameSettings.mine.buildCost;

    this.completeColor = GameSettings.mine.completeColor;
    this.incompleteColor = GameSettings.mine.incompleteColor;
  }

  update() {
    super.update();
  }

  onModelLoad() {
    this.meshes = this.children[0].children[0].children;
    this.baseMesh = this.meshes[0];
    this.cubeMesh = this.meshes[1];
    super.onModelLoad();
  }

  updateAppearanceByCompletion() {
    if(!this.selected) {
      if(this.completion >= 100) {
        this.changeCubeColor(this.completeColor);
        this.changeBaseTexture(this.buildingCompleteTexture);
      } else if (this.completion === 0) {
        this.changeCubeColor(this.buildingNotStartedColor);
        this.changeBaseTexture(this.buildingHasNotBegunTexture);
      } else {
        this.changeBaseTexture(this.buildingInProgressTexture);
        this.changeCubeColor(this.incompleteColor);
      }
    } else {
      this.changeCubeColor(0xFFFFFF);
    }

    // raise cube according to completion
    this.setCubeHeight(2 * this.completion);
  }

  setCubeHeight(height) {
    let boundingBox = new THREE.Box3().setFromObject(this.cubeMesh);
    let myHeight = boundingBox.max.z - boundingBox.min.z;
    let myZScale = this.cubeMesh.scale.z;

    this.cubeMesh.scale.z = Math.max((myZScale * height)/myHeight, 0.1);
  }

  changeBaseTexture(texture) {
    if(this.baseTexture !== texture) {
      let tex = this.textureLoader.load(texture);

      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);

      this.meshes = this.children[0].children[0].children;
      this.meshes[0].material.map = tex;
      this.meshes[0].material.needsUpdate = true;
      this.baseTexture = texture;
    }
  }

  changeCubeColor(color) {
    if(this.cubeColor !== color) {
      this.cubeMesh.material = new THREE.MeshLambertMaterial({
        color: color
      });
      this.cubeMesh.material.needsUpdate = true;
      this.cubeColor = color;
    }
  }

  /*
    @objArray an array of current selectedUnits
    @coords the intersection of mouse raycast and this object
    This is called whenever a player right-clicks on this object while selectedObjects.length > 0
  */
  assign(objArray, coords) {

    for(let i in objArray) {
      // assign any new jobs to selectedUnits
    }

    super.assign(objArray, coords);

    return true;
  }
}

module.exports = Mine;
