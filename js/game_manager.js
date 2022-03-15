'use strict';
/* global Grid, Tile: true */

function GameManager(size, actuator) {
    this.size = size;
    this.actuator = actuator;

    this.grid = new Grid(this.size);

    this.score = 0;

    this.allowDropOnGameContainer();
    this.setup();
    Tile.on("finishSelect", this.input.bind(this));
}

GameManager.prototype.allowDropOnGameContainer = function() {
    var gameContainer = document.getElementsByClassName("game-container")[0];
    // These two are like "static" functions, but changing these to ones cause a problem:
    //      <dragend does not fire if not on an element with proper handlers>
    gameContainer.addEventListener("dragover",Tile.prototype.dragover_handler);
    gameContainer.addEventListener("drop",Tile.prototype.drop_handler);
};

// Set up the game
GameManager.prototype.setup = function() {
    this.fill_prepare();
    this.squash();

    this.actuate();
    const myRequest = new Request('words_alpha.txt');

    fetch(myRequest)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status ${ response.status }`);
            }

            return response.text();
        })
        .then((response) => {
            var match = response.split('\n');
            console.log(match.length);
        });
};

GameManager.prototype.weightedRandom = function() {
    var inverse_frequency_list = [120, 40, 40, 60, 120, 30, 60, 30, 120, 15, 24, 120, 40, 120, 120, 40, 12, 120, 120, 120, 120, 30, 30, 15, 30, 12];
    var inverse_frequency_sum = 1708;

    var rand = Math.floor(Math.random() * (inverse_frequency_sum - 1));
    var result;

    for (var i = 0; i < inverse_frequency_list.length; i++) {
        rand -= inverse_frequency_list[i];
        if (rand < 0) {
            result = i;
            break;
        }
    }
    var char = String.fromCharCode("a".charCodeAt(0) + result);
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
                    this.weightedRandom()
                )
            );
        }
    }
};

GameManager.prototype.actuate = function() {
    this.actuator.actuate(this.grid);
    this.actuator.setScore(this.score);
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
        this.score += this.actuator.letter_score[element.value];
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
    console.log("DUMMY: GM.verify, "+ word);

    return true;
};
