/*
jshint
node: true,
esversion: 6,
browser: true
*/

class Player {
  constructor() {
    this.resources = {
      gold: 0,
      metal: 0,
      food: 0
    };
    this.score = 0;
  }
}

module.exports = Player;
