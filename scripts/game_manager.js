'use strict';
class GameManager {
    static MAX_TURN = 15;
    static COMPLEMENTARY_RAND_ON_INIT = false;
    static TURNS_COUNTED_ON_INVALID_MOVE = false;
    static DETERMINISTIC_BOTTOM_BONUS = false;
    static COMPOUND_WORD_BONUS = false;
    static TRIPLE_WORD_DETERMINE_COUNT = null;
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
        this.actuator.setupGameContainerMouse();
        this.validator = new Validator();
        this.validator_wait_loop = setInterval(this.initAfterValidatorLoop.bind(this), 100);
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
        inputManager.on("sendInput", this.input.bind(this));
        inputManager.on("finishSelect", this.finishSelect.bind(this));
        inputManager.on("DEBUG", this.test_debug.bind(this));
        inputManager.on("level", this.level.bind(this));
        this.gameInit();
        clearInterval(this.validator_wait_loop);
    }
    gameInit() {
        const init = true;
        this.actuator.init();
        this.grid.build();
        this.prepareNextTurn(init);
        this.actuator.setScore(0);
        this.turns = 0;
        this.countTurns();
        this.actuator.remove_gameOver();
    }
    prepareNextTurn(init = false) {
        this.fill_prepare(init);
        this.randomize_bonus_new();
        this.grid.eliminateEmpty();
        if (GameManager.DETERMINISTIC_BOTTOM_BONUS)
            this.determine_bonus_bottom();
        else
            this.randomize_bonus_bottom();
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
        const alter = init && GameManager.COMPLEMENTARY_RAND_ON_INIT;
        if (alter)
            console.log("using alternative random...");
        let rand = Math.floor(Math.random() * (alter ? COMP_FREQ_SUM : INV_FREQ_SUM - 1));
        let result;
        for (let i = 0; i < (alter ? COMP_FREQ_LIST : INV_FREQ_LIST).length; i++) {
            rand -= (alter ? COMP_FREQ_LIST : INV_FREQ_LIST)[i];
            if (rand < 0) {
                result = i;
                break;
            }
        }
        let char = String.fromCharCode("a".charCodeAt(0) + result);
        if (char == "q")
            char = "qu";
        return char;
    }
    fill_prepare(init = false) {
        const columnsEmpty = this.grid.getColumnsEmpty();
        for (let x = 0; x < this.size; x++) {
            for (let e = 0; e < columnsEmpty[x]; e++) {
                this.grid.tileAppend(x, new Tile({ x: x, y: this.size + e }, this.weightedRandom(init)));
            }
        }
    }
    input(inputData) {
        // inputData: tiles, elements, word
        this.recent_input = inputData;
        // console.log("input: " + this.recent_input.word);
        let word_modifier = 1;
        let pure_word_score = 0;
        let letter_bonus_score = 0;
        if (GameManager.COMPOUND_WORD_BONUS)
            this.recent_input.tiles.forEach(tile => {
                let letter_bonus_modifier = 0;
                const pure_letter_score = HTMLActuator.LETTER_SCORE[tile.value];
                if (tile.bonus == "double-letter")
                    letter_bonus_modifier = 1;
                if (tile.bonus == "triple-letter")
                    letter_bonus_modifier = 2;
                if (tile.bonus == "double-word")
                    word_modifier *= 2;
                if (tile.bonus == "triple-word")
                    word_modifier *= 3;
                pure_word_score += pure_letter_score;
                letter_bonus_score += pure_letter_score * letter_bonus_modifier;
            });
        else
            this.recent_input.tiles.forEach(tile => {
                let letter_bonus_modifier = 0;
                const pure_letter_score = HTMLActuator.LETTER_SCORE[tile.value];
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
        const validity = this.validator.validate(this.recent_input.word);
        this.actuator.actuate_word(this.recent_input.elements, validity);
    }
    finishSelect() {
        // inputData: tiles, elements, word
        const validity = this.validator.validate(this.recent_input.word);
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
        if (!(validity || GameManager.TURNS_COUNTED_ON_INVALID_MOVE))
            return;
        // Do not count a turn if input is only one letter
        if (GameManager.TURNS_COUNTED_ON_INVALID_MOVE && this.recent_input.tiles.length == 1)
            return;
        if (this.turns == GameManager.MAX_TURN) {
            this.actuator.gameOver();
            return;
        }
        this.turns += 1;
        this.actuator.showTurn(this.turns, GameManager.MAX_TURN);
    }
    randomize_bonus_new() {
        // New tiles, letter bonuses: 86.6% no bonus, 10% double, 3.3% triple
        const columnsLength = this.grid.getColumnsLength();
        for (let i = 0; i < this.grid.size; i++) {
            for (let j = this.grid.size; j < columnsLength[i]; j++) {
                const rand = Math.floor(Math.random() * 30);
                const tile = this.grid.getTileRef({ x: i, y: j });
                switch (rand) {
                    case 0:
                        tile.bonus = "triple-letter";
                        break;
                    case 1:
                    case 2:
                    case 3:
                        tile.bonus = "double-letter";
                        break;
                    default:
                        break;
                }
            }
        }
    }
    randomize_bonus_bottom() {
        // Bottom row, word bonuses: 10% no bonus, 60% double, 30% triple
        for (let i = 0; i < this.grid.size; i++) {
            const tile = this.grid.getTileRef({ x: i, y: 0 });
            if (tile.bonus.includes("word"))
                continue;
            const rand = Math.floor(Math.random() * 10);
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
    determine_bonus_bottom() {
        // 80% double, and triple in a random place
        let triple_count = 0;
        for (let i = 0; i < this.grid.size; i++) {
            const tile = this.grid.getTileRef({ x: i, y: 0 });
            if (tile.bonus == "triple-word")
                triple_count++;
            if (tile.bonus.includes("word"))
                continue;
            const rand = Math.floor(Math.random() * 5);
            switch (rand) {
                case 0:
                    tile.bonus = "word-none";
                    break;
                default:
                    tile.bonus = "double-word";
            }
        }
        while (triple_count < GameManager.TRIPLE_WORD_DETERMINE_COUNT) {
            const tile = this.grid.getTileRef({ x: Math.floor(Math.random() * 5), y: 0 });
            if (tile.bonus == "triple-word")
                continue;
            tile.bonus = "triple-word";
            triple_count++;
        }
    }
    test_debug(s) {
        this.actuator.setDebug();
        const debugMap = {
            "restart": () => { setTimeout(this.gameInit.bind(this), 100); },
            "initcomp-toggle": () => { GameManager.COMPLEMENTARY_RAND_ON_INIT = !GameManager.COMPLEMENTARY_RAND_ON_INIT; },
            "hide-validity": () => { this.actuator.showValidity(false); },
            "show-validity": () => { this.actuator.showValidity(true); },
            "count-invalid-toggle": () => { GameManager.TURNS_COUNTED_ON_INVALID_MOVE = !GameManager.TURNS_COUNTED_ON_INVALID_MOVE; },
            "hide-turns-toggle": () => { HTMLActuator.HIDE_CURRENT_TURN = !HTMLActuator.HIDE_CURRENT_TURN; },
            "punish-blind-toggle": () => { HTMLActuator.PUNISH_BLIND_MOVES = !HTMLActuator.PUNISH_BLIND_MOVES; },
            "deterministic-bottom-bonus-toggle": () => { GameManager.DETERMINISTIC_BOTTOM_BONUS = !GameManager.DETERMINISTIC_BOTTOM_BONUS; },
            "compound-word-bonus-toggle": () => { GameManager.COMPOUND_WORD_BONUS = !GameManager.COMPOUND_WORD_BONUS; },
            "level-normal": () => { this.level(0); },
            "level-hard": () => { this.level(1); },
            "level-expert": () => { this.level(2); }
        };
        if (!debugMap.hasOwnProperty(s)) {
            console.log("Unknown debug command");
            return;
        }
        debugMap[s]();
    }
    level(level) {
        if (level == 0) {
            this.actuator.showValidity(true);
            GameManager.TURNS_COUNTED_ON_INVALID_MOVE = false;
            HTMLActuator.HIDE_CURRENT_TURN = false;
            HTMLActuator.PUNISH_BLIND_MOVES = false;
            GameManager.DETERMINISTIC_BOTTOM_BONUS = false;
            GameManager.COMPOUND_WORD_BONUS = false;
            GameManager.TRIPLE_WORD_DETERMINE_COUNT = null;
            setTimeout(this.gameInit.bind(this), 100);
        }
        else if (level == 1) {
            this.actuator.showValidity(false);
            GameManager.TURNS_COUNTED_ON_INVALID_MOVE = false;
            HTMLActuator.HIDE_CURRENT_TURN = false;
            HTMLActuator.PUNISH_BLIND_MOVES = true;
            GameManager.DETERMINISTIC_BOTTOM_BONUS = true;
            GameManager.COMPOUND_WORD_BONUS = false;
            GameManager.TRIPLE_WORD_DETERMINE_COUNT = 2;
            setTimeout(this.gameInit.bind(this), 100);
        }
        else if (level == 2) {
            this.actuator.showValidity(false);
            HTMLActuator.PUNISH_BLIND_MOVES = false;
            GameManager.TURNS_COUNTED_ON_INVALID_MOVE = true;
            HTMLActuator.HIDE_CURRENT_TURN = true;
            HTMLActuator.PUNISH_BLIND_MOVES = false;
            GameManager.DETERMINISTIC_BOTTOM_BONUS = true;
            GameManager.COMPOUND_WORD_BONUS = true;
            GameManager.TRIPLE_WORD_DETERMINE_COUNT = 1;
            setTimeout(this.gameInit.bind(this), 100);
        }
        else {
            this.test_debug("");
            return;
        }
        this.actuator.showLevel(level);
    }
}
//# sourceMappingURL=game_manager.js.map