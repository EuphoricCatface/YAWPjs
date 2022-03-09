function GameManager(size, actuator) {
    this.size = size;
    this.actuator = actuator;

    this.grid = new Grid(this.size);

    this.setup();
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
    r = Math.floor(Math.random() * 26);
    char = String.fromCharCode("a".charCodeAt(0) + r);
    if (char == "q")
        char = "qu";
    return char;
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
