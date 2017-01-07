/*
jshint
node: true,
esversion: 6,
browser: true
*/

const GameSettings = {
    "mine": {
      "name": "mine",
      "type": "mine",
      "expiration": "null",
      "collectionSpeed": 0.5,
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
      "model": "./build/output/assets/models/orange-mine.dae",
      "completeColor": 0xCCCC00,
      "incompleteColor": 0x555500,
      "defaultSize": {
        "x": 1000,
        "y": 1000,
        "z": 100
      },
      "buildingHasNotBegunTexture": "./build/output/assets/textures/Granite_Dark_Gray.jpg",
      "buildingInProgressTexture": "./build/output/assets/textures/Stone_Marble.jpg",
      "buildingCompleteTexture": "./build/output/assets/textures/Stone_Marble.jpg"
    }
};

module.exports = GameSettings;
