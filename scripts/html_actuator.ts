'use strict';

class HTMLActuator {
    static HIDE_CURRENT_TURN = false;
    static PUNISH_BLIND_MOVES = false;
    static LETTER_SCORE: Record<string, number> = {
        "a": 1, "b": 3, "c": 3, "d": 2, "e": 1,
        "f": 4, "g": 2, "h": 4, "i": 1, "j": 8,
        "k": 5, "l": 1, "m": 3, "n": 1, "o": 1,
        "p": 3, "qu": 10, "r": 1, "s": 1, "t": 1,
        "u": 1, "v": 4, "w": 4, "x": 8, "y": 4, "z": 10
    };
    static TOPWORD_INIT = Object.freeze({score: 0, construct: null});
    tileContainer: Element;
    gameContainer: Element;
    wordConstructContainer: Element;
    calculationContainer: Element;
    scoreTotalContainer: Element;
    turnsContainer: Element;
    wordRankContainer: Element;

    recentScore: number;
    turnMaxPureScore: number;
    totalScore: number;
    topWord: any;
    constructor() {
        this.tileContainer = document.getElementsByClassName("tile-container")[0];
        this.gameContainer = document.getElementsByClassName("game-container")[0];
        this.wordConstructContainer = document.getElementsByClassName("word-construct-container")[0];
        this.calculationContainer = document.getElementsByClassName("calculation-container")[0];
        this.scoreTotalContainer = document.getElementsByClassName("score-total-container")[0];
        this.turnsContainer = document.getElementsByClassName("turns-container")[0];
        this.wordRankContainer = document.getElementsByClassName("word-rank-container")[0];

        this.recentScore = 0;
        this.turnMaxPureScore = 0;
        this.totalScore = 0;
        this.topWord = HTMLActuator.TOPWORD_INIT;
    }
    screen_setShow(e: Element, b: boolean) {
        if (b) {
            e.classList.remove("hide");
            e.classList.add("show");
        }
        else {
            e.classList.remove("show");
            setTimeout(() => {e.classList.add("hide");}, 10);
        }
    }
    actuate_grid(grid: Grid) {
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
    addHTMLTile(tile: Tile) {
        const element = document.createElement("div");

        function pos_offset(pos:CoordType, offset: number) { return { x: pos.x + offset, y: pos.y + offset }; }
        function tile_pos_attr(pos: CoordType) { return "tile-position-" + pos.x + "-" + pos.y; }

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

        element.addEventListener("contextmenu", (e)=>{e.preventDefault();});
    }
    actuate_word(tiles: HTMLElement[], validity: boolean) {
        while (this.wordConstructContainer.firstChild) {
            this.wordConstructContainer.removeChild(this.wordConstructContainer.firstChild);
        }
        this.wordConstructContainer.classList.remove("finish-select");
        if (validity)
            this.wordConstructContainer.classList.replace("invalid", "valid");
        else
            this.wordConstructContainer.classList.replace("valid", "invalid");
        tiles.forEach((tile) => {
            const tilecopy = (tile.cloneNode(true) as HTMLElement);
            tilecopy.removeChild(tilecopy.firstElementChild);
            tilecopy.classList.add("construct");
            this.wordConstructContainer.appendChild(tilecopy);
        });
    }
    finishSelect(validity: boolean) {
        this.applyScore(validity);
        this.wordConstructContainer.classList.add("finish-select");
    }
    actuate_calc(pure_score: number, letter_bonus: number, word_bonus: number) {
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
    setScore(score: number) {
        this.scoreTotalContainer.textContent = score.toString();
        this.totalScore = score;
    }
    applyScore(validity: boolean) {
        if (validity) {
            this.totalScore = this.totalScore + this.recentScore;
            if (this.recentScore > this.topWord.score) {
                const construct = this.wordConstructContainer.cloneNode(true) as HTMLElement;
                construct.classList.remove("valid");
                while(this.wordRankContainer.firstChild)
                    this.wordRankContainer.removeChild(this.wordRankContainer.firstChild);
                this.topWord = Object.freeze({score: this.recentScore, construct: construct});
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
        const gameOver = document.getElementsByClassName("game-over")[0];
        setTimeout( () => {this.screen_setShow(gameOver, true);}, 400);
    }
    remove_gameOver() {
        const gameOver = document.getElementsByClassName("game-over")[0];
        this.screen_setShow(gameOver, false);
    }
    showTurn(turns: number, maxturn: number) {
        if (HTMLActuator.HIDE_CURRENT_TURN)
            (turns as unknown as string) = "--";
        console.log("turns: " + turns);
        this.turnsContainer.textContent = "" + turns + " / " + maxturn;
    }
    init() {
        const loading = document.getElementsByClassName("game-loading")[0];
        window.requestAnimationFrame(()=>{
            this.screen_setShow(loading, true);
        });
        // Loading effect for restart
        setTimeout(()=>{window.requestAnimationFrame(()=>{
            this.screen_setShow(loading, false);
        });}, 50);
        this.topWord = HTMLActuator.TOPWORD_INIT;
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
        this.gameContainer.addEventListener("contextmenu", (e)=>{e.preventDefault();});
        this.gameContainer.addEventListener("touchmove", (e)=>{e.preventDefault();});
    }
    setDebug() {
        this.scoreTotalContainer.classList.add("debug");
    }
    showLevel(level: number) {
        this.scoreTotalContainer.classList.remove("normal", "hard", "expert");
        const levelClass = {0: "normal", 1: "hard", 2: "expert"}[level];
        this.scoreTotalContainer.classList.add(levelClass);
    }
}
