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

    this.type = 'building';
    this.buildingType = 'mine';
    this.game = game;

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
    // console.log(this.scale);
    super.update();
  }

  /*
    @objArray an array of current selectedUnits
    @coords the intersection of mouse raycast and this object
    This is called whenever a player right-clicks on this object while selectedObjects.length > 0
  */
  assign(objArray, coords) {

    console.log(`mine assign() called`);

    for(let i in objArray) {
      // assign any new jobs to selectedUnits
    }

    return super.assign(objArray, coords);
  }
}

module.exports = Mine;
