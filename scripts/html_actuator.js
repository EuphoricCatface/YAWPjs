'use strict';
class HTMLActuator {
    static HIDE_CURRENT_TURN = false;
    static PUNISH_BLIND_MOVES = false;
    static LETTER_SCORE = {
        "a": 1, "b": 3, "c": 3, "d": 2, "e": 1,
        "f": 4, "g": 2, "h": 4, "i": 1, "j": 8,
        "k": 5, "l": 1, "m": 3, "n": 1, "o": 1,
        "p": 3, "qu": 10, "r": 1, "s": 1, "t": 1,
        "u": 1, "v": 4, "w": 4, "x": 8, "y": 4, "z": 10
    };
    static TOPWORD_INIT = Object.freeze({ score: 0, construct: null });
    static RATING = new Map([
        [0, "Try Harder..."],
        [5, "Unlucky"],
        [8.3, "Nice"],
        [10, "Great!"],
        [13.3, "Wonderful!"],
        [20, "Impressive!"],
        [30, "Incredible!"],
        [40, "True Expert!"] // * 15 = 600
    ]);
    tileContainer;
    gameContainer;
    wordConstructContainer;
    calculationContainer;
    scoreTotalContainer;
    turnsContainer;
    wordRankContainer;
    gameRatingContainer;
    recentScore;
    turnMaxPureScore;
    totalScore;
    topWord;
    constructor() {
        this.tileContainer = document.querySelector(".tile-container");
        this.gameContainer = document.querySelector(".game-container");
        this.wordConstructContainer = document.querySelector(".word-construct-container");
        this.calculationContainer = document.querySelector(".calculation-container");
        this.scoreTotalContainer = document.querySelector(".score-total-container");
        this.turnsContainer = document.querySelector(".turns-container");
        this.wordRankContainer = document.querySelector(".word-rank-container");
        this.gameRatingContainer = document.querySelector(".game-rating-container");
        this.recentScore = 0;
        this.turnMaxPureScore = 0;
        this.totalScore = 0;
        this.topWord = HTMLActuator.TOPWORD_INIT;
    }
    screen_setShow(e, b) {
        if (b) {
            e.classList.remove("hide");
            e.classList.add("show");
        }
        else {
            e.classList.remove("show");
            setTimeout(() => { e.classList.add("hide"); }, 10);
        }
    }
    gameInit() {
        this.setScore(0);
        this.topWord = HTMLActuator.TOPWORD_INIT;
        this.remove_gameOver();
    }
    actuate_grid(grid) {
        window.requestAnimationFrame(() => {
            this.clearContainer();
            grid.cells.forEach((column) => {
                column.forEach((cell) => {
                    if (cell) {
                        this.addHTMLTile(cell);
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
    addHTMLTile(tile) {
        const element = document.createElement("div");
        function pos_offset(pos, offset) { return { x: pos.x + offset, y: pos.y + offset }; }
        function tile_pos_attr(pos) { return "tile-position-" + pos.x + "-" + pos.y; }
        const pos_jsobj = pos_offset(tile.prevPos || tile.pos, 1);
        element.classList.add("tile", "tile-" + tile.value, tile_pos_attr(pos_jsobj));
        if (tile.bonus)
            element.classList.add(tile.bonus);
        element.textContent = tile.value.toUpperCase();
        if (element.textContent == "QU")
            element.textContent = "Qu";
        const tileScore = document.createElement("div");
        tileScore.classList.add("tileScore");
        tileScore.textContent = HTMLActuator.LETTER_SCORE[tile.value].toString();
        element.appendChild(tileScore);
        this.tileContainer.appendChild(element);
        window.requestAnimationFrame(() => {
            element.classList.remove(element.classList[2]);
            element.classList.add(tile_pos_attr(pos_offset(tile.pos, 1)));
        });
        if (tile.prevPos.y > 4) {
            element.classList.add("tile-new");
        }
        element.addEventListener("pointerdown", tile.pointerdown_handler.bind(tile));
        element.addEventListener("pointerenter", tile.pointerenter_handler.bind(tile));
        element.addEventListener("pointerup", tile.popinterup_handler.bind(tile));
        element.addEventListener("touchmove", tile.touchmove_handler.bind(tile));
        element.addEventListener("contextmenu", (e) => { e.preventDefault(); });
    }
    actuate_word(tiles, validity) {
        while (this.wordConstructContainer.firstChild) {
            this.wordConstructContainer.removeChild(this.wordConstructContainer.firstChild);
        }
        this.wordConstructContainer.classList.remove("finish-select");
        if (validity)
            this.wordConstructContainer.classList.replace("invalid", "valid");
        else
            this.wordConstructContainer.classList.replace("valid", "invalid");
        tiles.forEach((tile) => {
            const tilecopy = tile.cloneNode(true);
            tilecopy.removeChild(tilecopy.firstElementChild);
            tilecopy.classList.add("construct");
            this.wordConstructContainer.appendChild(tilecopy);
        });
    }
    finishSelect(validity) {
        this.applyScore(validity);
        this.wordConstructContainer.classList.add("finish-select");
    }
    actuate_calc(pure_score, letter_bonus, word_bonus) {
        while (this.calculationContainer.firstChild) {
            this.calculationContainer.removeChild(this.calculationContainer.firstChild);
        }
        this.calculationContainer.textContent = "(" + pure_score + " + " + letter_bonus + ") * " + word_bonus
            + " = ";
        const element = document.createElement("strong");
        this.recentScore = (pure_score + letter_bonus) * word_bonus;
        if (pure_score > this.turnMaxPureScore)
            this.turnMaxPureScore = this.recentScore;
        element.textContent = (this.recentScore).toString();
        this.calculationContainer.appendChild(element);
    }
    setScore(score) {
        this.scoreTotalContainer.textContent = score.toString();
        this.totalScore = score;
    }
    applyScore(validity) {
        // Top word
        if (validity) {
            this.totalScore = this.totalScore + this.recentScore;
            if (this.recentScore > this.topWord.score) {
                const construct = this.wordConstructContainer.cloneNode(true);
                construct.classList.remove("valid");
                while (this.wordRankContainer.firstChild)
                    this.wordRankContainer.removeChild(this.wordRankContainer.firstChild);
                this.topWord = Object.freeze({ score: this.recentScore, construct: construct });
                this.wordRankContainer.appendChild(construct);
                const score = document.createElement("div");
                score.classList.add("score");
                score.textContent = this.recentScore.toString();
                this.wordRankContainer.appendChild(score);
            }
        }
        else if (HTMLActuator.PUNISH_BLIND_MOVES)
            this.totalScore -= this.turnMaxPureScore / 2;
        this.turnMaxPureScore = 0;
        this.scoreTotalContainer.textContent = this.totalScore.toString();
    }
    gameOver() {
        this.scoreRating();
        setTimeout(() => { this.screen_setShow(document.querySelector(".game-over"), true); }, 400);
    }
    scoreRating() {
        let rating_res = "";
        const avg_score = this.totalScore / GameManager.MAX_TURN;
        for (const pair of HTMLActuator.RATING) {
            if (pair[0] >= avg_score)
                break;
            rating_res = pair[1];
        }
        const rating = document.createElement("div");
        rating.classList.add("rating");
        rating.textContent = rating_res;
        while (this.gameRatingContainer.firstChild) {
            this.gameRatingContainer.removeChild(this.gameRatingContainer.firstChild);
        }
        this.gameRatingContainer.appendChild(rating);
    }
    remove_gameOver() {
        this.screen_setShow(document.querySelector(".game-over"), false);
    }
    showTurn(turns, maxturn) {
        if (HTMLActuator.HIDE_CURRENT_TURN)
            turns = "--";
        console.log("turns: " + turns);
        this.turnsContainer.textContent = "" + turns + " / " + maxturn;
    }
    init() {
        const loading = document.querySelector(".game-loading");
        window.requestAnimationFrame(() => {
            this.screen_setShow(loading, true);
        });
        // Loading effect for restart
        setTimeout(() => {
            window.requestAnimationFrame(() => {
                this.screen_setShow(loading, false);
            });
        }, 50);
    }
    showValidity(bool = true) {
        if (bool)
            this.wordConstructContainer.classList.remove("hide-validity");
        else
            this.wordConstructContainer.classList.add("hide-validity");
    }
    setupGameContainerMouse() {
        // pointerup is like "static" functions, but changing these to ones cause a problem:
        //      <dragend does not fire if not on an element with proper handlers>
        this.gameContainer.addEventListener("pointerup", Tile.prototype.popinterup_handler);
        this.gameContainer.addEventListener("contextmenu", (e) => { e.preventDefault(); });
        this.gameContainer.addEventListener("touchmove", (e) => { e.preventDefault(); });
    }
    setDebug() {
        this.scoreTotalContainer.classList.add("debug");
    }
    showLevel(level) {
        this.scoreTotalContainer.classList.remove("normal", "hard", "expert");
        const levelClass = { 0: "normal", 1: "hard", 2: "expert" }[level];
        this.scoreTotalContainer.classList.add(levelClass);
    }
    howto_show(b) {
        if (b) {
            this.newgame_show(false);
        }
        this.screen_setShow(document.querySelector(".game-howto"), b);
    }
    newgame_show(b) {
        if (b) {
            this.howto_show(false);
        }
        this.screen_setShow(document.querySelector(".game-new"), b);
    }
}
//# sourceMappingURL=html_actuator.js.map