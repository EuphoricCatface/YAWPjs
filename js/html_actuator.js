'use strict';

function HTMLActuator() {
    this.tileContainer = document.getElementsByClassName("tile-container")[0];
}

HTMLActuator.prototype.actuate = function(grid) {
    var self = this;

    window.requestAnimationFrame(function () {
        self.clearContainer();

        grid.cells.forEach(function (column) {
            column.forEach(function (cell) {
                if (cell) {
                    self.addHTMLTile(cell);
                }
            });
        });
    });
};

HTMLActuator.prototype.clearContainer = function() {
    while (this.tileContainer.firstChild) {
        this.tileContainer.removeChild(this.tileContainer.firstChild);
    }
};

HTMLActuator.prototype.addHTMLTile = function (tile) {
    var element = document.createElement("div");

    function pos_offset(pos, offset)
    { return {x: pos.x + offset, y: pos.y + offset}; }
    function tile_pos_attr(pos)
    { return "tile-position-" + pos.x + "-" + pos.y; }
    
    var pos_jsobj = pos_offset(tile.prevPos || tile.pos, 1);

    element.classList.add("tile", "tile-" + tile.value, tile_pos_attr(pos_jsobj));
    element.textContent = tile.value.toUpperCase();
    if (element.textContent == "QU")
        element.textContent = "Qu";
    element.setAttribute("draggable", true);

    this.tileContainer.appendChild(element);

    window.requestAnimationFrame(() => {
        element.classList.remove(element.classList[2]);
        element.classList.add(tile_pos_attr(pos_offset(tile.pos, 1)));
    });
    if (tile.prevPos.y > 4) {
        element.classList.add("tile-new");
    }

    element.addEventListener("dragstart",tile.dragstart_handler.bind(tile));
    element.addEventListener("dragenter",tile.dragenter_handler.bind(tile));
    // element.addEventListener("dragleave",tile.dragleave_handler.bind(tile));
    element.addEventListener("dragend",tile.dragend_handler.bind(tile));
    element.addEventListener("drop",tile.drop_handler.bind(tile));
};
