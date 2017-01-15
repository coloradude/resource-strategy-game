/*
jshint
node: true,
esversion: 6,
browser: true,
-W041: false
*/

const THREE = require('three');
const Model = require('../Model.js');
const Cube = require('../Cube.js');
const GameSettings = require('../../GameSettings.js');

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

    this.unitSpawnLocation = this.position;
    this.newUnitJob = null;

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

      if(i == 0) {
        // reduce time left in queue for first object
        this.queuedUnits[i].timeLeft -= 1;
      }

      // do something while not done

      // end of loading action
      if(!this.queuedUnits[i].timeLeft) {
        switch(this.queuedUnits[i].unit) {
          case 'cube':
            let size = new THREE.Vector3(
              200,
              200,
              100
            );

            // put new object just southwest of building
            let coordinates = new THREE.Vector3(
              this.position.x - size.x,
              this.position.y - size.y,
              this.position.z
            );

            let newCube = this.game.addCube(
              coordinates,
              size,
              undefined // name
            );

            // remove this unit from queuedUnits
            this.queuedUnits.splice(i, 1);

            // assign unit to do this.newUnitJob
            if(this.newUnitJob !== null) {
              newCube.queueJob(this.newUnitJob);
            } else {
              // no assigned job, units will stack at spawn location
            }

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

  /*
    Called once (externally) when assigning new job
  */
  queueJob(job) {
    // process job addition
    switch(job.job) {
      case 'move':
        // sets unit spawn position
        this.newUnitJob = {
          job: 'move',
          coordinates: job.coordinates
        };
        break;
      case 'collectResource':
        // sets unit spawn position
        this.newUnitJob = {
          job: 'collectResource',
          resourceNode: job.resourceNode
        };
        break;
      default:
        console.error(`unrecognized job ${job.job}`);
        break;
    }
  }

  select(selected = true) {
    this.selected = selected;
  }

  getBuildTime(unit) {
    unit = unit.toLowerCase();
    let buildTime = GameSettings[this.buildingType].units[unit].buildTime;

    return buildTime;
  }

  queueUnit(unit) {
    let timeLeft = this.getBuildTime(unit);
    let buildCost = GameSettings[this.buildingType].units[unit].buildCost;

    let canAfford = true;

    if(this.completion < 100) {
      canAfford = false;
    }

    for(let i in buildCost) {
      if(this.game.player.resources[i] < buildCost[i]) {
        canAfford = false;
        break;
      }
    }

    // charge player unit creation fee
    if(canAfford) {
      for(let i in buildCost) {
        this.game.player.resources[i] -= buildCost[i];
      }

      this.queuedUnits.push({
        'unit': unit,
        'timeLeft': timeLeft
      });
    }
  }

  getInterfaceHtml() {
    let html = `
      <p>${this.name} : ${this.type}</p>
      <ul class="actions">
        <li><a href="#" onclick="window.game.removeBuilding('${this.name}');">Destroy</a></li>
      </ul>
      <ul class="queuedUnits">
      </ul>
    `;

    return html;
  }

  getQueueHTML() {
    let html = ``;

    for(let i in this.queuedUnits) {
      html += `
      <div class="queue">
        <span class="unitType">${this.queuedUnits[i].unit}</span>
        <span class="timeLeft">${this.queuedUnits[i].timeLeft}</span>
      </div>`;
    }

    return html;
  }

  getTimeLeftOfQueue(i) {
    if(this.queuedUnits[i]) {
      return this.queuedUnits[i].timeLeft;
    } else {
      return null;
    }
  }
}

module.exports = Building;
