'use strict';
class GameManager {
    static MAX_TURN = 15;
    static COMPLEMENTARY_RAND_ON_INIT = false;
    static COUNT_TURNS_ON_INVALID_MOVE = false;
    size;
    actuator;
    grid;
    score;
    validator;
    validator_wait_loop;
    turns;
    recent_input;
    constructor(size, actuator) {
        this.size = size;
        this.actuator = actuator;
        this.grid = new Grid(this.size);
        this.setupGameContainerMouse();
        this.validator = new Validator();
        this.validator_wait_loop = setInterval(this.initAfterValidatorLoop.bind(this), 100);
    }
    setupGameContainerMouse() {
        var gameContainer = document.getElementsByClassName("game-container")[0];
        // These three are like "static" functions, but changing these to ones cause a problem:
        //      <dragend does not fire if not on an element with proper handlers>
        gameContainer.addEventListener("dragover", Tile.prototype.dragover_handler);
        gameContainer.addEventListener("drop", Tile.prototype.drop_handler);
        gameContainer.addEventListener("contextmenu", Tile.prototype.contextmenu_handler);
    }
    initAfterValidatorLoop() {
        console.log("init loop");
        try {
            if (this.validator.wordlist.size == 0) {
                throw 'not init yet';
            }
        }
        catch (_e) {
            return;
        }
        // Set up the game
        this.actuator.loaded();
        Tile.on("sendInput", this.input.bind(this));
        Tile.on("finishSelect", this.finishSelect.bind(this));
        Tile.on("DEBUG", this.test_debug.bind(this));
        this.gameInit();
        clearInterval(this.validator_wait_loop);
    }
    gameInit() {
        this.grid.build();
        this.prepareNextTurn(true);
        this.actuator.setScore(0);
        this.turns = 0;
        this.countTurns();
    }
    prepareNextTurn(init = false) {
        this.fill_prepare(init);
        this.calculate_bonus_new();
        this.grid.eliminateEmpty();
        this.calculate_bonus_bottom();
        this.actuator.actuate_grid(this.grid);
    }
    weightedRandom(init = false) {
        const INV_FREQ_SUM = 1708;
        const INV_FREQ_LIST = [
            120, 40, 40, 60, 120,
            30, 60, 30, 120, 15,
            24, 120, 40, 120, 120,
            40, 12, 120, 120, 120,
            120, 30, 30, 15, 30, 12 // u-z
        ];
        const COMP_FREQ_SUM = 199;
        const COMP_FREQ_LIST = [
            10, 8, 8, 9, 10,
            7, 9, 7, 10, 3,
            6, 10, 8, 10, 10,
            8, 1, 10, 10, 10,
            10, 7, 7, 3, 7, 1 // u-z
        ];
        var alter = init && GameManager.COMPLEMENTARY_RAND_ON_INIT;
        if (alter)
            console.log("using alternative random...");
        var rand = Math.floor(Math.random() * (alter ? COMP_FREQ_SUM : INV_FREQ_SUM - 1));
        var result;
        for (var i = 0; i < (alter ? COMP_FREQ_LIST : INV_FREQ_LIST).length; i++) {
            rand -= (alter ? COMP_FREQ_LIST : INV_FREQ_LIST)[i];
            if (rand < 0) {
                result = i;
                break;
            }
        }
        var char = String.fromCharCode("a".charCodeAt(0) + result);
        if (char == "q")
            char = "qu";
        return char;
    }
    fill_prepare(init = false) {
        var columnsEmpty = this.grid.getColumnsEmpty();
        for (var x = 0; x < this.size; x++) {
            for (var e = 0; e < columnsEmpty[x]; e++) {
                this.grid.tileAppend(x, new Tile({ x: x, y: this.size + e }, this.weightedRandom(init)));
            }
        }
    }
    input(inputData) {
        // inputData: tiles, elements, word
        this.recent_input = inputData;
        // console.log("input: " + this.recent_input.word);
        var word_modifier = 1;
        var pure_word_score = 0;
        var letter_bonus_score = 0;
        this.recent_input.tiles.forEach(tile => {
            var letter_bonus_modifier = 0;
            var pure_letter_score = HTMLActuator.LETTER_SCORE[tile.value];
            if (tile.bonus == "double-letter")
                letter_bonus_modifier = 1;
            if (tile.bonus == "triple-letter")
                letter_bonus_modifier = 2;
            if (tile.bonus == "double-word" && word_modifier != 3)
                word_modifier = 2;
            if (tile.bonus == "triple-word")
                word_modifier = 3;
            pure_word_score += pure_letter_score;
            letter_bonus_score += pure_letter_score * letter_bonus_modifier;
        });
        this.actuator.actuate_calc(pure_word_score, letter_bonus_score, word_modifier);
        var validity = this.validator.validate(this.recent_input.word);
        this.actuator.actuate_word(this.recent_input.elements, validity);
    }
    finishSelect() {
        // inputData: tiles, elements, word
        var validity = this.validator.validate(this.recent_input.word);
        this.actuator.finishSelect(validity);
        this.countTurns(validity);
        if (!validity)
            return;
        this.recent_input.elements.forEach(element => { element.remove(); });
        this.recent_input.tiles.forEach(tile => {
            this.grid.coordDelete({ x: tile.pos.x, y: tile.pos.y });
        });
        this.prepareNextTurn();
    }
    countTurns(validity = true) {
        if (this.turns == GameManager.MAX_TURN) {
            this.actuator.gameOver();
            return;
        }
        if (!(validity || GameManager.COUNT_TURNS_ON_INVALID_MOVE))
            return;
        this.turns += 1;
        this.actuator.showTurn(this.turns, GameManager.MAX_TURN);
    }
    calculate_bonus_new() {
        // New tiles, letter bonuses: 90% no bonus, 6% double, 4% triple
        var columnsLength = this.grid.getColumnsLength();
        for (var i = 0; i < this.grid.size; i++) {
            for (var j = this.grid.size; j < columnsLength[i]; j++) {
                var rand = Math.floor(Math.random() * 50);
                var tile = this.grid.getTileRef({ x: i, y: j });
                switch (rand) {
                    case 0:
                        tile.bonus = "triple-letter";
                    case 1:
                    case 2:
                    case 3:
                        tile.bonus = "double-letter";
                    default:
                        break;
                }
            }
        }
    }
    calculate_bonus_bottom() {
        // Bottom row, word bonuses: 10% no bonus, 60% double, 30% triple
        for (var i = 0; i < this.grid.size; i++) {
            var tile = this.grid.getTileRef({ x: i, y: 0 });
            if (tile.bonus.includes("word"))
                continue;
            var rand = Math.floor(Math.random() * 10);
            switch (rand) {
                case 0:
                    tile.bonus = "word-none";
                    break;
                case 1:
                case 2:
                case 3:
                    tile.bonus = "triple-word";
                    break;
                default:
                    tile.bonus = "double-word";
            }
        }
    }
    test_debug(s) {
        var debugMap = {
            "restart": () => { setTimeout(this.gameInit.bind(this), 100); },
            "initcomp-toggle": () => { GameManager.COMPLEMENTARY_RAND_ON_INIT = !GameManager.COMPLEMENTARY_RAND_ON_INIT; },
            "hide-validity": () => { this.actuator.showValidity(false); },
            "show-validity": () => { this.actuator.showValidity(true); },
            "count-invalid-toggle": () => { GameManager.COUNT_TURNS_ON_INVALID_MOVE = !GameManager.COUNT_TURNS_ON_INVALID_MOVE; },
            "hide-turns-toggle": () => { HTMLActuator.HIDE_CURRENT_TURN = !HTMLActuator.HIDE_CURRENT_TURN; },
            "punish-blind-toggle": () => { HTMLActuator.PUNISH_BLIND_MOVES = !HTMLActuator.PUNISH_BLIND_MOVES; }
        };
        if (!debugMap.hasOwnProperty(s)) {
            console.log("Unknown debug command");
            return;
        }
        debugMap[s]();
    }
}
//# sourceMappingURL=game_manager.js.map