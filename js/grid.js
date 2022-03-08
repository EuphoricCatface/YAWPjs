function Grid(size) {
    this.size = size;

    this.cells = [];
    
    this.build();
}

Grid.prototype.build = function () {
    console.log("buildGrid: Dummy")
    for (var x = 0; x < this.size; x++) {
        this.cells[x] = [];
        for (var y = 0; y < this.size; y++) {
            this.cells[x].push(new Tile([x, y], x * y));
        }
    }
}

Grid.prototype.getColumnsEmpty = function () {
    console.log("getColumnsEmpty: DUMMY");
    return [5, 5, 5, 5, 5]
}

Grid.prototype.tileAppend = function (column, tile) {
    this.cells[column].push(tile)
}

Grid.prototype.eliminateEmpty = function () {
    console.log("eliminateEmpty: DUMMY");
}

