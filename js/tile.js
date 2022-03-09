'use strict';

function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value;

    this.previousPosition = null;

    Tile.word_construct = "";
    Tile.selected_elements = [];
    Tile.selected_tiles = [];
}

Tile.prototype.dragstart_handler = function (ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);

    // transparent drag object: https://stackoverflow.com/q/27989602/
    var crt = ev.target.cloneNode(true);
    crt.style.display = "none";
    document.body.appendChild(crt);
    ev.dataTransfer.setDragImage(crt, 0, 0);

    // Workaround: sometimes first tile does not register
    var self = this;
    Tile.tryAddTile(ev.target, self);
};

Tile.prototype.dragenter_handler = function (ev) {
    var self = this;
    Tile.tryAddTile(ev.target, self);
};

Tile.prototype.dragend_handler = function (ev) {
    var target = ev.target;
    if (target.nodeName == "#text") {
        console.log("This is text, replacing with parentElement");
        target = target.parentElement;
    }

    Tile.finishSelection();
};

Tile.prototype.drop_handler = function (ev) {
    ev.preventDefault();
};

Tile.prototype.dragover_handler = function (ev) {
    ev.preventDefault();
};

Tile.prototype.isNeighbor = function (that) {
    console.assert(
        Number.isInteger(this.x) && Number.isInteger(this.y) &&
        Number.isInteger(that.x) && Number.isInteger(that.y),
        "Tile coordinate is not Integer"
    );

    if ((Math.abs(this.x - that.x) <= 1) &&
            (Math.abs(this.y - that.y) <= 1))
        return true;
    return false;
};

Tile.tryAddTile = function (element, tile) {
    console.assert(
        Tile.selected_tiles.length == Tile.selected_elements.length,
        "selected tiles and elements length mismatch"
    );
    console.assert(
        Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll("Qu")].length,
        "selected tiles and word length mismatch"
    );

    if (element.nodeName == "#text"){
        // unlikely
        console.warn("tryAddTile: arg is #text node. Trying parent instead.");
        element = element.parentElement;
    }

    do { // do ... while as goto replacement
        if (Tile.selected_elements.length == 0)
            // start of selection;
            // adding unconditionally
            continue; // goto ADD;

        if (Tile.selected_elements.at(-1) === element)
            // current tile is same as the last selected tile;
            // ignoring
            return;

        if (!tile.isNeighbor(Tile.selected_tiles.at(-1)))
            // current tile is somehow too far from the last selected tile;
            // ignoring
            return;

        if (Tile.selected_elements.length >= 2 &&
                Tile.selected_elements.at(-2) === element) {
            // The user has retreated from the last selection;
            // pop the last tile
            Tile.popTile();
            return;
        }

        if (Tile.selected_elements.find( e => e === element ))
            // element is already in the list;
            // ignoring
            return;
    } while(false); // ADD:

    Tile.selected_elements.push(element);
    Tile.selected_tiles.push(tile);
    Tile.word_construct += element.textContent;

    element.classList.add("selected");
};

Tile.popTile = function () {
    console.assert(
        Tile.selected_tiles.length == Tile.selected_elements.length,
        "selected tiles and elements length mismatch"
    );
    console.assert(
        Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll("Qu")].length,
        "selected tiles and word length mismatch"
    );

    var element = Tile.selected_elements.pop();
    Tile.selected_tiles.pop();
    Tile.word_construct = Tile.word_construct.slice(0, Tile.word_construct.length-1);
    if (Tile.word_construct.endsWith("Q"))
        Tile.word_construct = Tile.word_construct.slice(0, Tile.word_construct.length-1);

    element.classList.remove("selected");
};

Tile.finishSelection = function () {
    console.log("DUMMY: finishSelection");
    console.log(Tile.word_construct);

    while (Tile.selected_elements.length)
        Tile.popTile();

    console.assert(Tile.selected_tiles.length == 0 &&
        Tile.selected_elements.length == 0 &&
        Tile.word_construct.length == 0,
        "finishSelection: internal selection did not clear!");
};
