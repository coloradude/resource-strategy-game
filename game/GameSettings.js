/*
jshint
node: true,
esversion: 6,
browser: true
*/

const GameSettings = {
  "base": {
    "name": "base",
    "type": "base",
    "expiration": "null",
    "buildCost": [{
        "type": "metal",
        "amt": 2000
    }, {
        "type": "gold",
        "amt": 1000
    }, {
        "type": "food",
        "amt": 0
    }],
    "model": "./build/output/assets/models/pyramid-building.dae",
    "completeColor": 0x000000,
    "incompleteColor": 0x333333,
    "defaultSize": {
      "x": 500,
      "y": 500,
      "z": 125
    },
    "buildingHasNotBegunTexture": "./build/output/assets/textures/Granite_Dark_Gray.jpg",
    "buildingInProgressTexture": "./build/output/assets/textures/Stone_Marble.jpg",
    "buildingCompleteTexture": "./build/output/assets/textures/Stone_Marble.jpg"
  },
  "mine": {
      "name": "mine",
      "type": "mine",
      "expiration": "null",
      "buildCost": [{
          "type": "metal",
          "amt": 1000
      }, {
          "type": "gold",
          "amt": 200
      }, {
          "type": "food",
          "amt": 0
      }],
      "resourceType": "metal",
      "collectionSpeed": 0.25,
      "model": "./build/output/assets/models/orange-mine.dae",
      "completeColor": 0xCCCC00,
      "incompleteColor": 0x555500,
      "defaultSize": {
        "x": 500,
        "y": 500,
        "z": 125
      },
      "buildingHasNotBegunTexture": "./build/output/assets/textures/Granite_Dark_Gray.jpg",
      "buildingInProgressTexture": "./build/output/assets/textures/Stone_Marble.jpg",
      "buildingCompleteTexture": "./build/output/assets/textures/Stone_Marble.jpg"
    },
    "colony": {
      "name": "colony",
      "type": "colony",
      "expiration": "null",
      "collectionSpeed": 0,
      "buildCost": [{
          "type": "metal",
          "amt": 500
      }, {
          "type": "gold",
          "amt": 500
      }, {
          "type": "food",
          "amt": 500
      }],
      "units": {
        "cube": {
          "buildTime": 100,
          "buildCost": {
            "metal": 0,
            "gold": 0,
            "food": 100
          }
        }
      },
      "model": "./build/output/assets/models/cube-building.dae",
      "completeColor": 0x8E1111,
      "incompleteColor": 0x2E1111,
      "defaultSize": {
        "x": 500,
        "y": 500,
        "z": 125
      },
      "buildingHasNotBegunTexture": "./build/output/assets/textures/Granite_Dark_Gray.jpg",
      "buildingInProgressTexture": "./build/output/assets/textures/Stone_Marble.jpg",
      "buildingCompleteTexture": "./build/output/assets/textures/Stone_Marble.jpg",
      "floorTexture": "./build/output/assets/textures/Stone_Marble.jpg",
      "cubesColor": 0xFF0000
    },
    "resourceNode": {
      "defaultSize": {
        "x": 300,
        "y": 300,
        "z": 100
      }
    },
    "metalResourceNode": {
      "model": "./build/output/assets/models/resource-node.dae",
      "baseColor": "#332706",
      "topColor": "#4f471f"
    },
    "goldResourceNode": {
      "model": "./build/output/assets/models/resource-node.dae",
      "baseColor": "#a37a01",
      "topColor": "#dbab1c"
    },
    "foodResourceNode": {
      "model": "./build/output/assets/models/resource-node.dae",
      "baseColor": "#417c25",
      "topColor": "#329903"
    },
    "cube": {
      "defaultSize": {
        "x": 100,
        "y": 100,
        "z": 50
      }
    }
};

module.exports = GameSettings;
