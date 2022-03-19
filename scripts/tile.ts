'use strict';

type CoordType = {x: number, y: number};
type SelectionInputType = {tiles: Tile[], elements: HTMLElement[], word: string};

class Tile {
    pos: CoordType;
    value: string;
    prevPos: CoordType;
    static DRAG_DEBUG: Boolean;
    static word_construct: string;
    static selected_elements: HTMLElement[];
    static selected_tiles: Tile[];
    static events: Map<string, CallableFunction[]>;
    constructor(position: CoordType, value: string) {
        Tile.DRAG_DEBUG = false;

        this.pos = position;
        this.value = value;

        this.prevPos = null;

        Tile.word_construct = "";
        Tile.selected_elements = [];
        Tile.selected_tiles = [];

        Tile.events = Tile.events || new Map;
    }
    dragstart_handler(ev: DragEvent) {
        // transparent drag object: https://stackoverflow.com/q/27989602/
        ev.dataTransfer.setData("text", "Tile");
        ev.dataTransfer.setDragImage(new Image(0, 0), 0, 0);
        if (Tile.DRAG_DEBUG) console.log("dragstart");

        // Workaround: sometimes first tile does not register
        Tile.tryAddTile((ev.target as HTMLElement), this);
    }
    dragenter_handler(ev: DragEvent) {
        if (Tile.DRAG_DEBUG) {
            console.log("dragenter");
            console.log(this);
        }
        var target = (ev.target as HTMLElement);
        if (ev.dataTransfer.getData("text") != "Tile") {
            if (Tile.DRAG_DEBUG) console.log(ev.dataTransfer.getData("text"));
            return;
        }
        if (target.className == "tileScore")
            target = target.parentElement;

        Tile.tryAddTile(target, this);
    }
    dragend_handler(_ev: DragEvent) {
        if (Tile.DRAG_DEBUG) console.log("dragend");
        // "dragEnd" seem to fire after the "drop"
        // "dragEnd" also happens when "drop" fails
        Tile.selection_clear();
    }
    drop_handler(ev: DragEvent) {
        if (Tile.DRAG_DEBUG) console.log("drop");
        ev.preventDefault();

        // Workaround: duplicate_check
        if (Tile.selected_tiles.length == 0)
            return;

        var target = (ev.target as HTMLElement);
        if (target.nodeName == "#text") {
            console.log("drop: Target is text, replacing with parentElement");
            target = target.parentElement;
        }

        // test if it's inside the gamecontainer
        var valid_drop = false;
        while (target) {
            //console.log(target);
            if (target.className == "game-container") {
                valid_drop = true
            }
            target = target.parentElement;
        }
        if (valid_drop)
            Tile.finishSelection();
        
        Tile.selection_clear();
        // Workaround: duplicate_check
        // This probably will happen on dragend_handler eventually,
        // but problem is that the board may fire the drop as well as the tile,
        // making the check duplicate.
        return true;
    }
    dragover_handler(ev: DragEvent) {
        // if (DRAG_DEBUG) console.log("dragover");
        ev.preventDefault();
    }
    static selection_clear() {
        while (Tile.selected_elements.length)
        Tile.popTile();

        console.assert(Tile.selected_tiles.length == 0 &&
            Tile.selected_elements.length == 0 &&
            Tile.word_construct.length == 0,
            "dragend: internal selection did not clear!");
    }
    isNeighbor(that: Tile) {
        if ((Math.abs(this.pos.x - that.pos.x) <= 1) &&
            (Math.abs(this.pos.y - that.pos.y) <= 1))
            return true;
        return false;
    }
    static tryAddTile(element: HTMLElement, tile: Tile) {
        if (Tile.DRAG_DEBUG) console.log("tryadd start");
        console.assert(
            Number.isInteger(tile.pos.x) && Number.isInteger(tile.pos.y),
            "Tile coordinate is not Integer"
        );
        console.assert(
            Tile.selected_tiles.length == Tile.selected_elements.length,
            "selected tiles and elements length mismatch"
        );
        console.assert(
            Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll(/Qu/gi)].length,
            "selected tiles and word length mismatch"
        );

        if (element.nodeName == "#text") {
            // unlikely
            console.warn("tryAddTile: arg is #text node. Trying parent instead.");
            element = element.parentElement;
        }

        do { // do ... while as goto replacement
            if (Tile.selected_elements.length == 0) {
                if (Tile.DRAG_DEBUG) console.log("tryadd cond 1");
                // start of selection;
                // adding unconditionally
                continue; // goto ADD;
            }
            if (Tile.selected_elements.at(-1) === element) {
                if (Tile.DRAG_DEBUG) console.log("tryadd cond 2");
                // current tile is same as the last selected tile;
                // ignoring
                return;
            }

            if (!tile.isNeighbor(Tile.selected_tiles.at(-1))){
                if (Tile.DRAG_DEBUG) console.log("tryadd cond 3");
                // current tile is somehow too far from the last selected tile;
                // ignoring
                return;
            }
            if (Tile.selected_elements.length >= 2 &&
                    Tile.selected_elements.at(-2) === element) {
                if (Tile.DRAG_DEBUG) console.log("tryadd cond 4");
                // The user has retreated from the last selection;
                // pop the last tile
                Tile.popTile();
                return;
            }

            if (Tile.selected_elements.find(e => e === element)){
                if (Tile.DRAG_DEBUG) console.log("tryadd cond 5");
                // element is already in the list;
                // ignoring
                return;
            }
        } while (false); // ADD:
        if (Tile.DRAG_DEBUG) console.log("tryadd cond 6");

        Tile.selected_elements.push(element);
        Tile.selected_tiles.push(tile);
        Tile.word_construct += tile.value;

        element.classList.add("selected");
    }
    static popTile() {
        console.assert(
            Tile.selected_tiles.length == Tile.selected_elements.length,
            "selected tiles and elements length mismatch"
        );
        console.assert(
            Tile.selected_elements.length ==
            Tile.word_construct.length - [...Tile.word_construct.matchAll(/Qu/gi)].length,
            "selected tiles and word length mismatch"
        );

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
            Boolean(Tile.word_construct.length),
            "finishSelection: internal selection has already gone!");

        Tile.emit("finishSelect", {
            tiles: Tile.selected_tiles,
            elements: Tile.selected_elements,
            word: Tile.word_construct
        });
    }
    static on(event: string, callback: CallableFunction) {
        if (!Tile.events[event]) {
            Tile.events[event] = [];
        }
        Tile.events[event].push(callback);
    }
    static emit(event: string, data: SelectionInputType) {
        var callbacks: CallableFunction[] = Tile.events[event];
        if (callbacks) {
            callbacks.forEach(function (callback) {
                callback(data);
            });
        }
    }
}
