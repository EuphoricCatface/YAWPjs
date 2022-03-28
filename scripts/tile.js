'use strict';
class Tile {
    static POINTER_DEBUG = false;
    static BUTTON_DEBUG = false;
    pos;
    value;
    prevPos;
    bonus;
    static selecting = false;
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
    pointerdown_handler(ev) {
        if (!Tile.valid_button(ev)) {
            ev.preventDefault();
            return;
        }
        if (Tile.selecting)
            return;
        if (Tile.POINTER_DEBUG)
            console.log("pointerdown");
        Tile.selecting = true;
        ev.target.releasePointerCapture(ev.pointerId);
        // Workaround: sometimes first tile does not register
        const selectionChanged = inputManager.nextTile(ev.target, this);
        if (selectionChanged)
            inputManager.sendInput();
    }
    pointerenter_handler(ev) {
        ev.preventDefault();
        if (!Tile.selecting)
            return;
        if (Tile.POINTER_DEBUG) {
            console.log("pointerenter");
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
    popinterup_handler(ev) {
        ev.preventDefault();
        if (Tile.POINTER_DEBUG) {
            console.log("pointerup");
            console.log(this);
        }
        if (!Tile.selecting)
            return;
        Tile.selecting = false;
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
}
//# sourceMappingURL=tile.js.map