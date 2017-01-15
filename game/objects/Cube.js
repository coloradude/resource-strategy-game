/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const Model = require('./Model.js');

class Cube extends Model {
  constructor(
    game,
    size,
    model = './build/output/assets/models/inset-cube.dae'
  ){

    super(game, model, size);

    this.model = model;

    this.type = "cube";
    this.speed = 25;
    this.growSpeed = 100;

    // distance can collect from resource within
    this.resourceCollectionRange = new THREE.Vector3(25, 25, 25);
    this.resourceCollectionRate = 0.1;

    this.destinationSize = null;
    this.growthTolerance = 5;
    this.growthScalar = 0.0001; // scalar that determines growth speed
    this.minSize = new THREE.Vector3(100, 100, 100);

    this.buildRange = new THREE.Vector3(25, 25, 25); // distance can build within
    this.buildSpeed = 1; // scalar for amount to build
    this.buildStep = 1; // amount to build per step

    this.movementTolerance = new THREE.Vector3(1, 1, 1);

    this.growthVelocity = new THREE.Vector3(1, 1, 1);

    this.innerCubeColor = 0x8E1111;
    this.outerCubeColor = 0x666666;
    this.selectedColor = 0xFFFFFF;
    this.unselectedColor = this.innerCubeColor

  }

  update() {
    if(this.isLoaded) {
      this.growTowardDestinationSize(this.destinationSize);
      this.doJob(this.getHighestPriorityJob());
    }
    super.update();
  }

  /*
    Function run one time once model has loaded
  */
  onModelLoad() {
    this.meshes = this.children[0].children[0].children;

    this.outerCubeMeshOutside = this.meshes[0];
    this.outerCubeMeshInside = this.meshes[1];

    this.innerCubeMesh = this.meshes[2];

    this.setInnerCubeColor(this.innerCubeColor);
    this.setOuterCubeColor(this.outerCubeColor);

    super.onModelLoad();
  }

  doJob(job) {
    let box;
    switch(job.job) {
      case 'idle':
        this.idle();
        break;
      case 'build':
        // create boundingBox for target building
        box = new THREE.Box3().setFromObject(job.building);

        // move til close enough, then do job
        if( this.boundingBox.expandByVector(this.buildRange).intersectsBox(box) ) {
          this.setDestination(this.position);
          this.build(job);
        } else {
          this.setDestination(new THREE.Vector3(
            job.building.position.x + job.building.size.x/2,
            job.building.position.y + job.building.size.y/2,
            0
          ));
        }
        break;
      case 'collectResource':
        // create boundingBox for target
        box = new THREE.Box3().setFromObject(job.resourceNode);

        // move til close enough, then do job
        if(this.boundingBox.expandByVector(this.resourceCollectionRange).intersectsBox(box)) {
          this.setDestination(this.position);
          this.collectResource(job.resourceNode);
        } else {
          this.setDestination(new THREE.Vector3(
            job.resourceNode.position.x + job.resourceNode.size.x/2,
            job.resourceNode.position.y + job.resourceNode.size.y/2,
            0
          ));
        }
        break;
      case 'move':
        // move til close enough, then cancel job
        if( this.boundingBox.expandByVector(this.movementTolerance).containsPoint(job.coordinates) ) {
          this.setDestination(this.position);
          this.removeJob(job);
        } else {
          this.setDestination(job.coordinates);
        }
        break;
      default:
        console.error(`unrecognized job ${job.job}`);
        break;
    }
  }

  collectResource(resourceNode) {
    if(resourceNode !== null) {

      // add resources
      let resourceAmountGained = resourceNode.collectionSpeed * this.resourceCollectionRate;

      window.game.player.resources[resourceNode.resourceType] += resourceAmountGained;
    } else {
      console.error(`collectResource encountered null resourceNode`);
    }
  }

  /*
    Automatically removes itself on completion
    Pauses building if resources insufficient
  */
  build(job) {
    let canBuild = true;
    let buildAmt = this.buildSpeed * 1;
    let buildCost = job.building.buildCost.map((resource) => {
      return {
        // charge (buildAmt * 1%) of resource
        type: resource.type,
        amt: resource.amt * (buildAmt/100)
      };
    });

    // determine if player has sufficient resources
    for(let i in buildCost) {
      if(buildCost[i].amt > window.game.player.resources[buildCost[i].type]) {
        // insufficient resources, pause build & break
        canBuild = false;
        break;
      }
    }

    if(canBuild) {
      // increase building completion & charge player resource cost
      let completion = job.building.build(buildAmt);

      if(completion >= 100) {
        // build complete
        this.removeJob(job);
      } else {
        // build still to go

        // charge player resources
        for(let i in buildCost) {
            window.game.player.resources[buildCost[i].type] -= buildCost[i].amt;
        }
      }
    } else {
      // player doesn't have enough resources; wait til they do before building
    }
  }

  setDestination(coords) {
    this.destination = coords;
  }

  removeJob(job) {
    // process job removal
    switch(job.job) {
      case 'idle':
        // do nothing, idle not removable
        return;
      case undefined:
        console.error(`job.job undefined- did you mean to pass a job obj?`);
        break;
      default:
        // remove job from queue
        this.queue = this.queue.filter((obj) => {
          return obj.job !== job.job;
        });
        break;
    }
  }

