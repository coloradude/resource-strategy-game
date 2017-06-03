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

var Colony = function (_Building) {
  _inherits(Colony, _Building);

  function Colony(game) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new THREE.Vector3(GameSettings.colony.defaultSize.x, GameSettings.colony.defaultSize.y, GameSettings.colony.defaultSize.z);
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'colony';
    var status = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'incomplete';

    _classCallCheck(this, Colony);

    var model = GameSettings.colony.model;

    var _this = _possibleConstructorReturn(this, (Colony.__proto__ || Object.getPrototypeOf(Colony)).call(this, game, model, size, status));

    _this.buildingType = GameSettings.colony.type;

    _this.buildCost = GameSettings.colony.buildCost;

    _this.completeColor = GameSettings.colony.completeColor;
    _this.incompleteColor = GameSettings.colony.incompleteColor;
    _this.buildingHasNotBegunTexture = GameSettings.colony.buildingHasNotBegunTexture;
    _this.buildingInProgressTexture = GameSettings.colony.buildingInProgressTexture;
    _this.buildingCompleteTexture = GameSettings.colony.buildingCompleteTexture;
    _this.cubesColor = GameSettings.colony.cubesColor;
    _this.floorTexture = GameSettings.colony.floorTexture;

    _this.wallHeightProportion = 0.4;
    return _this;
  }

  _createClass(Colony, [{
    key: 'update',
    value: function update() {
      _get(Colony.prototype.__proto__ || Object.getPrototypeOf(Colony.prototype), 'update', this).call(this);
    }
  }, {
    key: 'onModelLoad',
    value: function onModelLoad() {
      this.meshes = this.children[0].children;

      this.floor = this.meshes[0];
      this.walls = this.meshes[1];
      this.ceilingOfEntrance = this.meshes[2];
      this.wallFloor = this.meshes[3];
      this.towerWall0 = this.meshes[4];
      this.towerWall1 = this.meshes[5];
      // unknown [6]
      this.centerTowerWall = this.meshes[7];
      this.centerTowerCeiling = this.meshes[8];
      this.towerWall3 = this.meshes[9];
      this.centerTowerCube = this.meshes[10];
      this.towerCube1 = this.meshes[11];
      this.towerCube2 = this.meshes[12];
      this.towerCubeCeiling = this.meshes[13];
      this.towerWall2 = this.meshes[14];
      this.towerCube3 = this.meshes[15];
      this.tower3Ceiling = this.meshes[16];
      // unknown [17]
      this.towerCube0 = this.meshes[18];

      this.setWallTexture(this.buildingHasNotBegunTexture);
      this.setCubesColor(this.incompleteColor);
      this.setFloorTexture(this.floorTexture);

      _get(Colony.prototype.__proto__ || Object.getPrototypeOf(Colony.prototype), 'onModelLoad', this).call(this);
    }
  }, {
    key: 'updateAppearanceByCompletion',
    value: function updateAppearanceByCompletion() {
      if (!this.selected) {
        if (this.completion >= 100) {
          this.setCenterCubeColor(this.completeColor);
          this.setCubesColor(this.completeColor);
          this.setWallTexture(this.buildingCompleteTexture);
        } else if (this.completion === 0) {
          this.setCenterCubeColor(this.buildingNotStartedColor);
          this.setCubesColor(this.buildingNotStartedColor);
        } else {
          this.setCenterCubeColor(this.incompleteColor);
          this.setWallTexture(this.buildingInProgressTexture);
          this.setCubesColor(this.incompleteColor);
        }
      } else {
        this.setCenterCubeColor(0xFFFFFF);
        this.setCubesColor(0xFFFFFF);
      }

      // raise cube according to completion
      this.setWallHeight(this.completion * this.wallHeightProportion);
    }
  }, {
    key: 'setWallHeight',
    value: function setWallHeight(height) {
      var boundingBox = new THREE.Box3().setFromObject(this.walls);
      var myHeight = boundingBox.max.z - boundingBox.min.z;
      var myZScale = this.walls.scale.z;

      this.walls.scale.z = Math.max(myZScale * height / myHeight, 0.01);
      this.ceilingOfEntrance.scale.z = this.walls.scale.z / 2;
    }
  }, {
    key: 'setCenterCubeColor',
    value: function setCenterCubeColor(color) {
      if (this.centerCubeColor !== color) {

        color = new THREE.Color(color);

        this.centerTowerCube.children[0].material = new THREE.MeshLambertMaterial({
          color: color
        });
        this.centerTowerCube.children[0].material.needsUpdate = true;
        this.centerCubeColor = color;
      }
    }
  }, {
    key: 'setCubesColor',
    value: function setCubesColor(color) {
      color = new THREE.Color(color);

      var material = new THREE.MeshLambertMaterial({
        color: color
      });

      this.towerCube0.children[0].material = material;
      this.towerCube1.children[0].material = material;
      this.towerCube2.children[0].material = material;
      this.towerCube3.children[0].material = material;
    }
  }, {
    key: 'setWallTexture',
    value: function setWallTexture(texture) {
      if (this.wallTexture !== texture) {
        var tex = this.textureLoader.load(texture);

        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);

        var material = new THREE.MeshLambertMaterial({
          map: tex
        });

        this.walls.children[0].material = material;
        this.wallFloor.children[0].material = material;
        this.wallTexture = texture;
      }
    }
  }, {
    key: 'setFloorTexture',
    value: function setFloorTexture(texture) {
      if (this.floorTexture !== texture) {
        var tex = this.textureLoader.load(texture);

        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(2, 2);

        var material = new THREE.MeshLambertMaterial({
          map: tex
        });

        this.meshes[6].children[0].material = material;
        this.meshes[17].children[0].material = material;
        this.floorTexture = texture;
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

      for (var i in objArray) {
        // assign any new jobs to selectedUnits
      }

      _get(Colony.prototype.__proto__ || Object.getPrototypeOf(Colony.prototype), 'assign', this).call(this, objArray, coords);

      return true;
    }
  }, {
    key: 'getInterfaceHtml',
    value: function getInterfaceHtml() {
      var html = '\n      <p>' + this.name + ' : ' + this.type + '</p>\n      <ul class="actions">\n        <p>Actions</p>\n        <li><a href="#" onclick="window.game.removeBuilding(\'' + this.name + '\');">Destroy</a></li>\n        <li><a href="#" onclick="window.game.queueUnit(\'cube\', \'' + this.name + '\')">Queue Unit: Cube</a></li>\n      </ul>\n      <ul class="research">\n        <p>Tech Research</p>\n        <li><a href="#" onclick="alert(\'game\');">Tech 1</a></li>\n        <li><a href="#" onclick="alert(\'game\');">Tech 2</a></li>\n        <li><a href="#" onclick="alert(\'game\');">Tech 3</a></li>\n        <li><a href="#" onclick="alert(\'game\');">Tech 4</a></li>\n      </ul>\n      <ul class="queuedUnits">\n      </ul>\n    ';

      return html;
    }
  }]);

  return Colony;
}(Building);

module.exports = Colony;
//# sourceMappingURL=Colony.js.map