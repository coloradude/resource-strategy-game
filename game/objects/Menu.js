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

    this.buttons = [
      {
        name: 'addUnit',
        function: this.game.addUnit
      }, {
        name: 'addRandomCubes',
        function: this.game.addRandomCubes
      }, {
        name: 'removeAllCubes',
        function: this.game.removeAllCubes
      }, {
        name: 'removeSelectedCubes',
        function: this.game.removeSelectedCubes
      }, {
        name: 'listAllCubes',
        function: this.game.listAllCubes
      }, {
        name: 'resetScore',
        function: this.game.resetScore
      }, {
        name: 'resetResources',
        function: this.game.resetResources
      }, {
        name: 'listSelectedUnits',
        function: this.game.listSelectedUnits
      }
    ];

    this.assignElements();
    this.assignClickListeners();
  }

  assignElements() {
    for(let i in this.buttons) {
      this.buttons[i].element = window.document.getElementById(`menu-${this.buttons[i].name}`);
    }
  }

  assignClickListeners() {
    this.element.addEventListener('click', (event) => {

      // if the id matches one in this.buttons, call that button's function
      for(let i in this.buttons) {
        if(event.path[0].id === `menu-${this.buttons[i].name}`) {
          this.buttons[i].function.call(this.game);
        }
      }
    });
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
