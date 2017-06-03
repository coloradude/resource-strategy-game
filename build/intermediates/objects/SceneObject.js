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

var SceneObject = function (_THREE$Mesh) {
  _inherits(SceneObject, _THREE$Mesh);

  function SceneObject(geometry, material) {
    _classCallCheck(this, SceneObject);

    // movement options
    var _this = _possibleConstructorReturn(this, (SceneObject.__proto__ || Object.getPrototypeOf(SceneObject)).call(this, geometry, material));

    _this.speed = 0;
    _this.velocity = new THREE.Vector3(0, 0, 0);
    _this.canAssign = true;

    _this.castShadow = true;
    _this.receiveShadow = true;

    _this.boundingBox = null;
    _this.destination = null;

    _this.selectedColor = 0xFFFFFF;
    _this.unselectedColor = 0xCC0000;

    _this.destinationRange = new THREE.Vector3(25, 25, 25); // tolerance for how close an object must get before stopping
    return _this;
  }

  _createClass(SceneObject, [{
    key: 'update',
    value: function update() {
      this.moveTowardDestination(this.destination);
    }
  }, {
    key: 'moveTowardDestination',
    value: function moveTowardDestination() {
      var destination = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      if (destination !== null) {
        var difX = destination.x - this.position.x;
        var difY = destination.y - this.position.y;
        var difZ = destination.z - this.position.z;

        // correct destination
        difX -= Math.sign(difX) * this.size.x / 2;
        difY -= Math.sign(difY) * this.size.y / 2;
        difZ -= Math.sign(difZ) * this.size.z / 2;

        // only move if farther than this.destinationRange
        if (Math.abs(difX) > this.destinationRange.x || Math.abs(difY) > this.destinationRange.y || Math.abs(difZ) > this.destinationRange.z) {
          var d = Math.sqrt(Math.pow(difX, 2) + Math.pow(difY, 2) + Math.pow(difZ, 2));

          // move at constant speed no matter the direction
          this.velocity.x = this.speed * difX / d;
          this.velocity.y = this.speed * difY / d;
          this.velocity.z = this.speed * difZ / d;

          if (this.velocity.x !== 0 || this.velocity.y !== 0 || this.velocity.z !== 0) {
            // update position
            this.position.x += this.velocity.x;
            this.position.y += this.velocity.y;
            this.position.z += this.velocity.z;

            // store local position
            this.position.x = this.position.x;
            this.position.y = this.position.y;
            this.position.z = this.position.z;
          }
        }
      }
    }
  }, {
    key: 'setName',
    value: function setName(name) {
      this.name = name;
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.name;
    }
  }, {
    key: 'setSceneObject',
    value: function setSceneObject(sceneObject) {
      this.sceneObject = sceneObject;
      this.boundingBox = new THREE.Box3().setFromObject(this.sceneObject);
      this.size = this.getSize();
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      this.boundingBox = new THREE.Box3().setFromObject(this.sceneObject);
      return new THREE.Vector3(this.boundingBox.max.x - this.boundingBox.min.x, this.boundingBox.max.y - this.boundingBox.min.y, this.boundingBox.max.z - this.boundingBox.min.z);
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
    value: function select(selected) {
      if (selected) {
        this.material.color.setHex(this.selectedColor);
      } else {
        this.material.color.setHex(this.unselectedColor);
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
  }]);

  return SceneObject;
}(THREE.Mesh);

module.exports = SceneObject;
//# sourceMappingURL=SceneObject.js.map