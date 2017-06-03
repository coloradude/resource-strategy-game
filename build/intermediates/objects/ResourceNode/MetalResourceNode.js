'use strict';

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
var ResourceNode = require('./ResourceNode.js');
var GameSettings = require('../../GameSettings.js');

var MetalResourceNode = function (_ResourceNode) {
  _inherits(MetalResourceNode, _ResourceNode);

  function MetalResourceNode(game, size, resourceRemaining) {
    _classCallCheck(this, MetalResourceNode);

    var model = GameSettings.metalResourceNode.model;

    var _this = _possibleConstructorReturn(this, (MetalResourceNode.__proto__ || Object.getPrototypeOf(MetalResourceNode)).call(this, game, model, size, resourceRemaining));

    _this.baseColor = GameSettings.metalResourceNode.baseColor;
    _this.topColor = GameSettings.metalResourceNode.topColor;

    _this.resourceType = "metal";
    return _this;
  }

  return MetalResourceNode;
}(ResourceNode);

module.exports = MetalResourceNode;
//# sourceMappingURL=MetalResourceNode.js.map