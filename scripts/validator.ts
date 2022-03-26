'use strict';
/* Debug
interface Window {
    wordlist: Set<string>
}
*/
class Validator {
    wordlist: Set<string>;
    constructor() {
        const fetch_req = new Request('words_alpha.txt');
        this.wordlist = new Set;
        var lines: string[];
        
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
        .then((response_lines) =>{
            // console.log(response_lines)
            for (var line of response_lines) {
                line = line.trim();
                if (line.startsWith("#"))
                    continue;
                if (line.length - [...line.matchAll(/Qu/gi)].length < 3)
                    continue;
                
                this.wordlist.add(line)
            }
            // window.wordlist = this.wordlist  // Debug
        });
    }
    validate(word: string) {
        var rtn = this.wordlist.has(word.toLowerCase())
        //console.log("Validate: " + word + ", " + rtn);
        return rtn;
    }
}
