/*
jshint
esversion: 6,
browser: true
*/

const Game = require("./game.js");

window.onload = () => {
    'use strict';
    window.game = new Game();

    game.render();
};
