function Grid(size) {
    this.size = size;

    this.cells = [];
    
    this.build();
}

// Columns don't interact between each other. Let's treat each column as a list
// The first column is on the left, and the first element is at the bottom
Grid.prototype.build = function () {
    for (var x = 0; x < this.size; x++) {
        this.cells[x] = [];
        for (var y = 0; y < this.size; y++) {
            this.cells[x].push(
                null
            );
        }
    }
};

Grid.prototype.getColumnsEmpty = function () {
    var columnsEmpty = [];
    for (var x = 0; x < this.size; x++) {
        columnsEmpty.push(0);
        this.cells[x].forEach(
            element => {
                if (element == null) columnsEmpty[x]++;
            }
        );
    }
    return columnsEmpty;
};

Grid.prototype.tileAppend = function (column, tile) {
    this.cells[column].push(tile);
};

Grid.prototype.eliminateEmpty = function () {
    this.cells.forEach(function (column){
        while (true) {
            deleteIndex = column.findIndex(
                element => element == null
            );
            if (deleteIndex == -1)
                return;
            column.splice(deleteIndex, 1);
        }
    });
    this.cellCoordRefresh();
};

Grid.prototype.cellCoordRefresh = function () {
    for (var x = 0; x < this.size; x++) {
        column = this.cells[x];
        for (var y = 0; y < column.length; y++) {
            element = column[y];
            element.x = x;
            element.y = y;
        }
    }
};
