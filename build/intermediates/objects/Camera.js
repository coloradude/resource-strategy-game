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

var Camera = function (_THREE$PerspectiveCam) {
  _inherits(Camera, _THREE$PerspectiveCam);

  function Camera(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM, CAMERA_START_X, CAMERA_START_Y, CAMERA_START_Z, MAPWIDTH, MAPLENGTH, MAXZOOM, MINZOOM) {
    _classCallCheck(this, Camera);

    var _this = _possibleConstructorReturn(this, (Camera.__proto__ || Object.getPrototypeOf(Camera)).call(this, FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM));

    _this.position.x = CAMERA_START_X;
    _this.position.y = CAMERA_START_Y;
    _this.position.z = CAMERA_START_Z;

    _this.aspect = ASPECT;
    _this.mapWidth = MAPWIDTH;
    _this.mapLength = MAPLENGTH;
    _this.maxZoom = MAXZOOM;
    _this.minZoom = MINZOOM;
    return _this;
  }

  _createClass(Camera, [{
    key: 'moveTo',
    value: function moveTo(coords) {
      // limit movement to within game bounds
      coords.x = Math.min(coords.x, this.mapWidth);
      coords.x = Math.max(coords.x, 0);
      coords.y = Math.min(coords.y, this.mapLength);
      coords.y = Math.max(coords.y, 0);
      coords.z = Math.min(coords.z, this.maxZoom);
      coords.z = Math.max(coords.z, this.minZoom);

      this.position.set(coords.x, coords.y, coords.z);
    }
  }]);

  return Camera;
}(THREE.PerspectiveCamera);

module.exports = Camera;
//# sourceMappingURL=Camera.js.map