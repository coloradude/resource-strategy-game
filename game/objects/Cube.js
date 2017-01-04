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
    let geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    let material = new THREE.MeshLambertMaterial({
      color: 0xCC0000
    });

    super(geometry, material);

    this.type = "Cube";
    this.speed = 25;
    this.resourceCollectionRange = 100;
    this.resourceCollectionRate = 0.1;

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
    this.closestResourceNode = this.getClosestResourceNode();
    this.calculateResourcePoints();

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
        // already the default, no need to add

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
    // this.velocity = new THREE.Vector3(0, 0, 0);
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

    // move toward closest resource node
    if(resourceNodes.length > 0) {
      let minDistanceNode = resourceNodes[0];
      for(let i in resourceNodes) {
        if(resourceNodes[i].distance < minDistanceNode.distance) {
          minDistanceNode = resourceNodes[i];
        }
      }

      return minDistanceNode;
    } else {
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

}

module.exports = Cube;
