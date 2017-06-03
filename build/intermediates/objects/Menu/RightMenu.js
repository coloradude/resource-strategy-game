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

var RightMenu = function (_Menu) {
  _inherits(RightMenu, _Menu);

  function RightMenu(game) {
    _classCallCheck(this, RightMenu);

    var _this = _possibleConstructorReturn(this, (RightMenu.__proto__ || Object.getPrototypeOf(RightMenu)).call(this, game, 'rightMenu'));

    _this.buttons = [{
      name: 'deleteSelected',
      function: _this.game.removeSelected
    }, {
      name: 'listSelected',
      function: _this.game.listSelectedUnits
    }, {
      name: 'listNearbyUnits',
      function: _this.game.listNearbyToSelectedUnits
    }];

    _this.assignElements();
    _this.assignClickListeners();
    return _this;
  }

  _createClass(RightMenu, [{
    key: 'render',
    value: function render() {
      // update # of selected units
      var numSelectedUnits = 0;
      var typeMap = {};
      var selectedUnitInterfaces = [];
      var parent = window.document.getElementById('selectedUnitInterfaces');

      for (var i in this.game.selectedUnits) {
        var unit = this.game.selectedUnits[i];

        numSelectedUnits++;

        // build selected unit interfaces
        var elem = document.createElement('div');

        elem.innerHTML = unit.getInterfaceHtml();
        elem.setAttribute('data-unitName', unit.name);
        selectedUnitInterfaces.push(elem);

        var type = unit.type;

        // save number of each type for later rendering
        if (typeMap[type]) {
          typeMap[type]++;
        } else {
          typeMap[type] = 1;
        }

        // attach interface or update existing interface
        for (var _i = 0; _i < selectedUnitInterfaces.length; _i++) {
          // update existing if exists
          var existingElem = parent.querySelector('[data-unitName="' + unit.name + '"]');

          if (existingElem) {

            // update any queues on that elem
            var queues = existingElem.querySelectorAll('.queuedUnits');

            for (var _i2 = 0; _i2 < queues.length; _i2++) {
              var timeLeftElem = queues[_i2].querySelector('.timeLeft');
              var timeLeft = unit.getTimeLeftOfQueue(_i2);
              if (timeLeftElem && timeLeft) {
                timeLeftElem.innerHTML = unit.getTimeLeftOfQueue(_i2);
              }
            }

            var queuedUnitsElement = existingElem.querySelector('.queuedUnits');

            if (queuedUnitsElement) {
              queuedUnitsElement.innerHTML = unit.getQueueHTML();
            }
          } else {

            parent.appendChild(elem);
          }
        }
      }

      // remove interfaces of no longer selected units
      var oldMenu = parent.querySelectorAll('*');
      for (var _i3 = 0; _i3 < oldMenu.length; _i3++) {
        // check if it existing in selectedUnits
        var len = this.game.selectedUnits.length;
        var exists = false;
        for (var _i4 = 0; _i4 < len; _i4++) {
          if (oldMenu[_i4].getAttribute('data-unitName') == this.game.selectedUnits[_i4].name) {
            exists = true;
          }
        }
        // if not, remove from DOM
        if (!exists) {
          oldMenu[_i3].remove();
        }
      }

      window.document.getElementById('numSelectedNum').innerHTML = numSelectedUnits;

      // build type elements
      var selectedTypes = window.document.getElementById('selectedTypes');
      selectedTypes.innerHTML = '';
      for (var _i5 in typeMap) {
        var _elem = window.document.createElement('p');
        _elem.innerHTML = typeMap[_i5] + ' ' + _i5;
        selectedTypes.appendChild(_elem);
      }
    }
  }, {
    key: 'assignElements',
    value: function assignElements() {
      for (var i in this.buttons) {
        this.buttons[i].element = window.document.getElementById('rightMenu-' + this.buttons[i].name);
      }
    }
  }, {
    key: 'assignClickListeners',
    value: function assignClickListeners() {
      var _this2 = this;

      this.element.addEventListener('click', function (event) {
        // if the id matches one in this.buttons, call that button's function with its args
        for (var i in _this2.buttons) {
          if (event.path[0].id === 'rightMenu-' + _this2.buttons[i].name) {
            _this2.buttons[i].function.apply(_this2.game, _this2.buttons[i].args);
          }
        }
        // don't let click event bubble to game
      }, true);
    }
  }]);

  return RightMenu;
}(Menu);

module.exports = RightMenu;
//# sourceMappingURL=RightMenu.js.map