  /*
    Called once (externally) when assigning new job
  */
  queueJob(job) {
    // reset pathfinding momentum
    this.momentum = new THREE.Vector3(0, 0, 0);

    // apply default job priority if undefined
    if(job.priority === undefined) {
        job.priority = this.jobPriorities[job.job];
    }

    // process job addition
    switch(job.job) {
      case 'move':
        for(let i in this.queue) {
          if(
            this.queue[i].job === 'move'
          ) {
            // at most 1 move instr, queuing updates existing job
            this.queue[i].coordinates = job.coordinates;
            return;
          } else if (
            // new move job destroys existing build, collectResource jobs
            this.queue[i].job == 'build' ||
            this.queue[i].job == 'collectResource'
          ) {
            // cancel any existing build, collectResource jobs
            this.removeJob(this.queue[i]);
          }
        }
        this.queue.push(job);
        break;
      case 'idle':
        // already the default, no need to queue
        break;
      case 'grow':
        // happens async, no need to queue
        this.grow(job.size);
        break;
      case 'shrink':
        // happens async, no need to queue
        this.shrink(job.size);
        break;
      case 'collectResource':
        for(let i in this.queue) {
          if(this.queue[i].job == 'collectResource') {
            // update current collectResource job
            this.queue[i] = job;
            return;
          } else if (this.queue[i].job == 'move' || this.queue[i].job == 'build') {
            // cancel any existing move and build jobs
            this.removeJob(this.queue[i]);
          }
        }
        this.queue.push(job);
        break;
      case 'build':
        for(let i in this.queue) {
          if(
            this.queue[i].building == job.building
          ) {
            // don't queue build jobs on same building
            return;
          } else if (
            this.queue[i].job == 'move' ||
            this.queue[i].job == 'build' ||
            this.queue[i].job == 'collectResource'
          ) {
            // cancel any existing move, build, collectResource jobs
            this.removeJob(this.queue[i]);
          }
        }
        this.queue.push(job);
        break;
      default:
        console.error(`unrecognized job ${job.job}`);
        break;
    }
  }

  idle() {
    // do nothing
  }

  /*
    @size Vector3(x to add, y to add, z to add)
  */
  grow(size) {
    let currentSize = this.getSize();

    this.destinationSize = new THREE.Vector3(
      currentSize.x + size.x,
      currentSize.y + size.y,
      currentSize.z + size.z
    );
  }

  /*
    @size Vector3(x to add, y to add, z to add)
  */
  shrink(size) {
    let currentSize = this.getSize();

    this.destinationSize = new THREE.Vector3(
      Math.max(currentSize.x - size.x, this.minSize.x),
      Math.max(currentSize.y - size.y, this.minSize.y),
      Math.max(currentSize.z - size.z, this.minSize.z)
    );
  }

  getHighestPriorityJob() {
    let priority = 0,
        highestPriorityJob;

    for(let i in this.queue) {
      if( this.queue[i].priority > priority ) {
        highestPriorityJob = this.queue[i];
      }
    }

    return highestPriorityJob;
  }

  getClosestResourceNode() {
    // find & process all resource nodes
    let sceneObject;
    let resourceNodes = window.game.resourceNodes.map((sceneObject) => {
      sceneObject.distance = this.getDistanceFrom(sceneObject);
      return sceneObject;
    });

    // find closest resource node
    if(resourceNodes.length > 0) {
      let minDistanceNode = resourceNodes[0];
      for(let i in resourceNodes) {
        if(resourceNodes[i].distance < minDistanceNode.distance) {
          minDistanceNode = resourceNodes[i];
        }
      }

      return minDistanceNode;
    } else {
      // there are no available resource nodes
      return null;
    }
  }

  growTowardDestinationSize(size) {
    if(size !== null) {
      let mySize = this.getSize();
      let difX = size.x - mySize.x;
      let difY = size.y - mySize.y;
      let difZ = size.z - mySize.z;

      // only grow if farther than
      let tolerance = this.growthTolerance;
      if(Math.abs(difX) > tolerance || Math.abs(difY) > tolerance || Math.abs(difZ) > tolerance) {
        // grow
        this.scale.set(
          Math.max(this.scale.x + (this.growthScalar * difX), 0),
          Math.max(this.scale.y + (this.growthScalar * difY), 0),
          Math.max(this.scale.z + (this.growthScalar * difZ), 0)
        );
      }

      this.size = this.getSize();
    }
  }

  select(selected = true) {
    if(selected) {
      this.setInnerCubeColor(this.selectedColor);
    } else {
      this.setInnerCubeColor(this.unselectedColor);
    }
  }

  setInnerCubeColor(color) {
    this.innerCubeMesh.material = new THREE.MeshLambertMaterial({
      color: color
    });
    this.innerCubeMesh.material.needsUpdate = true;
    this.innerCubeColor = color;
  }

  setOuterCubeColor(color) {
    this.outerCubeMeshOutside.material = new THREE.MeshLambertMaterial({
      color: color
    });

    this.outerCubeMeshInside.material = new THREE.MeshLambertMaterial({
      color: Math.min(0, Math.max(color, 0xFFFFFF))
    });

    this.outerCubeMeshOutside.material.needsUpdate = true;
    this.outerCubeMeshInside.material.needsUpdate = true;

    this.outerCubeColor = color;
  }

}

module.exports = Cube;
