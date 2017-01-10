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
    model,
    size,
    status
  ) {
    super(game, model, size);

    this.model = model;
    this.type = "building";
    this.buildingType = null;
    this.status = status;
    this.destination = null;
    this.buildSpeed = 1;
    this.buildQueue = 0;

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
        console.error(`unrecognized status when constucting building`);
        break;
    }

    this.speed = 0;
  }

  update() {
    if(this.isLoaded) {
      this.buildCheck();
    }
    super.update();
  }

  onModelLoad() {
    super.onModelLoad();
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
      this.status = 'incomplete';
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
          coordinates: this.getCollisionPointFrom(objArray[i])
        });
      }
    }

    return true; // stop bubbling
  }
}

module.exports = Building;
