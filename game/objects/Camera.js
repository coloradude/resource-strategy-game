/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');

class Camera extends THREE.PerspectiveCamera {
  constructor(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM, CAMERA_START_X, CAMERA_START_Y, CAMERA_START_Z, MAPWIDTH, MAPLENGTH, MAXZOOM, MINZOOM) {
    super(FOV, ASPECT, NEARFRUSTRAM, FAFRUSTRAM);

    this.position.x = CAMERA_START_X;
    this.position.y = CAMERA_START_Y;
    this.position.z = CAMERA_START_Z;

    this.aspect = ASPECT;
    this.mapWidth = MAPWIDTH;
    this.mapLength = MAPLENGTH;
    this.maxZoom = MAXZOOM;
    this.minZoom = MINZOOM;
  }

  moveTo(coords) {
    // limit movement to within game bounds
    coords.x = Math.min(coords.x, this.mapWidth);
    coords.x = Math.max(coords.x, 0);
    coords.y = Math.min(coords.y, this.mapLength);
    coords.y = Math.max(coords.y, 0);
    coords.z = Math.min(coords.z, this.maxZoom);
    coords.z = Math.max(coords.z, this.minZoom);

    this.position.set(coords.x, coords.y, coords.z);
  }
}

module.exports = Camera;
