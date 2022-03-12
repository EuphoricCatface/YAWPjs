'use strict';

function HTMLActuator() {
    this.tileContainer = document.getElementsByClassName("tile-container")[0];
}

HTMLActuator.prototype.actuate = function(grid) {
    var self = this;

    self.clearContainer();

    grid.cells.forEach(function (column) {
        column.forEach(function (cell) {
            if (cell) {
                self.addTile(cell);
            }
        });
    });
};

HTMLActuator.prototype.clearContainer = function() {
    while (this.tileContainer.firstChild) {
        this.tileContainer.removeChild(this.tileContainer.firstChild);
    }
};

HTMLActuator.prototype.addTile = function (tile) {
    var element = document.createElement("div");
    
    var x = tile.pos.x + 1;
    var y = tile.pos.y + 1;
    var position = "tile-position-" + x + "-" + y;

    element.classList.add("tile", "tile-" + tile.value, position);
    element.textContent = tile.value.toUpperCase();
    if (element.textContent == "QU")
        element.textContent = "Qu";
    element.setAttribute("draggable", true);

    this.tileContainer.appendChild(element);
    element.addEventListener("dragstart",tile.dragstart_handler.bind(tile));
    element.addEventListener("dragenter",tile.dragenter_handler.bind(tile));
    // element.addEventListener("dragleave",tile.dragleave_handler.bind(tile));
    element.addEventListener("dragend",tile.dragend_handler.bind(tile));
    element.addEventListener("drop",tile.drop_handler.bind(tile));
};
