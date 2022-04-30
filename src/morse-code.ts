/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from 'vscode';

export type MorseCodeAlphabet = '.' | '-';

const MORSE_CODE_TABLE = {
	'.-': 'A',
	'-...': 'B',
	'-.-.': 'C',
	'-..': 'D',
	'.': 'E',
	'..-.': 'F',
	'--.': 'G',
	'....': 'H',
	'..': 'I',
	'.---': 'J',
	'-.-': 'K',
	'.-..': 'L',
	'--': 'M',
	'-.': 'N',
	'---': 'O',
	'.--.': 'P',
	'--.-': 'Q',
	'.-.': 'R',
	'...': 'S',
	'-': 'T',
	'..-': 'U',
	'...-': 'V',
	'.--': 'W',
	'-..-': 'X',
	'-.--': 'Y',
	'--..': 'Z',
	'.----': '1',
	'..---': '2',
	'...--': '3',
	'....-': '4',
	'.....': '5',
	'-....': '6',
	'--...': '7',
	'---..': '8',
	'----.': '9',
	'-----': '0'
} as const;


export class MorseCodeEditor {
	private morsecode: string[] = [];
	private lastTime: number = -1;
	public currentRange: vscode.Range;
	constructor(public docUri: vscode.Uri, public startRange: vscode.Range, private textEditor: vscode.TextEditor) {
		this.currentRange = startRange;
	}
	pushCode(code: MorseCodeAlphabet, range: vscode.Range) {
		this.morsecode.push(code);
		this.currentRange = this.currentRange.union(range);
		this.lastTime = Date.now();
	}
	apply() {
		const content = this.decode();
		this.morsecode = [];
		const crange = this.currentRange;
		return this.textEditor.edit(builder => {
			builder.replace(crange, content);
		});
	}
	getLastTime() {
		return this.lastTime;
	}
	decode() {
		return MORSE_CODE_TABLE[this.morsecode.join('') as (keyof typeof MORSE_CODE_TABLE)];
	}
}


export class MorseCodeEditorRecord {
	private editors = new Set<MorseCodeEditor>();
	add(editor: MorseCodeEditor) {
		this.editors.add(editor);
	}
	remove(editor: MorseCodeEditor) {
		this.editors.delete(editor);
		
	}
	removeByDoc(uri: vscode.Uri) {
		Array.from(this.editors).forEach(it => {
			if(it.docUri === uri) {
				this.editors.delete(it);
			}
		});
	}
	find(uri: vscode.Uri, range: vscode.Range) {
		for(const it of this.editors) {
			const isSameDoc = it.docUri === uri || it.docUri.toString() === uri.toString();
			if(!isSameDoc) {
				continue;
			}
			if(it.startRange.start.line === range.start.line) {
				return it;
			}
		}
	}
}