'use strict';
class Validator {
    wordlist;
    constructor() {
        const fetch_req = new Request('words_alpha.txt');
        this.wordlist = new Set;
        var lines;
        fetch(fetch_req)
            .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status ${response.status}`);
            }
            return response.text();
        })
            .then((response_text) => {
            return lines = response_text.split('\n');
        })
            .then((response_lines) => {
            for (var line in response_lines) {
                if (line.startsWith("#"))
                    continue;
                if (line.length - [...line.matchAll(/Qu/gi)].length < 3)
                    continue;
                this.wordlist.add(line);
            }
            console.log(this.wordlist.size);
        });
    }
}
//# sourceMappingURL=validator.js.map