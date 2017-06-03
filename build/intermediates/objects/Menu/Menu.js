'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
jshint
node: true,
esversion: 6,
browser: true
*/

var Menu = function () {
  function Menu(game) {
    var id = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'menu';

    _classCallCheck(this, Menu);

    this.element = window.document.getElementById(id);
    this.game = game;

    this.buttons = [];

    this.captureMouseEvents(true);
  }

  _createClass(Menu, [{
    key: 'captureMouseEvents',
    value: function captureMouseEvents() {
      var capture = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

      // don't let click event bubble to game
      this.element.addEventListener('click', function (event) {}, true);

      // don't let mouseMove bubble to game
      this.element.addEventListener('mousemove', function (event) {}, true);

      // don't let mouseUp bubble to game
      this.element.addEventListener('mouseup', function (event) {}, true);

      // don't let mouseUp bubble to game
      this.element.addEventListener('mousedown', function (event) {}, true);
    }
  }]);

  return Menu;
}();

module.exports = Menu;
//# sourceMappingURL=Menu.js.map