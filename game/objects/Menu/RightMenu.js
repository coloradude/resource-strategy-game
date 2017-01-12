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
      function: this.game.listSelectedUnits
    }, {
      name: 'listNearbyUnits',
      function: this.game.listNearbyToSelectedUnits
    }];

    this.assignElements();
    this.assignClickListeners();
  }

  render() {
    // update # of selected units
    let numSelectedUnits = 0;
    let typeMap = {};
    let selectedUnitInterfaces = [];
    let parent = window.document.getElementById('selectedUnitInterfaces');

    for(let i in this.game.selectedUnits) {
      let unit = this.game.selectedUnits[i];

      numSelectedUnits++;

      // build selected unit interfaces
      let elem = document.createElement('div');

      elem.innerHTML = unit.getInterfaceHtml();
      elem.setAttribute('data-unitName', unit.name);
      selectedUnitInterfaces.push(elem);

      let type = unit.type;

      // save number of each type for later rendering
      if(typeMap[type]) {
        typeMap[type]++;
      } else {
        typeMap[type] = 1;
      }

      // attach interface or update existing interface
      for(let i = 0; i < selectedUnitInterfaces.length; i++) {
        // update existing if exists
        let existingElem = parent.querySelector(`[data-unitName="${unit.name}"]`);

        if(existingElem) {

          // update any queues on that elem
          let queues = existingElem.querySelectorAll('.queuedUnits');

          for(let i = 0; i < queues.length; i++) {
            let timeLeftElem = queues[i].querySelector('.timeLeft');
            let timeLeft = unit.getTimeLeftOfQueue(i);
            if(timeLeftElem && timeLeft) {
              timeLeftElem.innerHTML = unit.getTimeLeftOfQueue(i);
            }
          }

          let queuedUnitsElement = existingElem.querySelector('.queuedUnits');

          if(queuedUnitsElement) {
            queuedUnitsElement.innerHTML = unit.getQueueHTML();
          }

        } else {

          parent.appendChild(elem);

        }
      }
    }

    // remove interfaces of no longer selected units
    let oldMenu = parent.querySelectorAll('*');
    for(let i =0; i < oldMenu.length; i++) {
      // check if it existing in selectedUnits
      let len = this.game.selectedUnits.length;
      let exists = false;
      for(let i=0; i < len; i++) {
        if(oldMenu[i].getAttribute('data-unitName') == this.game.selectedUnits[i].name) {
          exists = true;
        }
      }
      // if not, remove from DOM
      if(!exists) {
        oldMenu[i].remove();
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
