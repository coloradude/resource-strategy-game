/*
jshint
node: true,
esversion: 6,
browser: true
*/

class Menu {
  constructor(game, id = 'menu') {
    this.element = window.document.getElementById(id);
    this.game = game;

    this.buttons = [];

    this.captureMouseEvents(true);
  }

  captureMouseEvents(capture = true) {
    // don't let click event bubble to game
    this.element.addEventListener('click', (event) => {
    }, true);

    // don't let mouseMove bubble to game
    this.element.addEventListener('mousemove', (event) => {
    }, true);

    // don't let mouseUp bubble to game
    this.element.addEventListener('mouseup', (event) => {
    }, true);

    // don't let mouseUp bubble to game
    this.element.addEventListener('mousedown', (event) => {
    }, true);
  }
}

module.exports = Menu;
