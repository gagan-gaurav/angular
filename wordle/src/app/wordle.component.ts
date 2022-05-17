import { Component, ElementRef, HostListener, QueryList, ViewChildren} from "@angular/core";
import { WORDS } from "./words";

const WORD_LEGNTH = 5;
const NUM_TRIES = 6;

const LETTERS = (() => {
	const ret: {[key: string] : boolean} = {};
	for(let charCode = 97; charCode < 97 + 26; charCode++){
		ret[String.fromCharCode(charCode)] = true;
	}
	return ret;
})();


interface Try {
	letters: Letter[];
}

interface Letter {
	text: string;
	state: LetterState;
}

enum LetterState {
	// wrong ans.
	WRONG,
	// letter is the word is a partial match, not in the right place.
	PARTIAL_MATCH,
	// letter is correct and is in the correct place.
	FULL_MATCH,
	// before the current try is submitted.
	PENDING,
}
 
 @Component({
	 selector: 'wordle',
	 templateUrl: '/wordle.component.html',
	 styleUrls: ['./wordle.component.scss'],
 })

 export class Wordle {
	@ViewChildren('tryContainer') tryContainers!: QueryList<ElementRef>;
	 // one try is one word or one row int the UI;
	readonly tries : Try[] = [];

	// msg shown in msg pannel.
	infoMsg = '';
	fadeOutInfoMessage = false;
	// condition_fr_shake = false;

	// current letter index.
	private curLetterIndex = 0;

	// current word index.
	private numSubmittedTries = 0;

	private targetWord = '';

	private targetWordLetterCounts: {[letter : string]: number} = {};

	constructor() {
		// make the initial grid.
		for (let i = 0; i < NUM_TRIES; i++){
			const letters: Letter[] = [];
			for (let j = 0; j < WORD_LEGNTH; j++){
				letters.push({text: '', state: LetterState.PENDING});
			}
			this.tries.push({letters});
		}

		// get a target word from the word list.
		const numWrods = WORDS.length;
		while(true){
			const index = Math.floor(Math.random() * numWrods);
			const word = WORDS[index];
			if(word.length === WORD_LEGNTH){
				this.targetWord = word.toLowerCase();
				break;
			}
		}

		// print the random word.
		console.log('target word', this.targetWord);

		for(const letter of this.targetWord){
			const count = this.targetWordLetterCounts[letter];
			if(count === undefined){
				this.targetWordLetterCounts[letter] = 0;
			}
			this.targetWordLetterCounts[letter]++;
		}
		console.log(this.targetWordLetterCounts);
	}

	@HostListener('document:keydown', ['$event'])
  	handleKeyboardEvent(event: KeyboardEvent) { 
		  this.handleClickKey(event.key);
  	}

	private handleClickKey(key: string){
		if(LETTERS[key.toLowerCase()]) {
			if(this.curLetterIndex < (this.numSubmittedTries + 1) * WORD_LEGNTH){
				this.setLetter(key);
				this.curLetterIndex++;
			}
		}
		else if(key === 'Backspace') {
			if(this.curLetterIndex > (this.numSubmittedTries) * WORD_LEGNTH){
				this.curLetterIndex--;
				this.setLetter('');
			}
		}
		else if(key === 'Enter') {
			this.checkCurrentTry();
		}
	}

	private setLetter(letter: string){
		const tryIndex = Math.floor(this.curLetterIndex / WORD_LEGNTH);
		const letterIndex = this.curLetterIndex - tryIndex * WORD_LEGNTH;
		this.tries[tryIndex].letters[letterIndex].text = letter;
	}

	private checkCurrentTry(){
		const curTry = this.tries[this.numSubmittedTries];
		if(curTry.letters.some(letter => letter.text === '')){
			this.showInfoMessage("not enough letters");
			return;
		}

		const wordFromCurTry = curTry.letters.map(letter => letter.text).join('').toUpperCase();
		if(!WORDS.includes(wordFromCurTry)) {
			this.showInfoMessage("not in word list");
			// this.condition_fr_shake = true;
			// shake the current row.
			const tryContainer = this.tryContainers.get(this.numSubmittedTries)?.nativeElement as
			HTMLElement;
			tryContainer.classList.add('shake');
			setTimeout(() => {
				tryContainer.classList.remove('shake');
				// this.condition_fr_shake = false;
			}, 500);
			return;
		}

		const state: LetterState[] = [];
	}

	private showInfoMessage(msg: string){
		this.infoMsg = msg;
		setTimeout(() => {
			this.fadeOutInfoMessage = true;
			setTimeout(() => {
				this.infoMsg = '';
				this.fadeOutInfoMessage = false;
			}, 500);
		}, 2000);
	}
 }