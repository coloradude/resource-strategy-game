/*
jshint
node: true,
esversion: 6,
browser: true
*/

const THREE = require('three');
const SceneObject = require('./SceneObject.js');

class Cube extends SceneObject {
  constructor(size) {
    if(!size) {
      // defalt size
      size = new THREE.Vector3(
        100,
        100,
        100
      );
    }
    let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    let material = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });

    super(geometry, material);

    this.type = "Cube";
    this.speed = 25;
    this.growSpeed = 100;
    this.resourceCollectionRange = 100;
    this.resourceCollectionRate = 0.1;
    this.minSize = new THREE.Vector3(100, 100, 100);
    this.growthTolerance = 5;

    this.destinationSize = null;
    this.growthScalar = 0.0001;

    this.growthVelocity = new THREE.Vector3(1, 1, 1);

    this.selectedColor = 0x000000;

    this.jobPriorities = {
      'build': 7,
      'move': 5,
      'goToClosestResourceNode': 4,
      'idle': 1
    };

     // priority queue of jobs
    this.queue = [{
      job: 'idle',
      priority: 1
    }];

  }

  update() {
    this.growTowardDestinationSize(this.destinationSize);
    this.closestResourceNode = this.getClosestResourceNode();
    this.calculateResourcePoints(); // should be optimized to search in radius around me

    this.doJob(this.highestPriorityJob());

    super.update();
  }

  doJob(job) {
    switch(job.job) {
      case 'idle':
        this.idle();
        break;
      case 'move':
        this.move(job.coordinates);
        break;
    }
  }

  move(coords) {
    this.destination = coords;
  }

  stop() {
    this.destination = this.position;
  }

  queueJob(job) {
    // assign job priority
    job.priority = this.jobPriorities[job.job];

    // process job
    switch(job.job) {
      case 'move':
        // at most 1 move instr, queuing updates existing job
        for(let i in this.queue) {
          if(this.queue[i].job === 'move') {
            this.queue[i].coordinates = job.coordinates;
            return;
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
      default:
        console.error(`unrecognized job ${job.job}`);
        break;
    }
  }

  removeJob(job) {
    // process job removal
    switch(job.job) {
      case 'move':
        this.stop();
        break;
      case 'idle':
        // do nothing, idle not removable
        return;
      default:
        console.error(`removeJob failed for urecognized job ${job.job}`);
        break;
    }

    // remove job from queue
    for(let i in this.queue) {
      if(this.queue[i].job == job.job) {
        this.queue.splice(i, 1);
      }
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

  highestPriorityJob() {
    let priority = 0,
        highestPriorityJob;
    for(let i in this.queue) {
      if(this.queue[i].priority > priority) {
        highestPriorityJob = this.queue[i];
      }
    }
    return highestPriorityJob;
  }

  goToClosestResourceNode() {
    this.closestResourceNode = this.getClosestResourceNode();
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

  calculateResourcePoints() {
    // add resource points according to closest resource node

    if(this.closestResourceNode !== null && this.getDistanceFrom(this.closestResourceNode) <= this.resourceCollectionRange) {
      // cancel destination (we're close enough)
      this.destination = null;

      // add resources
      let resourceAmountGained = this.closestResourceNode.collectionSpeed * this.resourceCollectionRate;
      window.game.player.resources[this.closestResourceNode.resourceType] += resourceAmountGained;
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

}

module.exports = Cube;
