/*
jshint
node: true,
esversion: 6,
browser: true
*/

class Menu {
  constructor(game) {
    this.element = window.document.getElementById('menu');
    this.game = game;
    this.assignElements();
    this.assignClickListeners();
  }

  assignElements() {
    this.addUnitButton = window.document.getElementById('menu-addUnit');
    this.addRandomCubesButton = window.document.getElementById('menu-addRandomCubes');
    this.removeAllCubesButton = window.document.getElementById('menu-removeAllCubes');
    this.removeSelectedCubesButton = window.document.getElementById('menu-removeSelectedCubes');
    this.listAllCubesButton = window.document.getElementById('menu-listAllCubes');
    this.resetScoreButton = window.document.getElementById('menu-resetScore');
    this.resetResourcesButton = window.document.getElementById('menu-resetResources');
  }

  assignClickListeners() {
    this.addUnitButton.addEventListener('click', () => {
      this.game.addUnit();
    }, false );

    this.addRandomCubesButton.addEventListener('click', () => {
      this.game.addRandomCubes();
    }, false );

    this.removeAllCubesButton.addEventListener('click', () => {
      this.game.removeAllCubes();
    }, false );

    this.removeSelectedCubesButton.addEventListener('click', () => {
      this.game.removeSelectedCubes();
    }, false );

    this.listAllCubesButton.addEventListener('click', () => {
      this.game.listAllCubes();
    }, false );

    this.resetScoreButton.addEventListener('click', () => {
      this.game.resetScore();
    }, false );

    this.resetResourcesButton.addEventListener('click', () => {
      this.game.resetResources();
    }, false );
  }

  updateFood(food) {
    window.document.getElementById('player-food').innerHTML = parseInt(food);
  }

  updateGold(gold) {
    window.document.getElementById('player-gold').innerHTML = parseInt(gold);
  }

  updateMetal(metal) {
    window.document.getElementById('player-metal').innerHTML = parseInt(metal);
  }

  updateScore(score) {
    window.document.getElementById('player-score').innerHTML = parseInt(score);
  }
}

module.exports = Menu;
