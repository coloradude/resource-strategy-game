/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Model = require('../Model.js');
const Cube = require('../Cube.js');

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
    this.buildingNotStartedColor = 0x666666;
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

    this.queuedUnits = [];

    this.speed = 0;
  }

  update() {
    if(this.isLoaded) {
      this.buildCheck();

      this.processQueuedUnits();
    }
    super.update();
  }

  onModelLoad() {
    super.onModelLoad();
  }

  processQueuedUnits() {
    for(let i in this.queuedUnits) {
      console.log(this.queuedUnits[i]);
      this.queuedUnits[i].timeLeft -= 1;
      if(!this.queuedUnits[i].timeLeft) {
        switch(this.queuedUnits[i].unit) {
          case 'Cube':
            let size = new THREE.Vector3(
              200,
              200,
              100
            );

            let coordinates = new THREE.Vector3(
              this.position.x - size.x,
              this.position.y - size.y,
              this.position.z
            );

            this.game.addCube(
              coordinates,
              size,
              undefined // name
            );

            // remove this unit
            this.queuedUnits.splice(i, 1);

            break;
          default:
            console.error(`processQueuedUnits(): unknown unit type ${this.queuedUnits[i].unit}`);
        }
      }
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
          coordinates: new THREE.Vector3(
            this.position.x + this.size.x/2,
            this.position.y + this.size.y/2,
            this.position.z + this.size.z/2
          )
        });
      }
    }

    return true; // stop bubbling
  }

  select(selected = true) {
    this.selected = selected;
  }

  queueUnit(unit) {
    switch(unit) {
      case 'Cube':
        break;
      default:
        console.error(`queueUnit(): unknown unit type`);
        break;
    }
    this.queuedUnits.push({
      'unit': unit,
      'timeLeft': 100
    });
  }

  getInterfaceHtml() {
    let html = `
      <p>${this.name} : ${this.type}</p>
      <ul>
        <li><a href="#" onclick="window.game.removeBuilding('${this.name}');">Destroy</a></li>
      </ul>
    `;

    return html;
  }
}

module.exports = Building;
