'use strict';
class Tile {
    pos;
    value;
    prevPos;
    static word_construct;
    static selected_elements;
    static selected_tiles;
    static events;
    constructor(position, value) {
        this.pos = position;
        this.value = value;
        this.prevPos = null;
        Tile.word_construct = "";
        Tile.selected_elements = [];
        Tile.selected_tiles = [];
        Tile.events = Tile.events || new Map;
    }
    dragstart_handler(ev) {
        // transparent drag object: https://stackoverflow.com/q/27989602/
        ev.dataTransfer.setData("text", "Tile");
        ev.dataTransfer.setDragImage(new Image(0, 0), 0, 0);
        // Workaround: sometimes first tile does not register
        Tile.tryAddTile(ev.target, this);
    }
    dragenter_handler(ev) {
        var target = ev.target;
        if (ev.dataTransfer.getData("text") != "Tile")
            return;
        if (target.className == "tileScore")
            target = target.parentElement;
        Tile.tryAddTile(target, this);
    }
    dragend_handler(_ev) {
        // "dragEnd" seem to fire after the "drop"
        while (Tile.selected_elements.length)
            Tile.popTile();
        console.assert(Tile.selected_tiles.length == 0 &&
            Tile.selected_elements.length == 0 &&
            Tile.word_construct.length == 0, "dragend: internal selection did not clear!");
    }
    drop_handler(ev) {
        ev.preventDefault();
        var target = ev.target;
        if (target.nodeName == "#text") {
            console.log("drop: Target is text, replacing with parentElement");
            target = target.parentElement;
        }
        // test if it's inside the gamecontainer
        while (target) {
            //console.log(target);
            if (target.className == "game-container") {
                Tile.finishSelection();
                return true;
            }
            target = target.parentElement;
        }
        // // console.error("Drop event seem to have fired outside of game-container.");
        // Drop fires twice when dropped onto the tile: once from the tile, and once from the board.
        // The test above essentially does the test for the second drop, because a deleted node's parent is null.
        // console.error("Invalid Drop");
        return false;
    }
    dragover_handler(ev) {
        ev.preventDefault();
    }
    isNeighbor(that) {
        if ((Math.abs(this.pos.x - that.pos.x) <= 1) &&
            (Math.abs(this.pos.y - that.pos.y) <= 1))
            return true;
        return false;
    }
    static tryAddTile(element, tile) {
        console.assert(Number.isInteger(tile.pos.x) && Number.isInteger(tile.pos.y), "Tile coordinate is not Integer");
        console.assert(Tile.selected_tiles.length == Tile.selected_elements.length, "selected tiles and elements length mismatch");
        console.assert(Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll(/Qu/gi)].length, "selected tiles and word length mismatch");
        if (element.nodeName == "#text") {
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
            if (Tile.selected_elements.find(e => e === element))
                // element is already in the list;
                // ignoring
                return;
        } while (false); // ADD:
        Tile.selected_elements.push(element);
        Tile.selected_tiles.push(tile);
        Tile.word_construct += tile.value;
        element.classList.add("selected");
    }
    static popTile() {
        console.assert(Tile.selected_tiles.length == Tile.selected_elements.length, "selected tiles and elements length mismatch");
        console.assert(Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll(/Qu/gi)].length, "selected tiles and word length mismatch");
        var element = Tile.selected_elements.pop();
        Tile.selected_tiles.pop();
        Tile.word_construct = Tile.word_construct.slice(0, Tile.word_construct.length - 1);
        if (Tile.word_construct.endsWith("q"))
            Tile.word_construct = Tile.word_construct.slice(0, Tile.word_construct.length - 1);
        element.classList.remove("selected");
    }
    static finishSelection() {
        console.assert(Boolean(Tile.selected_tiles.length) &&
            Boolean(Tile.selected_elements.length) &&
            Boolean(Tile.word_construct.length), "finishSelection: internal selection has already gone!");
        Tile.emit("finishSelect", {
            tiles: Tile.selected_tiles,
            elements: Tile.selected_elements,
            word: Tile.word_construct
        });
    }
    static on(event, callback) {
        if (!Tile.events[event]) {
            Tile.events[event] = [];
        }
        Tile.events[event].push(callback);
    }
    static emit(event, data) {
        var callbacks = Tile.events[event];
        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(data);
            });
        }
    }
}
//# sourceMappingURL=tile.js.map