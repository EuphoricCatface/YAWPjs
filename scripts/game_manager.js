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
        this.setup();
        Tile.on("finishSelect", this.input.bind(this));
        clearInterval(this.validator_wait_loop);
    }
    // Set up the game
    setup() {
        this.fill_prepare();
        this.squash();
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
                this.grid.tileAppend(x, new Tile({
                    x: x,
                    y: this.size + e
                }, this.weightedRandom()));
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
        inputData.elements.forEach(element => {
            element.remove();
        });
        inputData.tiles.forEach(element => {
            this.score += this.actuator.letter_score[element.value];
            this.grid.coordDelete({
                x: element.pos.x,
                y: element.pos.y
            });
        });
        this.fill_prepare();
        this.squash();
        this.actuate();
    }
    verify(word) {
        var rtn = this.validator.validate(word);
        console.log("GM.verify: " + word + ", " + rtn);
        return rtn;
    }
}
//# sourceMappingURL=game_manager.js.map