/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const SceneObject = require('./SceneObject.js');

class Ground extends SceneObject {
  constructor(width, length) {
    let geometry = new THREE.PlaneBufferGeometry(width, length, 1, 1);
    let loader = new THREE.TextureLoader();
    let texture = loader.load('./build/output/assets/sand.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat = new THREE.Vector2(5, 5);
    let material = new THREE.MeshBasicMaterial({
      map: texture
    });

    super(geometry, material);
  }

  assign(objArray, coords) {
    for(let i in objArray) {
      objArray[i].queueJob({
        job: 'move',
        coordinates: new THREE.Vector3(coords.x, coords.y, coords.z)
      });
    }

    return true;
  }
}

module.exports = Ground;
