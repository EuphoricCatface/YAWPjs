function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value;
    
    this.previousPosition = null;
}

Tile.prototype.dragstart_handler = function (ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);
    console.log("dragstart");

    // transparent drag object: https://stackoverflow.com/q/27989602/
    var crt = this.cloneNode(true);
    crt.style.display = "none";
    document.body.appendChild(crt);
    ev.dataTransfer.setDragImage(crt, 0, 0);
};
