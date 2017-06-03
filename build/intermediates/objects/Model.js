'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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
var ColladaLoader = require('./ColladaLoader.js');

var Model = function (_THREE$Object3D) {
  _inherits(Model, _THREE$Object3D);

  function Model(game, model, size) {
    _classCallCheck(this, Model);

    var _this = _possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).call(this));

    _this.game = game;
    _this.size = size;
    _this.isModel = true;
    _this.model = model;

    _this.loader = _this.game.loader;
    _this.textureLoader = _this.game.textureLoader;

    // load model asyncronously
    _this.isLoaded = false;
    _this.onModelLoadRun = false;
    _this.load();

    _this.raycaster = new THREE.Raycaster();

    // movement options
    _this.speed = 0;
    _this.velocity = new THREE.Vector3(0, 0, 0);
    _this.destination = null;
    _this.momentum = new THREE.Vector3(0, 0, 0);

    // render options
    _this.castShadow = true;
    _this.receiveShadow = true;

    _this.selectedColor = 0xFFFFFF;
    _this.unselectedColor = 0xCC0000;

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

    _this.destinationTolerance = new THREE.Vector3(1, 1, 1); // tolerance for how close an object must get before stopping
    return _this;
  }

  _createClass(Model, [{
    key: 'load',
    value: function load() {
      var _this2 = this;

      if (this.model !== null && this.model !== undefined) {

        // asyncronously load model
        this.loader.load(this.model, function (result) {

          // attach loaded model as child of this
          _this2.add(result.scene);

          _this2.matrixWorldNeedsUpdate = true;

          var tempSize = _this2.getSize();

          // set initial scale
          _this2.scale.set(_this2.size.x / tempSize.x, _this2.size.y / tempSize.y, _this2.size.z / tempSize.z);

          // add this to game scene
          _this2.game.scene.add(_this2);

          // calculate size
          _this2.size = _this2.getSize();

          _this2.onModelLoad();
          _this2.isLoaded = true;
        }.bind(this));
      } else {
        console.error('Model() tried loading a null or undefined model');
      }
    }
  }, {
    key: 'onModelLoad',
    value: function onModelLoad() {
      this.boundingBox = new THREE.Box3().setFromObject(this);
      this.onModelLoadRun = true;
    }
  }, {
    key: 'update',
    value: function update() {
      if (this.isLoaded && this.onModelLoadRun) {
        // main update loop
        this.moveTowardDestination(this.destination);
      } else {
        // loading model...
      }
    }

    /*
      Includes collision detection and automatic path correction
    */

  }, {
    key: 'moveTowardDestination',
    value: function moveTowardDestination(destination) {

      if (destination !== null && destination !== undefined) {

        var dif = new THREE.Vector3(0, 0, 0),
            absDif = new THREE.Vector3(0, 0, 0);

        var centerPoint = new THREE.Vector3(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.position.z // we want the floor of the model to determine its position
        );

        var mapHeight = this.game.ground.getHeight(centerPoint.x, centerPoint.y);

        // calculate distance from center of floor of model to destination
        for (var i in { 'x': null, 'y': null, 'z': null }) {
          dif[i] = destination[i] - centerPoint[i];
          absDif[i] = Math.abs(dif[i]);
        }

        // create collision detection bounding box for this
        this.boundingBox = new THREE.Box3().setFromObject(this);

        var isWithinDestinationTolerance = this.boundingBox.expandByVector(this.destinationTolerance).containsPoint(this.destination);

        // only move if not already there
        if (!isWithinDestinationTolerance) {

          // calculate euclidian speed (total 3d speed should be this.speed)
          var d = Math.sqrt(Math.pow(dif.x, 2) + Math.pow(dif.y, 2) + Math.pow(dif.z, 2));

          // determine 3d velocity
          for (var _i in { 'x': null, 'y': null, 'z': null }) {
            // move at constant speed no matter the direction
            this.velocity[_i] = this.speed * dif[_i] / d;

            // update position, but don't move more than the difference
            if (absDif[_i] <= Math.abs(this.velocity[_i])) {
              this.velocity[_i] = dif[_i];
            }
          }

          // track collision detections
          var col = new THREE.Vector3(0, 0, 0);

          // create list of collision-eligable units to check for
          var collisionChecklist = [].concat(this.game.buildings, this.game.resourceNodes);

          // check for potential collision, storing result in col
          for (var _i2 in collisionChecklist) {
            var unit = collisionChecklist[_i2];

            if (unit != this) {
              if (this.boundingBox.min.x + this.velocity.x <= unit.boundingBox.max.x && this.boundingBox.max.x >= unit.boundingBox.min.x && this.boundingBox.min.y < unit.boundingBox.max.y && this.boundingBox.max.y > unit.boundingBox.min.y && this.velocity.x < 0) {
                // moving -x collision
                col.x = -1;
              }

              if (this.boundingBox.max.x + this.velocity.x >= unit.boundingBox.min.x && this.boundingBox.min.x + this.velocity.x <= unit.boundingBox.max.x && this.boundingBox.min.y < unit.boundingBox.max.y && this.boundingBox.max.y > unit.boundingBox.min.y && this.velocity.x > 0) {
                // moving +x collision
                col.x = 1;
              }

              if (this.boundingBox.min.y + this.velocity.y <= unit.boundingBox.max.y && this.boundingBox.max.y + this.velocity.y >= unit.boundingBox.min.y && this.boundingBox.min.x < unit.boundingBox.max.x && this.boundingBox.max.x > unit.boundingBox.min.x && this.velocity.y < 0) {
                // moving -y collision
                col.y = -1;
              }

              if (this.boundingBox.max.y + this.velocity.y >= unit.boundingBox.min.y && this.boundingBox.min.y + this.velocity.y <= unit.boundingBox.max.y && this.boundingBox.min.x < unit.boundingBox.max.x && this.boundingBox.max.x > unit.boundingBox.min.x && this.velocity.y > 0) {
                // moving +y collision
                col.y = 1;
              }
            }
          }

          // horizontal collision
          if (col.x) {

            this.velocity.x = 0;

            if (!this.momentum.y) {
              if (this.velocity.y < 0) {
                this.momentum.y = -1;
              } else {
                this.momentum.y = 1;
              }
            }

            this.momentum.x = 0;

            this.velocity.y = this.momentum.y * this.speed;
          }

          // vertical collision
          if (col.y) {

            this.velocity.y = 0;

            if (!this.momentum.x) {
              if (this.velocity.x < 0) {
                this.momentum.x = -1;
              } else {
                this.momentum.x = 1;
              }
            }

            this.momentum.y = 0;

            this.velocity.x = this.momentum.x * this.speed;
          }

          // if freely moving, reset momentum
          if (!col.y && !col.x) {
            this.momentum.x = 0;
            this.momentum.y = 0;
          }

          // do the movement
          for (var _i3 in { 'x': null, 'y': null }) {
            this.position[_i3] += this.velocity[_i3];
          }

          // snap to ground
          this.position.z = mapHeight;
        } else {
          // already within destinationTolerance, don't move
          this.momentum.x = 0;
          this.momentum.y = 0;
        }
      } else {
        // destination is null, don't move
      }
    }

    /*
      Collision detection within @radius over @intersectObjects
       @radius: radius to check for colliosion from center of this
      @intersectObjects: array of objects to check for collision
      @near: min distance collions can occur
      @far: max distance collisions can occur
    */

  }, {
    key: 'getClosebyUnits',
    value: function getClosebyUnits(intersectObjects, near, far, numRays) {

      if (intersectObjects === undefined) {
        intersectObjects = [].concat(this.game.cubes, this.game.resourceNodes, this.game.buildings);
      }

      if (near === undefined) {
        near = 0;
      }

      if (far === undefined) {
        far = 1000;
      }

      if (numRays === undefined) {
        numRays = 100;
      }

      var centerPoint = new THREE.Vector3(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, this.position.z + this.size.z / 2);

      var raycaster = new THREE.Raycaster(centerPoint, new THREE.Vector3(0, 0, 0), near, far);

      var units = [];

      var pi = 3.14;

      var theta = void 0,
          x = void 0,
          y = void 0,
          collisions = void 0;

      // cast rays in circle, starting in center of this
      for (var i = 0; i < numRays; i++) {

        theta = i / numRays * (pi * 2);
        x = Math.cos(theta);
        y = Math.sin(theta);

        // create normalized direction vector
        var direction = new THREE.Vector3(x, y, 0);

        raycaster.set(centerPoint, direction);

        collisions = raycaster.intersectObjects(intersectObjects, true);

        if (collisions.length > 0) {

          for (var _i4 in collisions) {
            var obj = collisions[_i4].object;
            while (obj.parent !== this.game.scene) {
              obj = obj.parent;
            }

            if (obj !== this && units.indexOf(obj) < 0) {
              units.push(obj);
            }
          }
        }
      }

      return units;
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      var boundingBox = new THREE.Box3().setFromObject(this);

      return new THREE.Vector3(boundingBox.max.x - boundingBox.min.x, boundingBox.max.y - boundingBox.min.y, boundingBox.max.z - boundingBox.min.z);
    }
  }, {
    key: 'getCollisionPointFrom',
    value: function getCollisionPointFrom(obj) {

      var destination = new THREE.Vector3(0, 0, 0);

      for (var i in { 'x': null, 'y': null, 'z': null }) {

        if (this.position[i] > obj.position[i] + obj.size[i]) {
          // obj to left of this
          destination[i] = this.position[i] - obj.size[i];
        } else if (this.position[i] + this.size[i] > obj.position[i] + obj.size[i]) {
          // obj above/below this
          destination[i] = obj.position[i];
        } else {
          // obj to right of this
          destination[i] = this.position[i] + this.size[i];
        }
      }

      return destination;
    }

    /*
      @distances: a Vector3 obj describing the bounds to check within
      @obj: a scene object or Vector3 coordinate object to check how far we are
    */

  }, {
    key: 'isWithinFrom',
    value: function isWithinFrom(distances, obj) {

      if (obj.position === undefined) {
        obj.position = obj;
        obj.size = new THREE.Vector3(0, 0, 0);
      }

      for (var i in { 'x': null, 'y': null, 'z': null }) {

        if (this.position[i] - distances[i] <= obj.position[i] + obj.size[i] && this.position[i] + this.size[i] + distances[i] >= obj.position[i]) {
          continue;
        } else {
          return false;
        }
      }

      return true;
    }
  }, {
    key: 'getDistanceFrom',
    value: function getDistanceFrom(obj) {
      var point = new THREE.Vector3();

      if (obj.x !== undefined && obj.y !== undefined && obj.z !== undefined) {
        // obj is Vector3
        point = obj;
      } else {
        // assume its a gameobj
        point = obj.position;
      }

      // 3-dimensional pythagorean formula
      return Math.sqrt(Math.pow(this.position.x - point.x, 2) + Math.pow(this.position.y - point.y, 2) + Math.pow(this.position.z - point.z, 2));
    }
  }, {
    key: 'select',
    value: function select() {
      var selected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      if (selected) {
        // need to figure out a universal 'selection' effect and put it here
        // maybe something like a ring around them? or flag above them?
        console.log('Model(): selected ' + this.mine + ', but haven\'t implemented appearance change yet. Try overriding?');
      } else {
        console.log('Model(): deselected ' + this.mine + ', but haven\'t implemented appearance change yet. Try overriding?');
      }
    }

    /*
      @objArray an array of current selectedObjects
      @coords the intersection of mouse raycast and this object
      This is called whenever a player right-clicks on this object while selectedObjects.length > 0
    */

  }, {
    key: 'assign',
    value: function assign(objectsArray, coords) {
      // if bubbling should continue, return falsey
      // otherwise, the click stops bubbling down
      return null;
    }

    /*
      HTML to display inside the selectedUnitsInterface div
      Intended to be ovverridden with "menu actions" for units/buildings/etc
    */

  }, {
    key: 'getInterfaceHtml',
    value: function getInterfaceHtml() {
      return '\n    <p>' + this.name + ' : ' + this.type + '</p>\n    <ul class="actions">\n      <li><span>No actions available.</span></li>\n    </ul>\n    ';
    }
  }, {
    key: 'getQueueHTML',
    value: function getQueueHTML() {
      return '';
    }
  }]);

  return Model;
}(THREE.Object3D);

module.exports = Model;
//# sourceMappingURL=Model.js.map