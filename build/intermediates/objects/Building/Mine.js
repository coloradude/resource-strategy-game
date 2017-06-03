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

var Mine = function (_Building) {
  _inherits(Mine, _Building);

  function Mine(game) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new THREE.Vector3(GameSettings.mine.defaultSize.x, GameSettings.mine.defaultSize.y, GameSettings.mine.defaultSize.z);
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'mine';
    var status = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'incomplete';

    _classCallCheck(this, Mine);

    var model = GameSettings.mine.model;

    var _this = _possibleConstructorReturn(this, (Mine.__proto__ || Object.getPrototypeOf(Mine)).call(this, game, model, size, status));

    _this.buildingType = GameSettings.mine.type;

    _this.buildingHasNotBegunTexture = GameSettings.mine.buildingHasNotBegunTexture;
    _this.buildingInProgressTexture = GameSettings.mine.buildingInProgressTexture;
    _this.buildingCompleteTexture = GameSettings.mine.buildingCompleteTexture;

    _this.buildCost = GameSettings.mine.buildCost;

    _this.collectionSpeed = GameSettings.mine.collectionSpeed;
    _this.resourceType = GameSettings.mine.resourceType;

    _this.completeColor = GameSettings.mine.completeColor;
    _this.incompleteColor = GameSettings.mine.incompleteColor;
    return _this;
  }

  _createClass(Mine, [{
    key: 'update',
    value: function update() {
      _get(Mine.prototype.__proto__ || Object.getPrototypeOf(Mine.prototype), 'update', this).call(this);
    }
  }, {
    key: 'onModelLoad',
    value: function onModelLoad() {
      this.meshes = this.children[0].children[0].children;
      this.baseMesh = this.meshes[0];
      this.cubeMesh = this.meshes[1];
      _get(Mine.prototype.__proto__ || Object.getPrototypeOf(Mine.prototype), 'onModelLoad', this).call(this);
    }
  }, {
    key: 'updateAppearanceByCompletion',
    value: function updateAppearanceByCompletion() {
      if (!this.selected) {
        if (this.completion >= 100) {
          this.changeCubeColor(this.completeColor);
          this.changeBaseTexture(this.buildingCompleteTexture);
        } else if (this.completion === 0) {
          this.changeCubeColor(this.buildingNotStartedColor);
          this.changeBaseTexture(this.buildingHasNotBegunTexture);
        } else {
          this.changeBaseTexture(this.buildingInProgressTexture);
          this.changeCubeColor(this.incompleteColor);
        }
      } else {
        this.changeCubeColor(0xFFFFFF);
      }

      // raise cube according to completion
      this.setCubeHeight(2 * this.completion);
    }
  }, {
    key: 'setCubeHeight',
    value: function setCubeHeight(height) {
      var boundingBox = new THREE.Box3().setFromObject(this.cubeMesh);
      var myHeight = boundingBox.max.z - boundingBox.min.z;
      var myZScale = this.cubeMesh.scale.z;

      this.cubeMesh.scale.z = Math.max(myZScale * height / myHeight, 0.1);
    }
  }, {
    key: 'changeBaseTexture',
    value: function changeBaseTexture(texture) {
      if (this.baseTexture !== texture) {
        var tex = this.textureLoader.load(texture);

        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);

        this.meshes = this.children[0].children[0].children;
        this.meshes[0].material.map = tex;
        this.meshes[0].material.needsUpdate = true;
        this.baseTexture = texture;
      }
    }
  }, {
    key: 'changeCubeColor',
    value: function changeCubeColor(color) {
      if (this.cubeColor !== color) {
        this.cubeMesh.material = new THREE.MeshLambertMaterial({
          color: color
        });
        this.cubeMesh.material.needsUpdate = true;
        this.cubeColor = color;
      }
    }

    /*
      @objArray an array of current selectedUnits
      @coords the intersection of mouse raycast and this object
      This is called whenever a player right-clicks on this object while selectedObjects.length > 0
    */

  }, {
    key: 'assign',
    value: function assign(objArray, coords) {

      if (this.completion >= 100) {
        for (var i in objArray) {
          objArray[i].queueJob({
            job: 'collectResource',
            resourceNode: this
          });
        }
      } else {
        _get(Mine.prototype.__proto__ || Object.getPrototypeOf(Mine.prototype), 'assign', this).call(this, objArray, coords);
      }

      return true;
    }
  }]);

  return Mine;
}(Building);

module.exports = Mine;
//# sourceMappingURL=Mine.js.map