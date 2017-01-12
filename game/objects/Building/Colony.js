/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Building = require('./Building.js');
const GameSettings = require('../../GameSettings.js');

class Colony extends Building {
  constructor(
    game,
    size = new THREE.Vector3(
      GameSettings.colony.defaultSize.x,
      GameSettings.colony.defaultSize.y,
      GameSettings.colony.defaultSize.z
    ),
    type = 'colony',
    status = 'incomplete'
  ) {
    let model = GameSettings.colony.model;
    super(game, model, size, status);

    this.buildingType = GameSettings.colony.type;

    this.buildCost = GameSettings.colony.buildCost;

    this.completeColor = GameSettings.colony.completeColor;
    this.incompleteColor = GameSettings.colony.incompleteColor;
    this.buildingHasNotBegunTexture = GameSettings.colony.buildingHasNotBegunTexture;
    this.buildingInProgressTexture = GameSettings.colony.buildingInProgressTexture;
    this.buildingCompleteTexture = GameSettings.colony.buildingCompleteTexture;
    this.cubesColor = GameSettings.colony.cubesColor;
    this.floorTexture = GameSettings.colony.floorTexture;

    this.wallHeightProportion = 0.4;
  }

  update() {
    super.update();
  }

  onModelLoad() {
    this.meshes = this.children[0].children;

    this.floor = this.meshes[0];
    this.walls = this.meshes[1];
    this.ceilingOfEntrance = this.meshes[2];
    this.wallFloor = this.meshes[3];
    this.towerWall0 = this.meshes[4];
    this.towerWall1 = this.meshes[5];
    // unknown [6]
    this.centerTowerWall = this.meshes[7];
    this.centerTowerCeiling = this.meshes[8];
    this.towerWall3 = this.meshes[9];
    this.centerTowerCube = this.meshes[10];
    this.towerCube1 = this.meshes[11];
    this.towerCube2 = this.meshes[12];
    this.towerCubeCeiling = this.meshes[13];
    this.towerWall2 = this.meshes[14];
    this.towerCube3 = this.meshes[15];
    this.tower3Ceiling = this.meshes[16];
    // unknown [17]
    this.towerCube0 = this.meshes[18];

    this.setWallTexture(this.buildingHasNotBegunTexture);
    this.setCubesColor(this.incompleteColor);
    this.setFloorTexture(this.floorTexture);

    super.onModelLoad();
  }

  updateAppearanceByCompletion() {
    if(!this.selected) {
      if(this.completion >= 100) {
        this.setCenterCubeColor(this.completeColor);
        this.setCubesColor(this.completeColor);
        this.setWallTexture(this.buildingCompleteTexture);
      } else if (this.completion === 0) {
        this.setCenterCubeColor(this.buildingNotStartedColor);
        this.setCubesColor(this.buildingNotStartedColor);
      } else {
        this.setCenterCubeColor(this.incompleteColor);
        this.setWallTexture(this.buildingInProgressTexture);
        this.setCubesColor(this.incompleteColor);
      }
    } else {
      this.setCenterCubeColor(0xFFFFFF);
      this.setCubesColor(0xFFFFFF);
    }

    // raise cube according to completion
    this.setWallHeight(this.completion * this.wallHeightProportion);
  }

  setWallHeight(height) {
    let boundingBox = new THREE.Box3().setFromObject(this.walls);
    let myHeight = boundingBox.max.z - boundingBox.min.z;
    let myZScale = this.walls.scale.z;

    this.walls.scale.z = Math.max((myZScale * height)/myHeight, 0.001);
  }

  setCenterCubeColor(color) {
    if(this.centerCubeColor !== color) {

      color = new THREE.Color(color);

      this.centerTowerCube.children[0].material = new THREE.MeshLambertMaterial({
        color: color
      });
      this.centerTowerCube.children[0].material.needsUpdate = true;
      this.centerCubeColor = color;
    }
  }

  setCubesColor(color) {
    color = new THREE.Color(color);

    let material = new THREE.MeshLambertMaterial({
      color: color
    });

    this.towerCube0.children[0].material = material;
    this.towerCube1.children[0].material = material;
    this.towerCube2.children[0].material = material;
    this.towerCube3.children[0].material = material;
  }

  setWallTexture(texture) {
    if(this.wallTexture !== texture) {
      let tex = this.textureLoader.load(texture);

      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);

      let material = new THREE.MeshLambertMaterial({
        map: tex
      });

      this.walls.children[0].material = material;
      this.wallFloor.children[0].material = material;
      this.wallTexture = texture;
    }
  }

  setFloorTexture(texture) {
    if(this.floorTexture !== texture) {
      let tex = this.textureLoader.load(texture);

      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);

      let material = new THREE.MeshLambertMaterial({
        map: tex
      });

      this.meshes[6].children[0].material = material;
      this.meshes[17].children[0].material = material;
      this.floorTexture = texture;
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

  getInterfaceHtml() {
    let html = `
      <p>${this.name} : ${this.type}</p>
      <ul class="actions">
        <li><a href="#" onclick="window.game.removeBuilding('${this.name}');">Destroy</a></li>
        <li><a href="#" onclick="window.game.queueUnit('cube', '${this.name}')">Queue Unit: Cube</a></li>
      </ul>
      <ul class="queuedUnits">
      </ul>
    `;

    return html;
  }
}

module.exports = Colony;
