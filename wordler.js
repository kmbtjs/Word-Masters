const letters = document.querySelectorAll('.scoreboard-letter');
const loadingBar = document.querySelector('.info-bar');
const invalidWord = document.querySelector('.invalid-word');
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init() {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    const response = await fetch("https://words.dev-apis.com/word-of-the-day");
    const responseObject = await response.json();
    word = responseObject.word.toUpperCase();
    wordChars = word.split("");
    let done = false;
    setLoading(false);
    isLoading = false;

    function isLetter(letter) {
        return /^[a-zA-Z]$/.test(letter);
    }

    function addLetter(letter) {
        if (currentGuess.length < ANSWER_LENGTH) {
            currentGuess += letter;
        } else {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (!currentGuess.length === ANSWER_LENGTH) {
            return;
        }

        isLoading = true;
        setLoading(true);
        const response = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({ word: currentGuess })
        })

        const responseObject = await response.json();
        const { validWord } = responseObject;

        setLoading(false);
        isLoading = false;

        if (!validWord) {
            markInvalidGuess();
            return;
        }

        const guessChars = currentGuess.split("");
        const map = makeMap(wordChars);
        console.log(map);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessChars[i] === wordChars[i]) {
                //mark as correct
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[guessChars[i]]--;
            }
        }

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (guessChars[i] === wordChars[i]) {

            } else if (wordChars.includes(guessChars[i]) && map[guessChars[i]] > 0) {
                //mark as close
                letters[ANSWER_LENGTH * currentRow + i].classList.add("close");
                map[guessChars[i]]--;
            } else {
                //mark as wrong
                letters[ANSWER_LENGTH * currentRow + i].classList.add("wrong");
            }
        }

        currentRow++;

        if (currentRow === ROUNDS) {
            alert(`you lose, the word was ${word}`);
            done = true;
        } else if (currentGuess === word) {
            alert('you win');
            document.querySelector('.brand').classList.add('winner');
            done = true;
            return;
        }

        currentGuess = '';
    }

    function backSpace() {
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidGuess() {
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            letters[ANSWER_LENGTH * currentRow + i].classList.remove("invalid");

            setTimeout(() => {
                letters[ANSWER_LENGTH * currentRow + i].classList.add("invalid");
            }, 100);
        }
    }

    function setLoading(isLoading) {
        loadingBar.classList.toggle('show', isLoading);
    }

    function makeMap(array) {
        const object = {};
        for (let i = 0; i < array.length; i++) {
            const letter = array[i];
            if (object[letter]) {
                object[letter]++;
            } else {
                object[letter] = 1;
            }
        }

        return object;
    }

    document.addEventListener('keydown', function handleKeyPress(event) {
        if (done || isLoading) {
            return;
        } else {

        }

        const action = event.key;
        if (action === 'Enter') {
            commit();
        } else if (action === 'Backspace') {
            backSpace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase())
        } else {

        }
    });
};

init();