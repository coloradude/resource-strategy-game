/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');

class Ground extends THREE.Mesh {
  constructor(game, width, length, heightMap) {

    let widthSegments = 256;
    let lengthSegments = 256;

    let geometry = new THREE.PlaneGeometry(width, length, widthSegments - 1, lengthSegments - 1);

    let loader = new THREE.TextureLoader();

    let texture = loader.load('./build/output/assets/sand.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat = new THREE.Vector2(5, 5);

    let material = new THREE.MeshPhongMaterial({
      map: texture
    });

    super(geometry, material);

    this.castShadow = true;
    this.receiveShadow = true;
    this.heightMapConstant = 10;

    this.position.set(width /2, length / 2, 0);

    this.assignHeightMap(heightMap);

    this.game = game;
    this.name = "ground";
    this.width = width;
    this.length = length;
    this.widthSegments = widthSegments;
    this.lengthSegments = lengthSegments;

    this.game.scene.add(this);
  }

  assignHeightMap(heightMap) {
    /*
      Height z values stored as 8-bit (max 255) value
    */

    // iterate over image data
    for(let i in this.geometry.vertices) {
      this.geometry.vertices[i].z = heightMap[i] * this.heightMapConstant;
    }

    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
  }

  getHeight(x, y) {

    // map (0, 0) starts top left; invert that to query proper vertex
    y = this.length - y;

    // convert world coordinate to vertex coordinate
    let xVertex = (x / (this.width)) * this.widthSegments;
    let yVertex = (y / (this.length)) * this.lengthSegments;

    // convert vertex coordinates to vertex number
    let i = (Math.floor(yVertex) * this.lengthSegments) + Math.floor(xVertex);

    // get height from ground vertices
    let height = this.geometry.vertices[i].z;

    return height;
  }

  assign(objArray, coords) {
    for(let i in objArray) {
      objArray[i].queueJob({
        job: 'move',
        coordinates: new THREE.Vector3(coords.x, coords.y, coords.z)
      });
    }

    return true; // stop bubbling
  }
}

module.exports = Ground;
