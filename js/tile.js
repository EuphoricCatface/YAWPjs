'use strict';

function Tile(position, value) {
    this.x = position.x;
    this.y = position.y;
    this.value = value;

    this.previousPosition = null;

    Tile.word_construct = "";
    Tile.selected_elements = [];
}

Tile.prototype.dragstart_handler = function (ev) {
    ev.dataTransfer.setData("text/plain", ev.target.id);

    // transparent drag object: https://stackoverflow.com/q/27989602/
    var crt = this.cloneNode(true);
    crt.style.display = "none";
    document.body.appendChild(crt);
    ev.dataTransfer.setDragImage(crt, 0, 0);

    // Workaround: sometimes first tile does not register
    Tile.tryAddTile(ev.target);
};

Tile.prototype.dragenter_handler = function (ev) {
    Tile.tryAddTile(ev.target);

    //console.log(this);
    // `this` suddenly points at the html element here??
    // - refactor stash leaved behind.
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

function getElementPosition(element) {
    var class_list = Array.from(element.classList);
    var pos_data = class_list.find(element => element.startsWith("tile-position"));
    // ex) "tile-position-1-2"
    var x = parseInt(pos_data.charAt(14));
    var y = parseInt(pos_data.charAt(16));

    return {
        x: x,
        y: y
    };
}

function isNeighborElement (one, another) {
    var one_position = getElementPosition(one);
    var another_position = getElementPosition(another);

    console.assert(
        Number.isInteger(one_position.x) && Number.isInteger(one_position.y) &&
        Number.isInteger(another_position.x) && Number.isInteger(another_position.y),
        "Tile coordinate is not Integer"
    );

    if ((Math.abs(one_position.x - another_position.x) <= 1) &&
            (Math.abs(one_position.y - another_position.y) <= 1))
        return true;
    return false;
};

Tile.tryAddTile = function (element) {
    console.assert(
        Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll("Qu")].length,
        "selected tiles and word length mismatch"
    );

    if (Tile.selected_elements.find( e => e === element ))
        return;

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

        if (!isNeighborElement(Tile.selected_elements.at(-1), element))
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

    } while(false); // ADD:

    Tile.selected_elements.push(element);
    Tile.word_construct += element.textContent;

    element.classList.add("selected");
};

Tile.popTile = function () {
    console.assert(
        Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll("Qu")].length,
        "selected tiles and word length mismatch"
    );

    var element = Tile.selected_elements.pop();
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

    console.assert(Tile.selected_elements.length == 0 &&
        Tile.word_construct.length == 0,
        "finishSelection: internal selection did not clear!");
};
