function dragstart_handler(ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
}

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

    var elements = document.getElementsByClassName("tile");
    for (let element of elements) {
        console.log(element.classList);
        console.log("adding event listener");
        element.addEventListener("dragstart", dragstart_handler);
    }
};

HTMLActuator.prototype.clearContainer = function() {
    while (this.tileContainer.firstChild) {
        this.tileContainer.removeChild(this.tileContainer.firstChild);
    }
};

HTMLActuator.prototype.addTile = function (tile) {
    var element = document.createElement("div");
    
    var x = tile.x + 1;
    var y = tile.y + 1;
    var position = "tile-position-" + x + "-" + y;

    element.classList.add("tile", "tile-" + tile.value, position);
    element.textContent = tile.value.toUpperCase();
    element.setAttribute("draggable", true);

    this.tileContainer.appendChild(element);
};
