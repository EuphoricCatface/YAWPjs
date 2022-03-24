'use strict';
class Tile {
    pos;
    value;
    prevPos;
    bonus;
    static mousedown_nodrag;
    static DRAG_DEBUG;
    static word_construct;
    static selected_elements;
    static selected_tiles;
    static events;
    constructor(position, value) {
        Tile.DRAG_DEBUG = false;
        this.pos = position;
        this.value = value;
        this.prevPos = null;
        this.bonus = "";
        Tile.mousedown_nodrag = false;
        Tile.word_construct = "";
        Tile.selected_elements = [];
        Tile.selected_tiles = [];
        Tile.events = Tile.events || new Map;
    }
    mousedown_handler(ev) {
        Tile.mousedown_nodrag = true;
        var target = ev.target;
        if (target.classList.contains("tileScore"))
            target = target.parentElement;
        var selectionChanged = Tile.nextTile(target, this);
        if (selectionChanged)
            Tile.sendInput();
    }
    mouseup_handler(ev) {
        if (Tile.mousedown_nodrag) {
            Tile.selection_clear();
        }
        Tile.mousedown_nodrag = false;
    }
    dragstart_handler(ev) {
        // transparent drag object: https://stackoverflow.com/q/27989602/
        ev.dataTransfer.setData("text", "Tile");
        ev.dataTransfer.setDragImage(new Image(0, 0), 0, 0);
        if (Tile.DRAG_DEBUG)
            console.log("dragstart");
        Tile.mousedown_nodrag = false;
        //// Workaround: sometimes first tile does not register
        //Tile.nextTile((ev.target as HTMLElement), this);
    }
    dragenter_handler(ev) {
        if (Tile.DRAG_DEBUG) {
            console.log("dragenter");
            console.log(this);
        }
        var target = ev.target;
        /* // Chrome doesn't seem to like this
        if (ev.dataTransfer.getData("text") != "Tile") {
            if (Tile.DRAG_DEBUG) console.log(ev.dataTransfer.getData("text"));
            return;
        }
        */
        if (target.className == "tileScore")
            target = target.parentElement;
        var selectionChanged = Tile.nextTile(target, this);
        if (selectionChanged)
            Tile.sendInput();
    }
    dragend_handler(_ev) {
        if (Tile.DRAG_DEBUG)
            console.log("dragend");
        // "dragEnd" seem to fire after the "drop"
        // "dragEnd" also happens when "drop" fails
        Tile.selection_clear();
    }
    drop_handler(ev) {
        if (Tile.DRAG_DEBUG)
            console.log("drop");
        ev.preventDefault();
        // Workaround: duplicate_check
        if (Tile.selected_tiles.length == 0)
            return;
        var target = ev.target;
        if (target.nodeName == "#text") {
            console.log("drop: Target is text, replacing with parentElement");
            target = target.parentElement;
        }
        // test if it's inside the gamecontainer
        var valid_drop = false;
        while (target) {
            //console.log(target);
            if (target.className == "game-container") {
                valid_drop = true;
            }
            target = target.parentElement;
        }
        if (valid_drop)
            Tile.finishSelect();
        Tile.selection_clear();
        // Workaround: duplicate_check
        // This probably will happen on dragend_handler eventually,
        // but problem is that the board may fire the drop as well as the tile,
        // making the check duplicate.
        return true;
    }
    dragover_handler(ev) {
        // if (DRAG_DEBUG) console.log("dragover");
        ev.preventDefault();
    }
    static selection_clear() {
        while (Tile.selected_elements.length)
            Tile.popTile();
        console.assert(Tile.selected_tiles.length == 0 &&
            Tile.selected_elements.length == 0 &&
            Tile.word_construct.length == 0, "dragend: internal selection did not clear!");
    }
    isNeighbor(that) {
        if ((Math.abs(this.pos.x - that.pos.x) <= 1) &&
            (Math.abs(this.pos.y - that.pos.y) <= 1))
            return true;
        return false;
    }
    static nextTile(element, tile) {
        if (Tile.DRAG_DEBUG)
            console.log("nextTile start");
        console.assert(Number.isInteger(tile.pos.x) && Number.isInteger(tile.pos.y), "Tile coordinate is not Integer");
        console.assert(Tile.selected_tiles.length == Tile.selected_elements.length, "selected tiles and elements length mismatch");
        console.assert(Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll(/Qu/gi)].length, "selected tiles and word length mismatch");
        if (element.nodeName == "#text") {
            // unlikely
            console.warn("nextTile: arg is #text node. Trying parent instead.");
            element = element.parentElement;
        }
        do { // do ... while as goto replacement
            if (Tile.selected_elements.length == 0) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 1");
                // start of selection;
                // adding unconditionally
                continue; // goto ADD;
            }
            if (Tile.selected_elements.at(-1) === element) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 2");
                // current tile is same as the last selected tile;
                // ignoring
                return false;
            }
            if (!tile.isNeighbor(Tile.selected_tiles.at(-1))) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 3");
                // current tile is somehow too far from the last selected tile;
                // ignoring
                return false;
            }
            if (Tile.selected_elements.length >= 2 &&
                Tile.selected_elements.at(-2) === element) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 4");
                // The user has retreated from the last selection;
                // pop the last tile
                Tile.popTile();
                return true;
            }
            if (Tile.selected_elements.find(e => e === element)) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 5");
                // element is already in the list;
                // ignoring
                return false;
            }
        } while (false); // ADD:
        if (Tile.DRAG_DEBUG)
            console.log("nextTile cond 6");
        Tile.selected_elements.push(element);
        Tile.selected_tiles.push(tile);
        Tile.word_construct += tile.value;
        element.classList.add("selected");
        return true;
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
    static sendInput() {
        console.assert(Boolean(Tile.selected_tiles.length) &&
            Boolean(Tile.selected_elements.length) &&
            Boolean(Tile.word_construct.length), "sendInput: internal selection is somehow gone!");
        Tile.emit("sendInput", {
            tiles: Tile.selected_tiles,
            elements: Tile.selected_elements,
            word: Tile.word_construct
        });
    }
    static finishSelect() {
        console.assert(Boolean(Tile.selected_tiles.length) &&
            Boolean(Tile.selected_elements.length) &&
            Boolean(Tile.word_construct.length), "finishSelect: internal selection is somehow gone!");
        Tile.emit("finishSelect", {});
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