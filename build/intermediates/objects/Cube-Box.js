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
browser: true
*/

var THREE = require('three');
var SceneObject = require('./SceneObject.js');

var Cube = function (_SceneObject) {
  _inherits(Cube, _SceneObject);

  function Cube(size) {
    _classCallCheck(this, Cube);

    if (!size) {
      // defalt size
      size = new THREE.Vector3(100, 100, 100);
    }
    var geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    var material = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });

    var _this = _possibleConstructorReturn(this, (Cube.__proto__ || Object.getPrototypeOf(Cube)).call(this, geometry, material));

    _this.type = "Cube";
    _this.speed = 25;
    _this.growSpeed = 100;
    _this.resourceCollectionRange = 200;
    _this.resourceCollectionRate = 0.1;
    _this.minSize = new THREE.Vector3(100, 100, 100);
    _this.growthTolerance = 5;

    _this.destinationSize = null;
    _this.growthScalar = 0.0001; // scalar that determines growth speed

    _this.buildRange = 200; // distance can build within
    _this.buildSpeed = 1; // scalar for amount to build
    _this.buildStep = 1; // amount to build per step

    _this.movementTolerance = 200;

    _this.growthVelocity = new THREE.Vector3(1, 1, 1);

    _this.selectedColor = 0xFFFFFF;

    _this.jobPriorities = {
      'move': 8,
      'build': 6,
      'collectResource': 5,
      'goToClosestResourceNode': 2,
      'idle': 1
    };

    // priority queue of jobs
    _this.queue = [{
      job: 'idle',
      priority: 1
    }];

    return _this;
  }

  _createClass(Cube, [{
    key: 'update',
    value: function update() {
      this.growTowardDestinationSize(this.destinationSize);

      this.doJob(this.highestPriorityJob());

      _get(Cube.prototype.__proto__ || Object.getPrototypeOf(Cube.prototype), 'update', this).call(this);
    }
  }, {
    key: 'doJob',
    value: function doJob(job) {
      switch (job.job) {
        case 'idle':
          this.idle();
          break;
        case 'build':
          // move til close enough, then do job
          if (this.getDistanceFrom(job.building) < this.buildRange) {
            this.build(job);
          } else {
            this.move(job.building.position);
          }
          break;
        case 'collectResource':
          // move til close enough, then do job
          if (this.getDistanceFrom(job.resourceNode) < this.resourceCollectionRange) {
            this.collectResource(job.resourceNode);
          } else {
            this.move(job.resourceNode.position);
          }
          break;
        case 'move':
          // move til close enough, then cancel job
          if (this.getDistanceFrom(job.coordinates) > this.movementTolerance) {
            this.move(job.coordinates);
          } else {
            this.removeJob(job);
          }
          break;
        default:
          console.error('unrecognized job ' + job.job);
          break;
      }
    }
  }, {
    key: 'collectResource',
    value: function collectResource(resourceNode) {
      if (resourceNode !== null) {
        // add resources
        var resourceAmountGained = resourceNode.collectionSpeed * this.resourceCollectionRate;

        window.game.player.resources[resourceNode.resourceType] += resourceAmountGained;
      } else {
        console.error('collectResource encountered null resourceNode');
      }
    }

    /*
      Automatically removes itself on completion
      Pauses building if resources insufficient
    */

  }, {
    key: 'build',
    value: function build(job) {
      var canBuild = true;
      var buildAmt = this.buildSpeed * 1;
      var buildCost = job.building.buildCost.map(function (resource) {
        return {
          // charge (buildAmt * 1%) of resource
          type: resource.type,
          amt: resource.amt * (buildAmt / 100)
        };
      });

      // determine if player has sufficient resources
      for (var i in buildCost) {
        if (buildCost[i].amt > window.game.player.resources[buildCost[i].type]) {
          // insufficient resources, pause build & break
          canBuild = false;
          break;
        }
      }

      if (canBuild) {

        var completion = job.building.build(buildAmt);

        if (completion >= 100) {
          // build complete
          this.removeJob(job);
        } else {
          // build still to go

          // charge player resources
          for (var _i in buildCost) {
            window.game.player.resources[buildCost[_i].type] -= buildCost[_i].amt;
          }
        }
      } else {
        // player doesn't have enough resources; wait til they do before building
      }
    }
  }, {
    key: 'move',
    value: function move(coords) {
      this.destination = coords;
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.destination = this.position;
    }
  }, {
    key: 'queueJob',
    value: function queueJob(job) {
      // assign job priority
      job.priority = this.jobPriorities[job.job];

      // process job
      switch (job.job) {
        case 'move':
          for (var i in this.queue) {
            // at most 1 move instr, queuing updates existing job
            if (this.queue[i].job === 'move') {
              this.queue[i].coordinates = job.coordinates;
            } else if (this.queue[i].job == 'build' || this.queue[i].job == 'collectResource') {
              this.removeJob(this.queue[i]);
            }
          }
          this.queue.push(job);
          break;
        case 'idle':
          // already the default, no need to queue
          break;
        case 'grow':
          // happens async, no need to queue
          this.grow(job.size);
          break;
        case 'shrink':
          // happens async, no need to queue
          this.shrink(job.size);
          break;
        case 'collectResource':
          for (var _i2 in this.queue) {
            if (this.queue[_i2].job == 'collectResource') {
              // update current collectResource job
              this.queue[_i2] = job;
              return;
            } else if (this.queue[_i2].job == 'move' || this.queue[_i2].job == 'build') {
              // cancel any existing move and build jobs
              this.removeJob(this.queue[_i2]);
            }
          }
          this.queue.push(job);
          break;
        case 'build':
          for (var _i3 in this.queue) {
            if (this.queue[_i3].building == job.building) {
              // don't queue build jobs on same building
              return;
            } else if (this.queue[_i3].job == 'move' || this.queue[_i3].job == 'build' || this.queue[_i3].job == 'collectResource') {
              // cancel any existing move and build jobs
              this.removeJob(this.queue[_i3]);
            }
          }
          this.queue.push(job);
          break;
        default:
          console.error('unrecognized job ' + job.job);
          break;
      }
    }
  }, {
    key: 'removeJob',
    value: function removeJob(job) {
      // process job removal
      switch (job.job) {
        case 'idle':
          // do nothing, idle not removable
          return;
        case 'undefined':
          console.error('job.job undefined- did you mean to pass a job obj?');
          break;
        default:
          // remove job from queue
          for (var i in this.queue) {
            if (this.queue[i].job == job.job) {
              this.queue.splice(i, 1);
            }
          }
          break;
      }
    }
  }, {
    key: 'idle',
    value: function idle() {}
    // do nothing


    /*
      @size Vector3(x to add, y to add, z to add)
    */

  }, {
    key: 'grow',
    value: function grow(size) {
      var currentSize = this.getSize();

      this.destinationSize = new THREE.Vector3(currentSize.x + size.x, currentSize.y + size.y, currentSize.z + size.z);
    }

    /*
      @size Vector3(x to add, y to add, z to add)
    */

  }, {
    key: 'shrink',
    value: function shrink(size) {
      var currentSize = this.getSize();

      this.destinationSize = new THREE.Vector3(Math.max(currentSize.x - size.x, this.minSize.x), Math.max(currentSize.y - size.y, this.minSize.y), Math.max(currentSize.z - size.z, this.minSize.z));
    }
  }, {
    key: 'highestPriorityJob',
    value: function highestPriorityJob() {
      var priority = 0,
          highestPriorityJob = void 0;
      for (var i in this.queue) {
        if (this.queue[i].priority > priority) {
          highestPriorityJob = this.queue[i];
        }
      }
      return highestPriorityJob;
    }
  }, {
    key: 'getClosestResourceNode',
    value: function getClosestResourceNode() {
      var _this2 = this;

      // find & process all resource nodes
      var sceneObject = void 0;
      var resourceNodes = window.game.resourceNodes.map(function (sceneObject) {
        sceneObject.distance = _this2.getDistanceFrom(sceneObject);
        return sceneObject;
      });

      // find closest resource node
      if (resourceNodes.length > 0) {
        var minDistanceNode = resourceNodes[0];
        for (var i in resourceNodes) {
          if (resourceNodes[i].distance < minDistanceNode.distance) {
            minDistanceNode = resourceNodes[i];
          }
        }

        return minDistanceNode;
      } else {
        // there are no available resource nodes
        return null;
      }
    }
  }, {
    key: 'growTowardDestinationSize',
    value: function growTowardDestinationSize(size) {
      if (size !== null) {
        var mySize = this.getSize();
        var difX = size.x - mySize.x;
        var difY = size.y - mySize.y;
        var difZ = size.z - mySize.z;

        // only grow if farther than
        var tolerance = this.growthTolerance;
        if (Math.abs(difX) > tolerance || Math.abs(difY) > tolerance || Math.abs(difZ) > tolerance) {
          // grow
          this.scale.set(Math.max(this.scale.x + this.growthScalar * difX, 0), Math.max(this.scale.y + this.growthScalar * difY, 0), Math.max(this.scale.z + this.growthScalar * difZ, 0));
        }

        this.size = this.getSize();
      }
    }
  }]);

  return Cube;
}(SceneObject);

module.exports = Cube;
//# sourceMappingURL=Cube-Box.js.map