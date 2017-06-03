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

var InterfaceObject = function (_THREE$Mesh) {
  _inherits(InterfaceObject, _THREE$Mesh);

  function InterfaceObject(geometry, material) {
    _classCallCheck(this, InterfaceObject);

    var _this = _possibleConstructorReturn(this, (InterfaceObject.__proto__ || Object.getPrototypeOf(InterfaceObject)).call(this, geometry, material));

    _this.size = new THREE.Vector3(0, 0, 0);
    return _this;
  }

  _createClass(InterfaceObject, [{
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
      this.boundingBox = new THREE.Box3().setFromObject(sceneObject);
      this.size.x = this.boundingBox.max.x - this.boundingBox.min.x;
      this.size.y = this.boundingBox.max.y - this.boundingBox.min.y;
      this.size.z = this.boundingBox.max.z - this.boundingBox.min.z;
    }
  }, {
    key: 'getSize',
    value: function getSize() {
      return new THREE.Vector3(this.size.x, this.size.y, this.size.z);
    }
  }]);

  return InterfaceObject;
}(THREE.Mesh);

module.exports = InterfaceObject;
//# sourceMappingURL=InterfaceObject.js.map