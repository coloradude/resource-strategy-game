"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*
jshint
node: true,
esversion: 6,
browser: true
*/

var Player = function Player() {
  _classCallCheck(this, Player);

  this.resources = {
    gold: 0,
    metal: 0,
    food: 0
  };
  this.score = 0;
};

module.exports = Player;
//# sourceMappingURL=Player.js.map