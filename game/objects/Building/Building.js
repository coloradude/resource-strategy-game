/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Model = require('../Model.js');

class Building extends Model {
  constructor(
    game,
    model = './build/output/assets/models/red-mine.dae',
    size = new THREE.Vector3(500, 500, 250),
    status = null
  ) {
    super(game, model, size);

    this.model = model;
    this.type = "building";
    this.buildingType = null;
    this.status = status;
    this.destination = null;
    this.buildSpeed = 1;
    this.buildQueue = 0;

    // total cost of building construction
    this.buildCost = [
      {
        type: 'metal',
        amt: 0
      }, {
        type: 'gold',
        amt: 0
      }, {
        type: 'food',
        amt: 0
      }
    ];

    this.completeColor = 0x333333;
    this.incompleteColor = 0x999999;

    // set this.completion based on status
    switch(this.status) {
      case 'incomplete':
        this.completion = 0;
        break;
      case 'complete':
        this.completion = 100;
        break;
      default:
        this.completion = 100;
        break;
    }
  }

  update() {
    this.buildCheck();
    super.update();
  }

  updateAppearanceByCompletion() {
    if(this.completion === 100) {
      // this.material.color.setHex(this.completeColor);
      // console.log(`mine complete`);
    } else if (this.completion === 0) {
      // this.material.color.setHex(this.incompleteColor);
    } else {
      // let newColor = this.completeColor / this.completion;
      // this.material.color.setHex(newColor);
      console.log(`mine incomplete, completion = ${this.completion}`);
    }
  }

  buildCheck() {
    if(this.completion >= 100) {
      // do nothing
      this.completion = 100;
      this.status = 'complete';
      this.updateAppearanceByCompletion();
    } else {
      // build
      this.completion += this.buildQueue;
      this.buildQueue = 0;
      this.updateAppearanceByCompletion();
    }
  }

  /*
    returns current completion
  */
  build(buildAmt) {
    if(this.completion < 100) {
      this.buildQueue += this.buildSpeed * buildAmt;
      return this.completion;
    } else {
      return 100;
    }
  }

  /*
    @objArray an array of current selectedObjects
    @coords the intersection of mouse raycast and this object
    This is called whenever a player right-clicks on this object while selectedObjects.length > 0
  */
  assign(objArray, coords) {
    for(let i in objArray) {
      // if incomplete, build me
      if(this.status === 'incomplete') {
        objArray[i].queueJob({
          job: 'build',
          building: this
        });
      } else if (this.status == 'complete') {
        // move towards me
        objArray[i].queueJob({
          job: 'move',
          coordinates: this.position
        });
      }
    }

    return true; // stop bubbling
  }
}

module.exports = Building;
