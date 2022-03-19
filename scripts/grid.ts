'use strict';

class Grid {
    size: number;
    cells: Tile[][];
    constructor(size: number) {
        this.size = size;
        this.cells = [];
        this.build();
    }
    // Columns don't interact between each other. Let's treat each column as a list
    // The first column is on the left, and the first element is at the bottom
    build() {
        for (var x = 0; x < this.size; x++) {
            this.cells[x] = [];
            for (var y = 0; y < this.size; y++) {
                this.cells[x].push(
                    null
                );
            }
        }
    }
    getColumnsEmpty() {
        var columnsEmpty = [];
        this.cells.forEach((column, x) => {
            columnsEmpty.push(0);
            column.forEach(element => {
                if (element == null)
                    columnsEmpty[x]++;
            });
        });
        return columnsEmpty;
    }
    getColumnsLength() {
        var columnsLength = [];
        this.cells.forEach((column, x) => {
            columnsLength.push(column.length);
        });
        return columnsLength;
    }
    getTileRef(pos: CoordType) { // probably shallow copy
        return this.cells[pos.x][pos.y]
    }
    /*
    getTile(pos: CoordType) {
        
    }
    setTile(pos: CoordType, tile: Tile) {
        this.cells[pos.x][pos.y]
    }
    */
    tileAppend(column: number, tile: Tile) {
        this.cells[column].push(tile);
    }
    eliminateEmpty() {
        this.cells.forEach(function (column) {
            while (true) {
                var deleteIndex = column.findIndex(
                    element => element == null
                );
                if (deleteIndex == -1)
                    return;
                column.splice(deleteIndex, 1);
            }
        });
        this.cellCoordRefresh();
    }
    cellCoordRefresh() {
        this.cells.forEach((columns, x) => {
            columns.forEach((element, y) => {
                // save previous positions for actuator animation
                var newpos = { x: x, y: y };
                var oldpos = Object.assign({}, element.pos);
                // ES6 shallow copy
                element.prevPos = oldpos;
                element.pos = newpos;
            });
        });
    }
    coordDelete(position: CoordType) {
        this.cells[position.x][position.y] = null;
    }
}







