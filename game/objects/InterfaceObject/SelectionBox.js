/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const InterfaceObject = require('./InterfaceObject.js');

class SelectionBox extends InterfaceObject {
  constructor() {
    let geometry = new THREE.BoxGeometry(0, 0, 0);
    let material = new THREE.MeshLambertMaterial({
      color: 0xCCCC00,
      transparent: true,
      opacity: 0.5
    });

    super(geometry, material);
    this.name = "selectionBox";
    this.type = "interface";
  }

  startCoordinates(coords) {
    this.startCoordinates = coords;
    this.position.set(
      coords.x + this.size.x/2,
      coords.y + this.size.y/2,
      this.size.z/2
    );
  }

  continueCoordinates(coords = new THREE.Vector3(0, 0, 0)) {
    if(coords !== null) {
      let oldGeometry = this.geometry;

      this.geometry = new THREE.BoxGeometry(
        (this.startCoordinates.x - coords.x),
        (this.startCoordinates.y - coords.y),
        this.size.z
      );

      this.setSize();

      this.position.set(
        Math.min(this.startCoordinates.x, coords.x) + this.size.x/2,
        Math.min(this.startCoordinates.y, coords.y) + this.size.y/2,
        this.size.z/2
      );

      this.currentCoords = coords;
    }
  }

  setSize() {
    this.boundingBox = new THREE.Box3().setFromObject(this);
    this.size.x = this.boundingBox.max.x - this.boundingBox.min.x;
    this.size.y = this.boundingBox.max.y - this.boundingBox.min.y;
    this.size.z = this.boundingBox.max.z - this.boundingBox.min.z;
  }

  getCubesInBox() {
    let cubes = window.game.cubes;
    let cubesInBox = [];

    if(this.currentCoords !== undefined) {
      // determine bottom left (minX, minY)
      let bottomLeft = new THREE.Vector2(
        Math.min(this.startCoordinates.x, this.currentCoords.x),
        Math.min(this.startCoordinates.y, this.currentCoords.y)
      );

      // determine top right (maxX, maxY)
      let topRight = new THREE.Vector2(
        Math.max(this.startCoordinates.x, this.currentCoords.x),
        Math.max(this.startCoordinates.y, this.currentCoords.y)
      );

      for(let i in cubes) {
        if(
          cubes[i].position.x > bottomLeft.x &&
          cubes[i].position.x < topRight.x &&
          cubes[i].position.y > bottomLeft.y &&
          cubes[i].position.y < topRight.y
        ) {
          // add to selection
          cubesInBox.push(cubes[i]);
        }
      }

    }

    return cubesInBox;
  }
}

module.exports = SelectionBox;
