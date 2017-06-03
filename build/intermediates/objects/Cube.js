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
var Model = require('./Model.js');
var GameSettings = require('../GameSettings.js');

var Cube = function (_Model) {
  _inherits(Cube, _Model);

  function Cube(game) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new THREE.Vector3(GameSettings.cube.defaultSize.x, GameSettings.cube.defaultSize.y, GameSettings.cube.defaultSize.z);
    var model = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : './build/output/assets/models/inset-cube.dae';

    _classCallCheck(this, Cube);

    var _this = _possibleConstructorReturn(this, (Cube.__proto__ || Object.getPrototypeOf(Cube)).call(this, game, model, size));

    _this.model = model;

    _this.type = "cube";
    _this.speed = 25;
    _this.growSpeed = 100;

    // distance can collect from resource within
    _this.resourceCollectionRange = new THREE.Vector3(25, 25, 25);
    _this.resourceCollectionRate = 0.1;

    _this.destinationSize = null;
    _this.growthTolerance = 5;
    _this.growthScalar = 0.0001; // scalar that determines growth speed
    _this.minSize = new THREE.Vector3(100, 100, 100);

    _this.buildRange = new THREE.Vector3(25, 25, 25); // distance can build within
    _this.buildSpeed = 1; // scalar for amount to build
    _this.buildStep = 1; // amount to build per step

    _this.movementTolerance = new THREE.Vector3(1, 1, 1);

    _this.growthVelocity = new THREE.Vector3(1, 1, 1);

    _this.innerCubeColor = 0x8E1111;
    _this.outerCubeColor = 0x666666;
    _this.selectedColor = 0xFFFFFF;
    _this.unselectedColor = _this.innerCubeColor;
    return _this;
  }

  _createClass(Cube, [{
    key: 'update',
    value: function update() {
      if (this.isLoaded) {
        this.growTowardDestinationSize(this.destinationSize);
        this.doJob(this.getHighestPriorityJob());
      }
      _get(Cube.prototype.__proto__ || Object.getPrototypeOf(Cube.prototype), 'update', this).call(this);
    }

    /*
      Function run one time once model has loaded
    */

  }, {
    key: 'onModelLoad',
    value: function onModelLoad() {
      this.meshes = this.children[0].children[0].children;

      this.outerCubeMeshOutside = this.meshes[0];
      this.outerCubeMeshInside = this.meshes[1];

      this.innerCubeMesh = this.meshes[2];

      this.setInnerCubeColor(this.innerCubeColor);
      this.setOuterCubeColor(this.outerCubeColor);

      _get(Cube.prototype.__proto__ || Object.getPrototypeOf(Cube.prototype), 'onModelLoad', this).call(this);
    }
  }, {
    key: 'doJob',
    value: function doJob(job) {
      var box = void 0;
      switch (job.job) {
        case 'idle':
          this.idle();
          break;
        case 'build':
          // create boundingBox for target building
          box = new THREE.Box3().setFromObject(job.building);

          // move til close enough, then do job
          if (this.boundingBox.expandByVector(this.buildRange).intersectsBox(box)) {
            this.setDestination(this.position);
            this.build(job);
          } else {
            this.setDestination(new THREE.Vector3(job.building.position.x + job.building.size.x / 2, job.building.position.y + job.building.size.y / 2, 0));
          }
          break;
        case 'collectResource':
          // create boundingBox for target
          box = new THREE.Box3().setFromObject(job.resourceNode);

          // move til close enough, then do job
          if (this.boundingBox.expandByVector(this.resourceCollectionRange).intersectsBox(box)) {
            this.setDestination(this.position);
            this.collectResource(job.resourceNode);
          } else {
            this.setDestination(new THREE.Vector3(job.resourceNode.position.x + job.resourceNode.size.x / 2, job.resourceNode.position.y + job.resourceNode.size.y / 2, 0));
          }
          break;
        case 'move':
          // move til close enough, then cancel job
          if (this.boundingBox.expandByVector(this.movementTolerance).containsPoint(job.coordinates)) {
            this.setDestination(this.position);
            this.removeJob(job);
          } else {
            this.setDestination(job.coordinates);
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
        // increase building completion & charge player resource cost
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
    key: 'setDestination',
    value: function setDestination(coords) {
      this.destination = coords;
    }
  }, {
    key: 'removeJob',
    value: function removeJob(job) {
      // process job removal
      switch (job.job) {
        case 'idle':
          // do nothing, idle not removable
          return;
        case undefined:
          console.error('job.job undefined- did you mean to pass a job obj?');
          break;
        default:
          // remove job from queue
          this.queue = this.queue.filter(function (obj) {
            return obj.job !== job.job;
          });
          break;
      }
    }

    /*
      Called once (externally) when assigning new job
    */

  }, {
    key: 'queueJob',
    value: function queueJob(job) {
      // reset pathfinding momentum
      this.momentum = new THREE.Vector3(0, 0, 0);

      // apply default job priority if undefined
      if (job.priority === undefined) {
        job.priority = this.jobPriorities[job.job];
      }

      // process job addition
      switch (job.job) {
        case 'move':
          for (var i in this.queue) {
            if (this.queue[i].job === 'move') {
              // at most 1 move instr, queuing updates existing job
              this.queue[i].coordinates = job.coordinates;
              return;
            } else if (
            // new move job destroys existing build, collectResource jobs
            this.queue[i].job == 'build' || this.queue[i].job == 'collectResource') {
              // cancel any existing build, collectResource jobs
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
              // cancel any existing move, build, collectResource jobs
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
    key: 'getHighestPriorityJob',
    value: function getHighestPriorityJob() {
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
  }, {
    key: 'select',
    value: function select() {
      var selected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (selected) {
        this.setInnerCubeColor(this.selectedColor);
      } else {
        this.setInnerCubeColor(this.unselectedColor);
      }
    }
  }, {
    key: 'setInnerCubeColor',
    value: function setInnerCubeColor(color) {
      this.innerCubeMesh.material = new THREE.MeshLambertMaterial({
        color: color
      });
      this.innerCubeMesh.material.needsUpdate = true;
      this.innerCubeColor = color;
    }
  }, {
    key: 'setOuterCubeColor',
    value: function setOuterCubeColor(color) {
      this.outerCubeMeshOutside.material = new THREE.MeshLambertMaterial({
        color: color
      });

      this.outerCubeMeshInside.material = new THREE.MeshLambertMaterial({
        color: Math.min(0, Math.max(color, 0xFFFFFF))
      });

      this.outerCubeMeshOutside.material.needsUpdate = true;
      this.outerCubeMeshInside.material.needsUpdate = true;

      this.outerCubeColor = color;
    }
  }]);

  return Cube;
}(Model);

module.exports = Cube;
//# sourceMappingURL=Cube.js.map