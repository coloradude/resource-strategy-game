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
var Model = require('../Model.js');
var GameSettings = require('../../GameSettings.js');

/*
  Resource nodes give resources to miners/gatherers/etc.
  Most have a set resource limit (until which they expire).
  Generally, collection can only be done on player's claimed territory.
  As a general rule, resource collection speed should be faster from resource nodes than from production buildings.
*/

var ResourceNode = function (_Model) {
  _inherits(ResourceNode, _Model);

  function ResourceNode(game, model) {
    var size = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new THREE.Vector3(GameSettings.resourceNode.defaultSize.x, GameSettings.resourceNode.defaultSize.y, GameSettings.resourceNode.defaultSize.z);
    var resourceRemaining = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;

    _classCallCheck(this, ResourceNode);

    var _this = _possibleConstructorReturn(this, (ResourceNode.__proto__ || Object.getPrototypeOf(ResourceNode)).call(this, game, model, size));

    _this.model = model;
    _this.type = "resourceNode";
    _this.resourceType = null;
    _this.collectionSpeed = 1;
    _this.resourceRemaining = resourceRemaining;
    _this.speed = 0;
    _this.selected = false;
    _this.matrixAutoUpdate = false;
    return _this;
  }

  _createClass(ResourceNode, [{
    key: 'update',
    value: function update() {
      this.updateMatrix();
    }
  }, {
    key: 'onModelLoad',
    value: function onModelLoad() {
      this.topMesh = this.children[0].children[0].children[0].material.materials[0];
      this.baseMesh = this.children[0].children[0].children[0].material.materials[1];

      this.setBaseColor(this.baseColor);
      this.setTopColor(this.topColor);

      _get(ResourceNode.prototype.__proto__ || Object.getPrototypeOf(ResourceNode.prototype), 'onModelLoad', this).call(this);
      this.updateMatrix();
    }
  }, {
    key: 'setBaseColor',
    value: function setBaseColor(color) {
      if (this.baseMesh.color !== color) {
        this.baseMesh.color = new THREE.Color(color);
      }
    }
  }, {
    key: 'setTopColor',
    value: function setTopColor(color) {
      if (this.topMesh.color !== color) {
        this.topMesh.color = new THREE.Color(color);
      }
    }
  }, {
    key: 'assign',
    value: function assign(objArray, coords) {

      for (var i in objArray) {

        objArray[i].queueJob({
          job: 'collectResource',
          resourceNode: this
        });
      }
      return true; // stop bubbling
    }
  }, {
    key: 'select',
    value: function select() {
      var selected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      this.selected = selected;

      if (selected) {
        this.setBaseColor(0xFFFFFF);
        this.setTopColor(0xFFFFFF);
      } else {
        this.setBaseColor(this.baseColor);
        this.setTopColor(this.topColor);
      }
    }
  }]);

  return ResourceNode;
}(Model);

module.exports = ResourceNode;
//# sourceMappingURL=ResourceNode.js.map