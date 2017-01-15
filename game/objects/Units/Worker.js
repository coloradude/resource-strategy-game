/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Cube = require('../Cube.js');

class Worker extends Cube {
  constructor(game, size, model = './build/output/assets/models/inset-cube.dae') {
    super(game, size, model);
  }
}
