/*jshint
esversion: 6
*/
import Game from "./game.js";

window.onload = () => {
    'use strict';
    window.game = new Game();

    setInterval(() => {
      game.render();
    }, 1000 / 60);
};
