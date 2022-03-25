'use strict';

class HTMLActuator {
    letter_score: Record<string, number>;
    tileContainer: Element;
    gameContainer: Element;
    wordConstructContainer: Element;
    calculationContainer: Element;
    scoreTotalContainer: Element;
    turnsContainer: Element;
    recentScore: number;
    totalScore: number;
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
        this.wordConstructContainer = document.getElementsByClassName("word-construct-container")[0];
        this.calculationContainer = document.getElementsByClassName("calculation-container")[0];
        this.scoreTotalContainer = document.getElementsByClassName("score-total-container")[0];
        this.turnsContainer = document.getElementsByClassName("turns-container")[0];
        this.recentScore = 0;
        this.totalScore = 0;
    }
    actuate_grid(grid: Grid) {
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
    clearContainer() {
        while (this.tileContainer.firstChild) {
            this.tileContainer.removeChild(this.tileContainer.firstChild);
        }
    }
    actuate_word(tiles: HTMLElement[], pure_score: number, letter_bonus: number, word_bonus: number) {
        while (this.wordConstructContainer.firstChild) {
            this.wordConstructContainer.removeChild(this.wordConstructContainer.firstChild);
        }
        tiles.forEach((tile) => {
            var tilecopy = (tile.cloneNode(true) as HTMLElement);
            tilecopy.removeChild(tilecopy.firstElementChild);
            tilecopy.classList.add("construct");
            this.wordConstructContainer.appendChild(tilecopy);
        });
        while (this.calculationContainer.firstChild) {
            this.calculationContainer.removeChild(this.calculationContainer.firstChild);
        }
        this.calculationContainer.textContent = "(" + pure_score + " + " + letter_bonus + ") * " + word_bonus
            + " = ";
        var element = document.createElement("strong");
        this.recentScore = (pure_score + letter_bonus) * word_bonus;
        element.textContent = (this.recentScore).toString();
        this.calculationContainer.appendChild(element);
    }
    addHTMLTile(tile: Tile) {
        var element = document.createElement("div");

        function pos_offset(pos:CoordType, offset: number) { return { x: pos.x + offset, y: pos.y + offset }; }
        function tile_pos_attr(pos: CoordType) { return "tile-position-" + pos.x + "-" + pos.y; }

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
        element.addEventListener("mousedown", tile.mousedown_handler.bind(tile));
        element.addEventListener("mouseup", tile.mouseup_handler.bind(tile));
    }
    setScore(score: number) {
        this.scoreTotalContainer.textContent = score.toString();
        this.totalScore = score;
    }
    addScore() {
        this.totalScore = this.totalScore + this.recentScore;
        this.scoreTotalContainer.textContent = this.totalScore.toString();
    }
    gameOver() {
        this.gameContainer.classList.add("game-over");
    }
    showTurn(turns: number) {
        this.turnsContainer.textContent = "" + turns + " / 20";
    }
}





