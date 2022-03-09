function GameManager(size, actuator) {
    this.size = size;
    this.actuator = actuator;

    this.grid = new Grid(this.size);

    this.setup();
}

// Set up the game
GameManager.prototype.setup = function() {
    // this.addStartTiles();

    this.actuate();
};

// Will evolve into pureRandom, and then into weightedRandom.
GameManager.prototype.dummyRandom = function() {
    console.log("dummyRandom: DUMMY");
    return "a";
};

GameManager.prototype.fill_prepare = function() {
    columnsEmpty = this.grid.getColumnsEmpty();
    for (var x = 0; x < this.size; x++) {
        for (var e = 0; e < columnsEmpty[x]; e++){
            this.grid.tileAppend(
                x, 
                new Tile(
                    position = {
                        x: x,
                        y: this.size + e
                    },
                    this.dummyRandom()
                )
            );
        }
    }
    this.actuate();
};

GameManager.prototype.actuate = function() {
    this.actuator.actuate(this.grid);
};

GameManager.prototype.squash = function (direction) {
    this.grid.eliminateEmpty();
    this.actuate();
};

