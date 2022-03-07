function GameManager(size, actuator) {
    this.size = size;
    this.actuator = actuator;

    this.grid = [];

    this.setup();
}

// Set up the game
GameManager.prototype.setup = function() {
    this.buildGrid();
    // this.addStartTiles();

    this.update();
}

GameManager.prototype.buildGrid = function () {
    console.log("buildGrid: Dummy")
    for (var x = 0; x < this.size; x++) {
        this.grid[x] = [];
        for (var y = 0; y < this.size; y++) {
            this.grid[x].push(new Tile([x, y], x * y));
        }
    }
}

GameManager.prototype.getColumnsEmpty = function () {
    console.log("getColumnsEmpty: DUMMY");
    return [5, 5, 5, 5, 5]
}

GameManager.prototype.tileAppend = function (column, tile) {
    this.grid[column].push(tile)
}

GameManager.prototype.eliminateEmpty = function () {
    console.log("eliminateEmpty: DUMMY");
}

// Will evolve into pureRandom, and then into weightedRandom.
GameManager.prototype.dummyRandom = function() {
    console.log("dummyRandom: DUMMY");
    return "a";
}

GameManager.prototype.fill_prepare = function() {
    columnsEmpty = this.grid.getColumnsEmpty()
    for (var x = 0; x < this.size; x++) {
        for (var e = 0; e < columnsEmpty[x]; e++){
            this.grid.tileAppend(
                x, 
                new Tile(
                    [x, this.size + e], 
                    this.dummyRandom()
                )
            )
        }
    }
    this.update()
}

GameManager.prototype.update = function() {
    this.actuator.update(this.grid);
}

GameManager.prototype.squash = function (direction) {
    this.grid.eliminateEmpty()
    this.update();
}

