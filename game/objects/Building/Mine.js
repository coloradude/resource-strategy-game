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
    size = new THREE.Vector3(250, 250, 100),
    type = 'mine',
    status = 'complete'
  ) {
    let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);

    super(geometry, undefined, status);

    this.type = 'building';
    this.buildingType = 'mine';

    this.completeColor = 0xCCCC00;
    this.incompleteColor = 0x555500;
  }

  update() {
    super.update();
  }

  /*
    @objArray an array of current selectedObjects
    @coords the intersection of mouse raycast and this object
    This is called whenever a player right-clicks on this object while selectedObjects.length > 0
  */
  assign(objArray, coords) {

    for(let i in objArray) {
      // grow by 1000
      let growAmt = 1000;
      objArray[i].queueJob({
        job: 'grow',
        size: new THREE.Vector3(growAmt, growAmt, growAmt)
      });
    }

    super.assign(objArray, coords);

    return true; // stop bubbling
  }
}

module.exports = Mine;
