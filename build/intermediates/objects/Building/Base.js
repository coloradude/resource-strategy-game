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
var Building = require('./Building.js');
var GameSettings = require('../../GameSettings.js');

var Base = function (_Building) {
  _inherits(Base, _Building);

  function Base(game) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new THREE.Vector3(GameSettings.base.defaultSize.x, GameSettings.base.defaultSize.y, GameSettings.base.defaultSize.z);
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'base';
    var status = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'incomplete';

    _classCallCheck(this, Base);

    var model = GameSettings.base.model;

    var _this = _possibleConstructorReturn(this, (Base.__proto__ || Object.getPrototypeOf(Base)).call(this, game, model, size, status));

    _this.buildingType = GameSettings.base.type;

    _this.buildingHasNotBegunTexture = GameSettings.base.buildingHasNotBegunTexture;
    _this.buildingInProgressTexture = GameSettings.base.buildingInProgressTexture;
    _this.buildingCompleteTexture = GameSettings.base.buildingCompleteTexture;

    _this.buildCost = GameSettings.base.buildCost;

    _this.completeColor = GameSettings.base.completeColor;
    _this.incompleteColor = GameSettings.base.incompleteColor;
    return _this;
  }

  _createClass(Base, [{
    key: 'update',
    value: function update() {
      _get(Base.prototype.__proto__ || Object.getPrototypeOf(Base.prototype), 'update', this).call(this);
    }
  }, {
    key: 'onModelLoad',
    value: function onModelLoad() {
      _get(Base.prototype.__proto__ || Object.getPrototypeOf(Base.prototype), 'onModelLoad', this).call(this);
    }
  }, {
    key: 'updateAppearanceByCompletion',
    value: function updateAppearanceByCompletion() {}
  }]);

  return Base;
}(Building);

module.exports = Base;
//# sourceMappingURL=Base.js.map