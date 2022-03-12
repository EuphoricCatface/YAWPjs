'use strict';
/* global Grid, Tile: true */

function GameManager(size, actuator) {
    this.size = size;
    this.actuator = actuator;

    this.grid = new Grid(this.size);

    // Allow drop on game-container, not just Tile
    var gameContainer = document.getElementsByClassName("game-container")[0];
    gameContainer.setAttribute("draggable", true);
    gameContainer.addEventListener("dragover",Tile.dragover_handler);
    gameContainer.addEventListener("drop",Tile.drop_handler);

    this.setup();
    Tile.on("finishSelect", this.input.bind(this));
}

// Set up the game
GameManager.prototype.setup = function() {
    this.fill_prepare();
    this.squash();

    this.actuate();
};

// Will evolve into weightedRandom.
GameManager.prototype.pureRandom = function() {
    console.log("pureRandom: WeightedRandom NYI");
    var r = Math.floor(Math.random() * 26);
    var char = String.fromCharCode("a".charCodeAt(0) + r);
    if (char == "q")
        char = "qu";
    return char;
};

GameManager.prototype.fill_prepare = function() {
    var columnsEmpty = this.grid.getColumnsEmpty();
    for (var x = 0; x < this.size; x++) {
        for (var e = 0; e < columnsEmpty[x]; e++){
            this.grid.tileAppend(
                x, 
                new Tile({
                        x: x,
                        y: this.size + e
                    },
                    this.pureRandom()
                )
            );
        }
    }
};

GameManager.prototype.actuate = function() {
    this.actuator.actuate(this.grid);
};

GameManager.prototype.squash = function (direction) {
    this.grid.eliminateEmpty();
};

GameManager.prototype.input = function (inputData) {
    // inputData: tiles, elements, word
    if (!this.verify(inputData.word))
        return;

    inputData.elements.forEach(element => {
        element.remove();
    });
    inputData.tiles.forEach(element => {
        this.grid.coordDelete({
            x: element.pos.x,
            y: element.pos.y
        });
    });

    this.fill_prepare();
    this.squash();
    this.actuate();
};

GameManager.prototype.verify = function (word) {
    console.log("DUMMY: GM.verify");
    console.log(word);

    return true;
};
