function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value;
    
    this.previousPosition = null;

    Tile.word_construct = "";
    Tile.selected_coords = [];
    Tile.selected_tiles = [];
}

Tile.prototype.dragstart_handler = function (ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);

    // transparent drag object: https://stackoverflow.com/q/27989602/
    var crt = this.cloneNode(true);
    crt.style.display = "none";
    document.body.appendChild(crt);
    ev.dataTransfer.setDragImage(crt, 0, 0);

    console.log("dragstart");
    ev.target.classList.add("selected");
};

Tile.prototype.dragenter_handler = function (ev) {
    console.log("dragenter");
    ev.target.classList.add("selected");
};

Tile.prototype.dragleave_handler = function (ev) {
    // NOTE: sometimes, the text on a button fires dragleave_handler instead
    console.log("dragleave");
    var target = ev.target;
    if (target.nodeName == "#text"){
        console.log("This is text, replacing with parentElement");
        target = target.parentElement;
    }
    target.classList.remove("selected");
};

Tile.prototype.dragend_handler = function (ev) {
    console.log("dragend");
    var target = ev.target;
    if (target.nodeName == "#text") {
        console.log("This is text, replacing with parentElement");
        target = target.parentElement;
    }
    target.classList.remove("selected");
};

Tile.prototype.drop_handler = function (ev) {
    console.log("drop");
    ev.target.classList.remove("selected");
};

Tile.prototype.dragover_handler = function (ev) {
    // What exactly does this do...
    ev.preventDefault();
};
