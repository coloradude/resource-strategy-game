'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/*
jshint
node: true,
esversion: 6,
browser: true,
-W041: false
*/

var THREE = require('three');
var Model = require('../Model.js');
var Cube = require('../Cube.js');
var GameSettings = require('../../GameSettings.js');

var Building = function (_Model) {
  _inherits(Building, _Model);

  function Building(game, model, size, status) {
    _classCallCheck(this, Building);

    var _this = _possibleConstructorReturn(this, (Building.__proto__ || Object.getPrototypeOf(Building)).call(this, game, model, size));

    _this.model = model;
    _this.type = "building";
    _this.buildingType = null;
    _this.status = status;
    _this.destination = null;
    _this.buildSpeed = 1;
    _this.buildQueue = 0;
    _this.buildingNotStartedColor = 0x666666;
    _this.completeColor = 0x333333;
    _this.incompleteColor = 0x999999;
    _this.matrixAutoUpdate = false;

    // set this.completion based on status
    switch (_this.status) {
      case 'incomplete':
        _this.completion = 0;
        break;
      case 'complete':
        _this.completion = 100;
        break;
      default:
        console.error('unrecognized status when constucting building');
        break;
    }

    _this.queuedUnits = [];

    _this.unitSpawnLocation = _this.position;
    _this.newUnitJob = null;

    _this.speed = 0;
    return _this;
  }

  _createClass(Building, [{
    key: 'update',
    value: function update() {
      if (this.isLoaded) {
        this.buildCheck();

        this.processQueuedUnits();
      }
      _get(Building.prototype.__proto__ || Object.getPrototypeOf(Building.prototype), 'update', this).call(this);
    }
  }, {
    key: 'onModelLoad',
    value: function onModelLoad() {
      this.updateMatrix();
      _get(Building.prototype.__proto__ || Object.getPrototypeOf(Building.prototype), 'onModelLoad', this).call(this);
    }
  }, {
    key: 'processQueuedUnits',
    value: function processQueuedUnits() {
      for (var i in this.queuedUnits) {

        if (i == 0) {
          // reduce time left in queue for first object
          this.queuedUnits[i].timeLeft -= 1;
        }

        // do something while not done

        // end of loading action
        if (!this.queuedUnits[i].timeLeft) {
          switch (this.queuedUnits[i].unit) {
            case 'cube':
              var size = new THREE.Vector3(200, 200, 100);

              // put new object just southwest of building
              var coordinates = new THREE.Vector3(this.position.x - size.x, this.position.y - size.y, this.position.z);

              var newCube = this.game.addCube(coordinates, size, undefined // name
              );

              // remove this unit from queuedUnits
              this.queuedUnits.splice(i, 1);

              // assign unit to do this.newUnitJob
              if (this.newUnitJob !== null) {
                newCube.queueJob(this.newUnitJob);
              } else {
                // no assigned job, units will stack at spawn location
              }

              break;
            default:
              console.error('processQueuedUnits(): unknown unit type ' + this.queuedUnits[i].unit);
          }
        }
      }
    }
  }, {
    key: 'buildCheck',
    value: function buildCheck() {
      if (this.completion >= 100) {
        // do nothing
        this.completion = 100;
        this.status = 'complete';
        this.updateAppearanceByCompletion();
        this.updateMatrix();
      } else {
        // build
        this.completion += this.buildQueue;
        this.buildQueue = 0;
        this.status = 'incomplete';
        this.updateAppearanceByCompletion();
        this.updateMatrix();
      }
    }

    /*
      returns current completion
    */

  }, {
    key: 'build',
    value: function build(buildAmt) {
      if (this.completion < 100) {
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

  }, {
    key: 'assign',
    value: function assign(objArray, coords) {

      for (var i in objArray) {
        // if incomplete, build me
        if (this.status === 'incomplete') {
          objArray[i].queueJob({
            job: 'build',
            building: this
          });
        } else if (this.status == 'complete') {
          // move towards me
          objArray[i].queueJob({
            job: 'move',
            coordinates: new THREE.Vector3(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.position.z + this.size.z / 2)
          });
        }
      }

      return true; // stop bubbling
    }

    /*
      Called once (externally) when assigning new job
    */

  }, {
    key: 'queueJob',
    value: function queueJob(job) {
      // process job addition
      switch (job.job) {
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
          console.error('unrecognized job ' + job.job);
          break;
      }
    }
  }, {
    key: 'select',
    value: function select() {
      var selected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.selected = selected;
    }
  }, {
    key: 'getBuildTime',
    value: function getBuildTime(unit) {
      unit = unit.toLowerCase();
      var buildTime = GameSettings[this.buildingType].units[unit].buildTime;

      return buildTime;
    }
  }, {
    key: 'queueUnit',
    value: function queueUnit(unit) {
      var timeLeft = this.getBuildTime(unit);
      var buildCost = GameSettings[this.buildingType].units[unit].buildCost;

      var canAfford = true;

      if (this.completion < 100) {
        canAfford = false;
      }

      for (var i in buildCost) {
        if (this.game.player.resources[i] < buildCost[i]) {
          canAfford = false;
          break;
        }
      }

      // charge player unit creation fee
      if (canAfford) {
        for (var _i in buildCost) {
          this.game.player.resources[_i] -= buildCost[_i];
        }

        this.queuedUnits.push({
          'unit': unit,
          'timeLeft': timeLeft
        });
      }
    }
  }, {
    key: 'getInterfaceHtml',
    value: function getInterfaceHtml() {
      var html = '\n      <p>' + this.name + ' : ' + this.type + '</p>\n      <ul class="actions">\n        <p>Actions</p>\n        <li><a href="#" onclick="window.game.removeBuilding(\'' + this.name + '\');">Destroy</a></li>\n      </ul>\n      <ul class="queuedUnits">\n      </ul>\n    ';

      return html;
    }
  }, {
    key: 'getQueueHTML',
    value: function getQueueHTML() {
      var html = '';

      for (var i in this.queuedUnits) {
        html += '\n      <div class="queue">\n        <span class="unitType">' + this.queuedUnits[i].unit + '</span>\n        <span class="timeLeft">' + this.queuedUnits[i].timeLeft + '</span>\n      </div>';
      }

      return html;
    }
  }, {
    key: 'getTimeLeftOfQueue',
    value: function getTimeLeftOfQueue(i) {
      if (this.queuedUnits[i]) {
        return this.queuedUnits[i].timeLeft;
      } else {
        return null;
      }
    }
  }]);

  return Building;
}(Model);

module.exports = Building;
//# sourceMappingURL=Building.js.map