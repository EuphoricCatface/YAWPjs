'use strict';
class GameManager {
    size;
    actuator;
    grid;
    score;
    validator;
    validator_wait_loop;
    constructor(size, actuator) {
        this.size = size;
        this.actuator = actuator;
        this.grid = new Grid(this.size);
        this.score = 0;
        this.allowDropOnGameContainer();
        this.validator = new Validator();
        this.validator_wait_loop = setInterval(this.initAfterValidatorLoop.bind(this), 50);
    }
    allowDropOnGameContainer() {
        var gameContainer = document.getElementsByClassName("game-container")[0];
        // These two are like "static" functions, but changing these to ones cause a problem:
        //      <dragend does not fire if not on an element with proper handlers>
        gameContainer.addEventListener("dragover", Tile.prototype.dragover_handler);
        gameContainer.addEventListener("drop", Tile.prototype.drop_handler);
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
        this.prepareNextTurn();
        Tile.on("finishSelect", this.input.bind(this));
        clearInterval(this.validator_wait_loop);
    }
    prepareNextTurn() {
        this.fill_prepare();
        this.calculate_bonus_new();
        this.squash();
        this.calculate_bonus_bottom();
        this.actuate();
    }
    weightedRandom() {
        var inverse_frequency_list = [120, 40, 40, 60, 120, 30, 60, 30, 120, 15, 24, 120, 40, 120, 120, 40, 12, 120, 120, 120, 120, 30, 30, 15, 30, 12];
        var inverse_frequency_sum = 1708;
        var rand = Math.floor(Math.random() * (inverse_frequency_sum - 1));
        var result;
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
                this.grid.tileAppend(x, new Tile({ x: x, y: this.size + e }, this.weightedRandom()));
            }
        }
    }
    actuate() {
        this.actuator.actuate(this.grid);
        this.actuator.setScore(this.score);
    }
    squash() {
        this.grid.eliminateEmpty();
    }
    input(inputData) {
        // inputData: tiles, elements, word
        if (!this.verify(inputData.word))
            return;
        var word_modifier = 1;
        var pure_word_score = 0;
        var letter_bonus_score = 0;
        inputData.elements.forEach(element => {
            element.remove();
        });
        inputData.tiles.forEach(tile => {
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
            this.grid.coordDelete({
                x: tile.pos.x,
                y: tile.pos.y
            });
        });
        this.score += (pure_word_score + letter_bonus_score) * word_modifier;
        this.prepareNextTurn();
    }
    verify(word) {
        var rtn = this.validator.validate(word);
        console.log("GM.verify: " + word + ", " + rtn);
        return rtn;
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
            var rand = Math.floor(Math.random() * 10);
            var tile = this.grid.getTileRef({ x: i, y: 0 });
            switch (rand) {
                case 0:
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
}
//# sourceMappingURL=game_manager.js.map