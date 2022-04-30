import * as vscode from 'vscode';
import { updateConfig } from './config';
import { MorseCodeEditor, MorseCodeEditorRecord } from './morse-code';

// TODO: 1. localization (American Morse, Continental Gerke, International ITU)
// TODO: 2. upper case and lower case

const ENABLE_COMMAND = 'morse-code.enableMorseCode';
const DISABLE_COMMAND = 'morse-code.disableMorseCode';

export function activate(context: vscode.ExtensionContext) {
	const editorsRecord = new MorseCodeEditorRecord();

	const onChangeTextDisposor = vscode.workspace.onDidChangeTextDocument(e => {
		let timmerId: NodeJS.Timeout;
		e.contentChanges.forEach(change => {
			const range = change.range;
			switch(change.text) {
				case '.':
				case '-':
					clearTimeout(timmerId);
					break;
				default:
					return;
			}
			let editor = editorsRecord.find(e.document.uri, range);
			if(!editor) {
				editor = new MorseCodeEditor(e.document.uri, range, vscode.window.activeTextEditor!);
				editorsRecord.add(editor);
			}
			editor.pushCode(change.text, range);
			timmerId = setTimeout(() => {
				if(!editor) {
					return;
				}
				editorsRecord.remove(editor);
				editor.apply();
			}, 1000);
		});
	});
	context.subscriptions.push(
		vscode.workspace.onDidCloseTextDocument(e => {
			editorsRecord.removeByDoc(e.uri);
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
