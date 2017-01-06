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
    model = './build/output/assets/models/inset-cube.dae',
    size = new THREE.Vector3(100, 100, 100)
  ){

    super(game, model, size);

    this.model = model;

    this.type = "cube";
    this.speed = 25;
    this.growSpeed = 100;

    // distance can collect from resource within
    this.resourceCollectionRange = new THREE.Vector3(size.x, size.y, size.z);
    this.resourceCollectionRate = 0.1;

    this.destinationSize = null;
    this.growthTolerance = 5;
    this.growthScalar = 0.0001; // scalar that determines growth speed
    this.minSize = new THREE.Vector3(100, 100, 100);

    this.buildRange = new THREE.Vector3(size.x, size.y, size.z); // distance can build within
    this.buildSpeed = 1; // scalar for amount to build
    this.buildStep = 1; // amount to build per step

    this.movementTolerance = new THREE.Vector3(0, 0, 0);

    this.growthVelocity = new THREE.Vector3(1, 1, 1);

    this.innerCubeColor = 0x8E1111;
    this.outerCubeColor = 0x666666;
    this.selectedColor = 0xFFFFFF;
    this.unselectedColor = this.innerCubeColor;

    this.jobPriorities = {
      'move': 8,
      'build': 6,
      'collectResource': 5,
      'goToClosestResourceNode': 2,
      'idle': 1
    };

     // priority queue of jobs
    this.queue = [{
      job: 'idle',
      priority: 1
    }];

  }

  update() {
    if(this.isLoaded) {
      this.growTowardDestinationSize(this.destinationSize);
      this.doJob(this.getHighestPriorityJob());
    }
    super.update();
  }

  onModelLoad() {
    this.meshes = this.children[0].children[0].children;

    this.outerCubeMeshOutside = this.meshes[0];
    this.outerCubeMeshInside = this.meshes[1];

    this.innerCubeMesh = this.meshes[2];

    this.setInnerCubeColor(this.innerCubeColor);
    this.setOuterCubeColor(this.outerCubeColor);

    this.resourceCollectionRange = new THREE.Vector3(this.size.x, this.size.y, this.size.z);

    super.onModelLoad();
  }

  doJob(job) {
    switch(job.job) {
      case 'idle':
        this.idle();
        break;
      case 'build':
        // move til close enough, then do job
        if(this.getDistanceFrom(job.building) < this.buildRange) {
          this.build(job);
        } else {
          this.setDestination(job.building.position);
        }
        break;
      case 'collectResource':
        // move til close enough, then do job
        if(
          Math.abs(job.resourceNode.position.x - this.position.x) <= this.resourceCollectionRange.x &&
          Math.abs(job.resourceNode.position.y - this.position.y) <= this.resourceCollectionRange.y &&
          Math.abs(job.resourceNode.position.z - this.position.z) <= this.resourceCollectionRange.z
        ) {
          this.collectResource(job.resourceNode);
        } else {
          this.setDestination(job.resourceNode.position);
        }
        break;
      case 'move':
        // move til close enough, then cancel job
        if(
          Math.abs(job.coordinates.x - this.position.x) > this.movementTolerance.x ||
          Math.abs(job.coordinates.y - this.position.y) > this.movementTolerance.y ||
          Math.abs(job.coordinates.z - this.position.z) > this.movementTolerance.z
        ) {
          this.setDestination(job.coordinates);
        } else {
          this.removeJob(job);
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

  /*
    Called once (externally) when assigning new job
  */
  queueJob(job) {

    if(job.priority === undefined) {
        job.priority = this.jobPriorities[job.job];
    }

    // process job
    switch(job.job) {
      case 'move':
        for(let i in this.queue) {
          // at most 1 move instr, queuing updates existing job
          if(this.queue[i].job === 'move') {
            this.queue[i].coordinates = job.coordinates;
          } else if(this.queue[i].job == 'build' || this.queue[i].job == 'collectResource') {
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
          if(this.queue[i].building == job.building) {
            // don't queue build jobs on same building
            return;
          } else if (this.queue[i].job == 'move' || this.queue[i].job == 'build' || this.queue[i].job == 'collectResource') {
            // cancel any existing move and build jobs
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
        for(let i in this.queue) {
          if(this.queue[i].job == job.job) {
            this.queue.splice(i, 1);
          }
        }
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
      if(this.queue[i].priority > priority) {
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
