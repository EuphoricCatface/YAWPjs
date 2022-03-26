'use strict';

class GameManager {
    static MAX_TURN: number = 15;
    size: number;
    actuator: HTMLActuator;
    grid: Grid;
    score: number;
    validator: Validator;
    validator_wait_loop: number;
    turns: number;
    recent_input: SelectionInputType
    constructor(size: number, actuator: HTMLActuator) {
        this.size = size;
        this.actuator = actuator;

        this.grid = new Grid(this.size);
        this.setupGameContainerMouse();

        this.validator = new Validator();
        this.validator_wait_loop = setInterval(this.initAfterValidatorLoop.bind(this), 50);
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
        try{ if (this.validator.wordlist.size == 0) {
                throw 'not init yet';
        }}
        catch (_e){
            return;
        }
        // Set up the game
        this.gameInit()
        clearInterval(this.validator_wait_loop)
    }
    gameInit() {
        this.prepareNextTurn();
        Tile.on("sendInput", this.input.bind(this));
        Tile.on("finishSelect", this.finishSelect.bind(this));
        this.actuator.setScore(0);
        this.turns = 0;
        this.countTurns();
    }
    prepareNextTurn() {
        this.fill_prepare();
        this.calculate_bonus_new();
        this.grid.eliminateEmpty();
        this.calculate_bonus_bottom();
        this.actuator.actuate_grid(this.grid);
    }
    weightedRandom() {
        var inverse_frequency_list = [120, 40, 40, 60, 120, 30, 60, 30, 120, 15, 24, 120, 40, 120, 120, 40, 12, 120, 120, 120, 120, 30, 30, 15, 30, 12];
        var inverse_frequency_sum = 1708;

        var rand = Math.floor(Math.random() * (inverse_frequency_sum - 1));
        var result: number;

        for (var i = 0; i < inverse_frequency_list.length; i++) {
            rand -= inverse_frequency_list[i];
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
    fill_prepare() {
        var columnsEmpty = this.grid.getColumnsEmpty();
        for (var x = 0; x < this.size; x++) {
            for (var e = 0; e < columnsEmpty[x]; e++) {
                this.grid.tileAppend(x, new Tile({x: x, y: this.size + e},
                                                this.weightedRandom()));
            }
        }
    }
    actuate_word(elements: HTMLElement[], pure_score: number, letter_bonus: number, word_bonus: number) {
        this.actuator.actuate_word(elements, pure_score, letter_bonus, word_bonus);
    }
    input(inputData: SelectionInputType) {
        // inputData: tiles, elements, word
        this.recent_input = inputData;
        // console.log("input: " + this.recent_input.word);
        var word_modifier = 1;
        var pure_word_score = 0;
        var letter_bonus_score = 0;
        this.recent_input.tiles.forEach(tile => {
            var letter_bonus_modifier = 0;
            var pure_letter_score = this.actuator.letter_score[tile.value];
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

        this.actuate_word(this.recent_input.elements, pure_word_score, letter_bonus_score, word_modifier);
        });
    }
    finishSelect(_: any) {
        // inputData: tiles, elements, word
        if (!this.verify(this.recent_input.word))
            return;

        this.countTurns();
        this.recent_input.elements.forEach(
            element => { element.remove(); });
        this.recent_input.tiles.forEach(tile => {
            this.grid.coordDelete({ x: tile.pos.x, y: tile.pos.y });
        });

        this.actuator.addScore();
        this.prepareNextTurn();
    }
    countTurns() {
        if (this.turns == GameManager.MAX_TURN) {
            this.actuator.gameOver();
            return;
        }
        this.turns += 1;
        console.log("turns: " + this.turns);
        this.actuator.showTurn(this.turns, GameManager.MAX_TURN);
    }
    verify(word: string) {
        var rtn =  this.validator.validate(word);
        console.log("GM.verify: " + word + ", " + rtn);

        return rtn;
    }
    calculate_bonus_new() {
        // New tiles, letter bonuses: 90% no bonus, 6% double, 4% triple
        var columnsLength = this.grid.getColumnsLength();
        for (var i = 0; i < this.grid.size; i++) {
            for (var j = this.grid.size; j < columnsLength[i]; j++) {
                var rand = Math.floor(Math.random() * 50);
                var tile = this.grid.getTileRef({x: i, y: j});
                switch (rand) {
                    case 0:
                        tile.bonus = "triple-letter";
                    case 1: case 2: case 3:
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
            var tile = this.grid.getTileRef({x: i, y: 0});
            if (tile.bonus.includes("word"))
                continue;

            var rand = Math.floor(Math.random() * 10);
            switch (rand) {
                case 0:
                    tile.bonus = "word-none"
                    break;
                case 1: case 2: case 3:
                    tile.bonus = "triple-word";
                    break;
                default:
                    tile.bonus = "double-word";
            }
        }
    }
}
