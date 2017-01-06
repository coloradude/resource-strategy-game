/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Building = require('./Building.js');

class Mine extends Building {
  constructor(
    game,
    size = new THREE.Vector3(1000, 1000, 100),
    type = 'mine',
    status = 'incomplete'
  ) {
    let model = './build/output/assets/models/orange-mine.dae';
    super(game, model, size, status);

    this.buildingType = 'mine';
    this.game = game;

    this.buildingHasNotBegunTexture = './build/output/assets/textures/Granite_Dark_Gray.jpg';
    this.buildingInProgressTexture = './build/output/assets/textures/Stone_Marble.jpg';
    this.buildingCompleteTexture = './build/output/assets/textures/Granite_Dark_Gray.jpg';

    // total cost of building construction
    this.buildCost = [
      {
        type: 'metal',
        amt: 1000
      }, {
        type: 'gold',
        amt: 200
      }, {
        type: 'food',
        amt: 0
      }
    ];

    this.completeColor = 0xCCCC00;
    this.incompleteColor = 0x555500;

    this.speed = 0;
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

    if(this.completion >= 100) {
      this.changeBaseTexture(this.buildingCompleteTexture);
    } else if (this.completion === 0) {
      this.changeBaseTexture(this.buildingHasNotBegunTexture);
    } else {
      this.changeBaseTexture(this.buildingInProgressTexture);
      let color = 0xFFFFFF * (this.completion/100);
      this.changeCubeColor(color);

      // raise cube according to completion
      this.changeCubeHeight(this.completion * 2);
    }
  }

  changeCubeHeight(height) {
    let boundingBox = new THREE.Box3().setFromObject(this.cubeMesh);

    let myHeight = boundingBox.max.z - boundingBox.min.z;

    this.cubeMesh.scale.z += (height - myHeight)/myHeight;
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

    return super.assign(objArray, coords);
  }
}

module.exports = Mine;
