/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Menu = require('./Menu.js');

class LeftMenu extends Menu {
  constructor(game) {
    super(game, 'leftMenu');

    this.buttons = [{
      name: 'addCube',
      function: this.game.addUnit
    }, {
      name: 'addRandomCubes',
      function: this.game.addRandomCubes,
      args: [10]
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
      name: 'listAllBuildings',
      function: this.game.listAllBuildings
    }, {
      name: 'resetScore',
      function: this.game.resetScore
    }, {
      name: 'resetResources',
      function: this.game.resetResources
    }, {
      name: 'listSelectedUnits',
      function: this.game.listSelectedUnits
    }, {
      name: 'toolToAddRandomNode',
      function: this.game.setRightTool,
      args: ['createRandomNode']
    }, {
      name: 'toolToAddGold',
      function: this.game.setRightTool,
      args: [
        'createResourceNode', [
          undefined,
          new THREE.Vector3(50, 50, 10),
          'gold'
        ]
      ]
    }, {
      name: 'toolToAddFood',
      function: this.game.setRightTool,
      args: [
        'createResourceNode', [
          undefined,
          new THREE.Vector3(50, 50, 10),
          'food'
        ]
      ]
    }, {
      name: 'toolToAddMetal',
      function: this.game.setRightTool,
      args: [
        'createResourceNode', [
          undefined,
          new THREE.Vector3(50, 50, 10),
          'metal'
        ]
      ]
    }, {
      name: 'toolToAddBuilding',
      function: this.game.setRightTool,
      args: ['createBuilding']
    }, {
      name: 'toolToAddSmCube',
      function: this.game.setRightTool,
      args: [
        'createCube', [
          undefined,
          new THREE.Vector3(100, 100, 100),
          undefined
        ]
      ]
    }, {
      name: 'toolToAddMdCube',
      function: this.game.setRightTool,
      args: [
        // tool type
        'createCube', [
          // addCube(args)
          undefined,
          new THREE.Vector3(250, 250, 250),
          undefined
        ]
      ]
    }, {
      name: 'toolToAddLgCube',
      function: this.game.setRightTool,
      args: [
        // tool type
        'createCube', [
          // addCube(args)
          undefined,
          new THREE.Vector3(500, 500, 500),
          undefined
        ]
      ]
    }, {
      name: 'toolToBuildBuilding',
      function: this.game.setRightTool,
      args: ['buildBuilding']
    }];

    this.assignElements();
    this.assignClickListeners();
  }

  assignElements() {
    for (let i in this.buttons) {
      this.buttons[i].element = window.document.getElementById(`menu-${this.buttons[i].name}`);
    }
  }

  assignClickListeners() {
    this.element.addEventListener('click', (event) => {
      // if the id matches one in this.buttons, call that button's function with its args
      for (let i in this.buttons) {
        if (event.path[0].id === `menu-${this.buttons[i].name}`) {
          this.buttons[i].function.apply(this.game, this.buttons[i].args);
        }
      }
      // don't let click event bubble to game
    }, true);
  }

  updateFood(food) {
    window.document.getElementById('player-food')
      .innerHTML = parseInt(food);
  }

  updateGold(gold) {
    window.document.getElementById('player-gold')
      .innerHTML = parseInt(gold);
  }

  updateMetal(metal) {
    window.document.getElementById('player-metal')
      .innerHTML = parseInt(metal);
  }

  updateScore(score) {
    window.document.getElementById('player-score')
      .innerHTML = parseInt(score);
  }
}

module.exports = LeftMenu;
