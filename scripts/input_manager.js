'use strict';
class inputManager {
    static word_construct = "";
    static selected_elements = [];
    static selected_tiles = [];
    static events = new Map;
    static on(event, callback) {
        if (!inputManager.events[event]) {
            inputManager.events[event] = [];
        }
        inputManager.events[event].push(callback);
    }
    static emit(event, data) {
        const callbacks = inputManager.events[event];
        if (callbacks) {
            callbacks.forEach((callback) => { callback(data); });
        }
    }
    static selection_clear() {
        while (inputManager.selected_elements.length)
            inputManager.popTile();
        console.assert(inputManager.selected_tiles.length == 0 &&
            inputManager.selected_elements.length == 0 &&
            inputManager.word_construct.length == 0, "selection_clear: internal selection did not clear!");
    }
    static nextTile(element, tile) {
        if (Tile.DRAG_DEBUG)
            console.log("nextTile start");
        if (element.nodeName == "#text" || element.classList.contains("tileScore")) {
            if (Tile.DRAG_DEBUG)
                console.log("nextTile: element is likely a child of a Tile - using its parent.");
            element = element.parentElement;
        }
        console.assert(Number.isInteger(tile.pos.x) && Number.isInteger(tile.pos.y), "Tile coordinate is not Integer");
        console.assert(inputManager.selected_tiles.length == inputManager.selected_elements.length, "selected tiles and elements length mismatch");
        console.assert(inputManager.selected_elements.length ==
            inputManager.word_construct.length - [...inputManager.word_construct.matchAll(/Qu/gi)].length, "selected tiles and word length mismatch");
        do { // do ... while as goto replacement
            if (inputManager.selected_elements.length == 0) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 1");
                // start of selection;
                // adding unconditionally
                continue; // goto ADD;
            }
            if (inputManager.selected_elements.at(-1) === element) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 2");
                // current tile is same as the last selected tile;
                // ignoring
                return false;
            }
            if (!tile.isNeighbor(inputManager.selected_tiles.at(-1))) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 3");
                // current tile is somehow too far from the last selected tile;
                // ignoring
                return false;
            }
            if (inputManager.selected_elements.length >= 2 &&
                inputManager.selected_elements.at(-2) === element) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 4");
                // The user has retreated from the last selection;
                // pop the last tile
                inputManager.popTile();
                return true;
            }
            if (inputManager.selected_elements.find(e => e === element)) {
                if (Tile.DRAG_DEBUG)
                    console.log("nextTile cond 5");
                // element is already in the list;
                // ignoring
                return false;
            }
        } while (false); // ADD:
        if (Tile.DRAG_DEBUG)
            console.log("nextTile cond 6");
        inputManager.selected_elements.push(element);
        inputManager.selected_tiles.push(tile);
        inputManager.word_construct += tile.value;
        element.classList.add("selected");
        return true;
    }
    static popTile() {
        console.assert(inputManager.selected_tiles.length == inputManager.selected_elements.length, "selected tiles and elements length mismatch");
        console.assert(inputManager.selected_elements.length ==
            inputManager.word_construct.length - [...inputManager.word_construct.matchAll(/Qu/gi)].length, "selected tiles and word length mismatch");
        const element = inputManager.selected_elements.pop();
        inputManager.selected_tiles.pop();
        inputManager.word_construct = inputManager.word_construct.slice(0, inputManager.word_construct.length - 1);
        if (inputManager.word_construct.endsWith("q"))
            inputManager.word_construct = inputManager.word_construct.slice(0, inputManager.word_construct.length - 1);
        element.classList.remove("selected");
    }
    static sendInput() {
        console.assert(Boolean(inputManager.selected_tiles.length) &&
            Boolean(inputManager.selected_elements.length) &&
            Boolean(inputManager.word_construct.length), "sendInput: internal selection is somehow gone!");
        inputManager.emit("sendInput", {
            tiles: inputManager.selected_tiles,
            elements: inputManager.selected_elements,
            word: inputManager.word_construct
        });
    }
    static finishSelect() {
        console.assert(Boolean(inputManager.selected_tiles.length) &&
            Boolean(inputManager.selected_elements.length) &&
            Boolean(inputManager.word_construct.length), "finishSelect: internal selection is somehow gone!");
        inputManager.emit("finishSelect", {});
    }
}
//# sourceMappingURL=input_manager.js.map