/*jshint
esversion: 6
*/
import Game from "./game.js";

(()=>{
  'use strict';
  let game = new Game();

  setInterval(() => {
    game.render();
  }, 1000/60);
})();
