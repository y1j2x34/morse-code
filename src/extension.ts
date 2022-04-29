import * as vscode from 'vscode';
import { updateConfig } from './config';

type MorseCodeAlphabet = '.' | '-';

let documentChangeListenerDisposor: vscode.Disposable;
let toggleCommandDisposor: vscode.Disposable;


const ENABLE_COMMAND = 'morse-code.enableMorseCode';
const DISABLE_COMMAND = 'morse-code.disableMorseCode';

class MorseCodeEditor {
	private morsecode: string[] = [];
	private lastTime: number = -1;
	private currentRange: vscode.Range;
	constructor(public docUri: vscode.Uri, public startRange: vscode.Range ) {
		this.currentRange = startRange;
	}
	pushCode(code: MorseCodeAlphabet, range: vscode.Range) {
		this.morsecode.push(code);
		this.currentRange = this.currentRange.union(range);
		this.lastTime = Date.now();
	}
	delete(text: string, range: vscode.Range) {
		
	}
	getLastTime() {
		return this.lastTime;
	}
	decode() {
		return 'H';
	}
}

export function activate(context: vscode.ExtensionContext) {
	let editors: MorseCodeEditor[] = [];

	const findEditor = (uri: vscode.Uri, range: vscode.Range) => {
		return editors.find(it => {
			const isSameDoc = it.docUri === uri || it.docUri.toString() === uri.toString();
			if(!isSameDoc) {
				return;
			}
			return it.startRange.start.line === range.start.line;
		});
	};

	const onChangeTextDisposor = vscode.workspace.onDidChangeTextDocument(e => {
		
		e.contentChanges.forEach(change => {
			const range = change.range;
			switch(change.text) {
				case '.':
				case '-':
					break;
				default:
					return;
			}
			let editor = findEditor(e.document.uri, range);
			if(!editor) {
				editor = new MorseCodeEditor(e.document.uri, range);
				editors.push(editor);
			}
			// change.range.start.
			// vscode.window.activeTextEditor?.edit(eb => {
			// 	change.range.start.
			// });
		});
	});
	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(e => {
	
		})
	);
	
	const setEnabled = (value:boolean) => {
		const config = vscode.workspace.getConfiguration('morsecode');
		updateConfig('enabled', value, config);
	};

	context.subscriptions.push(onChangeTextDisposor);
	context.subscriptions.push(
		vscode.commands.registerCommand(ENABLE_COMMAND, () => setEnabled(true))
	);
	context.subscriptions.push(
		vscode.commands.registerCommand(DISABLE_COMMAND, () => setEnabled(false))
	);
}

// this method is called when your extension is deactivated
export function deactivate() {}
