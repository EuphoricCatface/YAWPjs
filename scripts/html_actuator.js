'use strict';
class HTMLActuator {
    letter_score;
    tileContainer;
    gameContainer;
    wordConstruct;
    scoreWord;
    constructor() {
        this.letter_score = {
            "a": 1, "b": 3, "c": 3, "d": 2, "e": 1,
            "f": 4, "g": 2, "h": 4, "i": 1, "j": 8,
            "k": 5, "l": 1, "m": 3, "n": 1, "o": 1,
            "p": 3, "qu": 10, "r": 1, "s": 1, "t": 1,
            "u": 1, "v": 4, "w": 4, "x": 8, "y": 4, "z": 10
        };
        this.tileContainer = document.getElementsByClassName("tile-container")[0];
        this.gameContainer = document.getElementsByClassName("game-container")[0];
        this.wordConstruct = document.getElementsByClassName("word-construct")[0];
        this.scoreWord = document.getElementsByClassName("score-word")[0];
    }
    actuate_grid(grid) {
        var self = this;
        window.requestAnimationFrame(function () {
            self.clearContainer();
            grid.cells.forEach(function (column) {
                column.forEach(function (cell) {
                    if (cell) {
                        self.addHTMLTile(cell);
                    }
                });
            });
        });
    }
    actuate_word(word, pure_score, letter_bonus, word_bonus) {
        this.wordConstruct.textContent = word;
        while (this.scoreWord.firstChild) {
            this.scoreWord.removeChild(this.scoreWord.firstChild);
        }
        this.scoreWord.textContent = "(" + pure_score + " + " + letter_bonus + ") * " + word_bonus
            + " = ";
        var element = document.createElement("strong");
        element.textContent = ((pure_score + letter_bonus) * word_bonus).toString();
        this.scoreWord.appendChild(element);
    }
    clearContainer() {
        while (this.tileContainer.firstChild) {
            this.tileContainer.removeChild(this.tileContainer.firstChild);
        }
    }
    addHTMLTile(tile) {
        var element = document.createElement("div");
        function pos_offset(pos, offset) { return { x: pos.x + offset, y: pos.y + offset }; }
        function tile_pos_attr(pos) { return "tile-position-" + pos.x + "-" + pos.y; }
        var pos_jsobj = pos_offset(tile.prevPos || tile.pos, 1);
        element.classList.add("tile", "tile-" + tile.value, tile_pos_attr(pos_jsobj));
        if (tile.bonus)
            element.classList.add(tile.bonus);
        element.textContent = tile.value.toUpperCase();
        if (element.textContent == "QU")
            element.textContent = "Qu";
        element.setAttribute("draggable", "true");
        var tileScore = document.createElement("div");
        tileScore.classList.add("tileScore");
        tileScore.textContent = this.letter_score[tile.value].toString();
        element.appendChild(tileScore);
        this.tileContainer.appendChild(element);
        window.requestAnimationFrame(() => {
            element.classList.remove(element.classList[2]);
            element.classList.add(tile_pos_attr(pos_offset(tile.pos, 1)));
        });
        if (tile.prevPos.y > 4) {
            element.classList.add("tile-new");
        }
        element.addEventListener("dragstart", tile.dragstart_handler.bind(tile));
        element.addEventListener("dragenter", tile.dragenter_handler.bind(tile));
        // element.addEventListener("dragleave",tile.dragleave_handler.bind(tile));
        element.addEventListener("dragend", tile.dragend_handler.bind(tile));
        element.addEventListener("dragover", tile.dragover_handler.bind(tile));
        element.addEventListener("drop", tile.drop_handler.bind(tile));
    }
    setScore(score) {
        var score_total = document.getElementsByClassName("score-total")[0];
        score_total.textContent = score.toString();
    }
    gameOver() {
        this.gameContainer.classList.add("game-over");
    }
}
//# sourceMappingURL=html_actuator.js.map