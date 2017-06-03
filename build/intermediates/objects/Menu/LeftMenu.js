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
var Menu = require('./Menu.js');

var LeftMenu = function (_Menu) {
  _inherits(LeftMenu, _Menu);

  function LeftMenu(game) {
    _classCallCheck(this, LeftMenu);

    var _this = _possibleConstructorReturn(this, (LeftMenu.__proto__ || Object.getPrototypeOf(LeftMenu)).call(this, game, 'leftMenu'));

    _this.buttons = [{
      name: 'addCube',
      function: _this.game.addUnit
    }, {
      name: 'addRandomCubes',
      function: _this.game.addRandomCubes,
      args: [10]
    }, {
      name: 'removeAllCubes',
      function: _this.game.removeAllCubes
    }, {
      name: 'removeSelectedCubes',
      function: _this.game.removeSelectedCubes
    }, {
      name: 'listAllCubes',
      function: _this.game.listAllCubes
    }, {
      name: 'listAllBuildings',
      function: _this.game.listAllBuildings
    }, {
      name: 'resetScore',
      function: _this.game.resetScore
    }, {
      name: 'resetResources',
      function: _this.game.resetResources
    }, {
      name: 'listSelectedUnits',
      function: _this.game.listSelectedUnits
    }, {
      name: 'toolToAddRandomNode',
      function: _this.game.setRightTool,
      args: ['createRandomNode']
    }, {
      name: 'toolToAddGold',
      function: _this.game.setRightTool,
      args: ['createResourceNode', [undefined, new THREE.Vector3(50, 50, 10), 'gold']]
    }, {
      name: 'toolToAddFood',
      function: _this.game.setRightTool,
      args: ['createResourceNode', [undefined, new THREE.Vector3(50, 50, 10), 'food']]
    }, {
      name: 'toolToAddMetal',
      function: _this.game.setRightTool,
      args: ['createResourceNode', [undefined, new THREE.Vector3(50, 50, 10), 'metal']]
    }, {
      name: 'toolToAddBuilding',
      function: _this.game.setRightTool,
      args: ['createBuilding']
    }, {
      name: 'toolToAddSmCube',
      function: _this.game.setRightTool,
      args: ['createCube', [undefined, new THREE.Vector3(100, 100, 100), undefined]]
    }, {
      name: 'toolToAddMdCube',
      function: _this.game.setRightTool,
      args: [
      // tool type
      'createCube', [
      // addCube(args)
      undefined, new THREE.Vector3(250, 250, 250), undefined]]
    }, {
      name: 'toolToAddLgCube',
      function: _this.game.setRightTool,
      args: [
      // tool type
      'createCube', [
      // addCube(args)
      undefined, new THREE.Vector3(500, 500, 500), undefined]]
    }, {
      name: 'toolToBuildBuilding',
      function: _this.game.setRightTool,
      args: ['buildBuilding']
    }];

    _this.assignElements();
    _this.assignClickListeners();
    return _this;
  }

  _createClass(LeftMenu, [{
    key: 'assignElements',
    value: function assignElements() {
      for (var i in this.buttons) {
        this.buttons[i].element = window.document.getElementById('menu-' + this.buttons[i].name);
      }
    }
  }, {
    key: 'assignClickListeners',
    value: function assignClickListeners() {
      var _this2 = this;

      this.element.addEventListener('click', function (event) {
        // if the id matches one in this.buttons, call that button's function with its args
        for (var i in _this2.buttons) {
          if (event.path[0].id === 'menu-' + _this2.buttons[i].name) {
            _this2.buttons[i].function.apply(_this2.game, _this2.buttons[i].args);
          }
        }
        // don't let click event bubble to game
      }, true);
    }
  }, {
    key: 'updateFood',
    value: function updateFood(food) {
      window.document.getElementById('player-food').innerHTML = parseInt(food);
    }
  }, {
    key: 'updateGold',
    value: function updateGold(gold) {
      window.document.getElementById('player-gold').innerHTML = parseInt(gold);
    }
  }, {
    key: 'updateMetal',
    value: function updateMetal(metal) {
      window.document.getElementById('player-metal').innerHTML = parseInt(metal);
    }
  }, {
    key: 'updateScore',
    value: function updateScore(score) {
      window.document.getElementById('player-score').innerHTML = parseInt(score);
    }
  }]);

  return LeftMenu;
}(Menu);

module.exports = LeftMenu;
//# sourceMappingURL=LeftMenu.js.map