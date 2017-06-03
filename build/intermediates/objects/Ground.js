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

var Ground = function (_THREE$Mesh) {
  _inherits(Ground, _THREE$Mesh);

  function Ground(game, width, length, heightMap) {
    _classCallCheck(this, Ground);

    var widthSegments = 256;
    var lengthSegments = 256;

    var geometry = new THREE.PlaneGeometry(width, length, widthSegments - 1, lengthSegments - 1);

    var loader = new THREE.TextureLoader();

    var texture = loader.load('./build/output/assets/sand.jpg');
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(5, 5);

    var material = new THREE.MeshPhongMaterial({
      map: texture
    });

    var _this = _possibleConstructorReturn(this, (Ground.__proto__ || Object.getPrototypeOf(Ground)).call(this, geometry, material));

    _this.castShadow = true;
    _this.receiveShadow = true;
    _this.heightMapConstant = 10;

    _this.position.set(width / 2, length / 2, 0);

    _this.assignHeightMap(heightMap);

    _this.game = game;
    _this.name = "ground";
    _this.width = width;
    _this.length = length;
    _this.widthSegments = widthSegments;
    _this.lengthSegments = lengthSegments;
    _this.matrixAutoUpdate = false;

    _this.game.scene.add(_this);
    _this.updateMatrix();
    return _this;
  }

  _createClass(Ground, [{
    key: 'assignHeightMap',
    value: function assignHeightMap(heightMap) {
      /*
        Height z values stored as 8-bit (max 255) value
      */

      // iterate over image data
      for (var i in this.geometry.vertices) {
        this.geometry.vertices[i].z = heightMap[i] * this.heightMapConstant;
      }

      this.geometry.computeFaceNormals();
      this.geometry.computeVertexNormals();
    }
  }, {
    key: 'getHeight',
    value: function getHeight(x, y) {

      // map (0, 0) starts top left; invert that to query proper vertex
      y = this.length - y;

      // convert world coordinate to vertex coordinate
      var xVertex = x / this.width * this.widthSegments;
      var yVertex = y / this.length * this.lengthSegments;

      // convert vertex coordinates to vertex number
      var i = Math.floor(yVertex) * this.lengthSegments + Math.floor(xVertex);

      // get height from ground vertices
      var height = this.geometry.vertices[i].z;

      return height;
    }
  }, {
    key: 'assign',
    value: function assign(objArray, coords) {
      for (var i in objArray) {
        objArray[i].queueJob({
          job: 'move',
          coordinates: new THREE.Vector3(coords.x, coords.y, coords.z)
        });
      }

      return true; // stop bubbling
    }
  }]);

  return Ground;
}(THREE.Mesh);

module.exports = Ground;
//# sourceMappingURL=Ground.js.map