'use strict';
class Tile {
    static DRAG_DEBUG = false;
    static BUTTON_DEBUG = false;
    pos;
    value;
    prevPos;
    bonus;
    static mousedown_nodrag = false;
    constructor(position, value) {
        this.pos = position;
        this.value = value;
        this.prevPos = null;
        this.bonus = "";
    }
    isNeighbor(that) {
        if ((Math.abs(this.pos.x - that.pos.x) <= 1) &&
            (Math.abs(this.pos.y - that.pos.y) <= 1))
            return true;
        return false;
    }
    static valid_button(ev) { return ev.buttons == 1; }
    static invalid_end_button(ev) { return ev.buttons & 1; }
    mousedown_handler(ev) {
        if (!Tile.valid_button(ev)) {
            ev.preventDefault();
            return;
        }
        Tile.mousedown_nodrag = true;
        const target = ev.target;
        const selectionChanged = inputManager.nextTile(target, this);
        if (selectionChanged)
            inputManager.sendInput();
    }
    mouseup_handler(ev) {
        ev.preventDefault();
        if (Tile.BUTTON_DEBUG)
            console.log(ev.buttons);
        if (Tile.invalid_end_button(ev))
            return; // don't end the selection if left button is still present
        if (Tile.mousedown_nodrag)
            inputManager.selection_clear();
        Tile.mousedown_nodrag = false;
    }
    dragstart_handler(ev) {
        if (!Tile.valid_button(ev)) {
            ev.preventDefault();
            return;
        }
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
        ev.preventDefault();
        if (Tile.DRAG_DEBUG) {
            console.log("dragenter");
            console.log(this);
        }
        if (!Tile.valid_button(ev))
            return;
        const target = ev.target;
        /* // Chrome doesn't seem to like this
        if (ev.dataTransfer.getData("text") != "Tile") {
            if (Tile.DRAG_DEBUG) console.log(ev.dataTransfer.getData("text"));
            return;
        }
        */
        const selectionChanged = inputManager.nextTile(target, this);
        if (selectionChanged)
            inputManager.sendInput();
    }
    dragend_handler(ev) {
        ev.preventDefault();
        if (Tile.BUTTON_DEBUG)
            console.log(ev.buttons);
        if (Tile.DRAG_DEBUG)
            console.log("dragend");
        if (Tile.invalid_end_button(ev))
            return; // don't end the selection if left button is still present
        // backup clear if "drop" fails - it seem to fire after the "drop"
        inputManager.selection_clear();
    }
    dragover_handler(ev) {
        ev.preventDefault();
        // if (DRAG_DEBUG) console.log("dragover"); // fires too often even when debugging
        if (!Tile.valid_button(ev))
            return;
    }
    drop_handler(ev) {
        ev.preventDefault();
        if (Tile.DRAG_DEBUG) {
            console.log("drop");
            console.log(this);
        }
        if (Tile.BUTTON_DEBUG)
            console.log(ev.buttons);
        if (Tile.invalid_end_button(ev))
            return; // don't end the selection if left button is still present
        if (inputManager.selected_tiles.length == 0)
            return; // Workaround: duplicate_check
        let target = ev.target;
        // test if it's inside the gamecontainer
        let valid_drop = false;
        while (target) {
            if (target.className == "game-container") {
                valid_drop = true;
                break;
            }
            target = target.parentElement;
        }
        if (valid_drop)
            inputManager.finishSelect();
        inputManager.selection_clear();
        // Workaround: duplicate_check
        // selection_clear will happen on dragend_handler eventually,
        // but problem is that the board may fire the drop as well as the tile,
        // making the check duplicate.
        return true;
    }
    contextmenu_handler(ev) {
        ev.preventDefault();
    }
}
//# sourceMappingURL=tile.js.map