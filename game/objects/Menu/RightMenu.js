/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Menu = require('./Menu.js');

class RightMenu extends Menu {
  constructor(game) {
    super(game, 'rightMenu');

    this.buttons = [{
      name: 'deleteSelected',
      function: this.game.removeSelectedCubes
    }, {
      name: 'listSelected',
      function: this.game.listSelectedUnits,
      args: undefined
    }];

    this.assignElements();
    this.assignClickListeners();
  }

  render() {
    // update # of selected units
    let numSelectedUnits = 0;
    let typeMap = {};
    for(let i in this.game.selectedUnits) {
      numSelectedUnits++;

      let type = this.game.selectedUnits[i].type;

      if(typeMap[type]) {
        typeMap[type]++;
      } else {
        typeMap[type] = 1;
      }
    }

    window.document.getElementById(`numSelectedNum`).innerHTML = numSelectedUnits;

    // build type elements
    let selectedTypes = window.document.getElementById('selectedTypes');
        selectedTypes.innerHTML = '';
    for(let i in typeMap) {
      let elem = window.document.createElement('p');
      elem.innerHTML = `${typeMap[i]} ${i}`;
      selectedTypes.appendChild(elem);
    }
  }

  assignElements() {
    for (let i in this.buttons) {
      this.buttons[i].element = window.document.getElementById(`rightMenu-${this.buttons[i].name}`);
    }
  }

  assignClickListeners() {
    this.element.addEventListener('click', (event) => {
      // if the id matches one in this.buttons, call that button's function with its args
      for (let i in this.buttons) {
        if (event.path[0].id === `rightMenu-${this.buttons[i].name}`) {
          this.buttons[i].function.apply(this.game, this.buttons[i].args);
        }
      }
      // don't let click event bubble to game
    }, true);
  }
}

module.exports = RightMenu;
