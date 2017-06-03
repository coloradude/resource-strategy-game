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
var InterfaceObject = require('./InterfaceObject.js');

var SelectionBox = function (_InterfaceObject) {
  _inherits(SelectionBox, _InterfaceObject);

  function SelectionBox() {
    _classCallCheck(this, SelectionBox);

    var geometry = new THREE.BoxGeometry(0, 0, 0);
    var material = new THREE.MeshLambertMaterial({
      color: 0xCCCC00,
      transparent: true,
      opacity: 0.5
    });

    var _this = _possibleConstructorReturn(this, (SelectionBox.__proto__ || Object.getPrototypeOf(SelectionBox)).call(this, geometry, material));

    _this.name = "selectionBox";
    _this.type = "interface";
    return _this;
  }

  _createClass(SelectionBox, [{
    key: 'startCoordinates',
    value: function startCoordinates(coords) {
      this.startCoordinates = coords;
      this.position.set(coords.x + this.size.x / 2, coords.y + this.size.y / 2, this.size.z / 2);
    }
  }, {
    key: 'continueCoordinates',
    value: function continueCoordinates() {
      var coords = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new THREE.Vector3(0, 0, 0);

      if (coords !== null) {
        var oldGeometry = this.geometry;

        this.geometry = new THREE.BoxGeometry(this.startCoordinates.x - coords.x, this.startCoordinates.y - coords.y, this.size.z);

        this.setSize();

        this.position.set(Math.min(this.startCoordinates.x, coords.x) + this.size.x / 2, Math.min(this.startCoordinates.y, coords.y) + this.size.y / 2, this.size.z / 2);

        this.currentCoords = coords;
      }
    }
  }, {
    key: 'setSize',
    value: function setSize() {
      this.boundingBox = new THREE.Box3().setFromObject(this);
      this.size.x = this.boundingBox.max.x - this.boundingBox.min.x;
      this.size.y = this.boundingBox.max.y - this.boundingBox.min.y;
      this.size.z = this.boundingBox.max.z - this.boundingBox.min.z;
    }
  }, {
    key: 'getCubesInBox',
    value: function getCubesInBox() {
      var cubes = window.game.cubes;
      var cubesInBox = [];

      if (this.currentCoords !== undefined) {
        // determine bottom left (minX, minY)
        var bottomLeft = new THREE.Vector2(Math.min(this.startCoordinates.x, this.currentCoords.x), Math.min(this.startCoordinates.y, this.currentCoords.y));

        // determine top right (maxX, maxY)
        var topRight = new THREE.Vector2(Math.max(this.startCoordinates.x, this.currentCoords.x), Math.max(this.startCoordinates.y, this.currentCoords.y));

        for (var i in cubes) {
          if (cubes[i].position.x > bottomLeft.x && cubes[i].position.x < topRight.x && cubes[i].position.y > bottomLeft.y && cubes[i].position.y < topRight.y) {
            // add to selection
            cubesInBox.push(cubes[i]);
          }
        }
      }

      return cubesInBox;
    }
  }]);

  return SelectionBox;
}(InterfaceObject);

module.exports = SelectionBox;
//# sourceMappingURL=SelectionBox.js.map