const vscode = require('vscode');
const DB = require('./source/db');
const path = require("path");
const fs = require("fs");
const TableText = require('./source/tableText');
const TableTexts = require('./source/tableTexts');
const config = require('./config.json');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	const gTableTexts = new TableTexts();

	let openFileInViewColumnTwo = filePath => {
		const options = {
			preview: false,
			viewColumn: vscode.ViewColumn.Two
		};
		vscode.window.showTextDocument(vscode.Uri.file(filePath), options);
	}

	let getAllText = () => {
		const editor = vscode.window.activeTextEditor
		let docName = editor.document.fileName;
		docName = ((docName.split(path.sep)).slice(-1))[0];
		docName = (docName.split('.'))[0];
		const text = editor.document.getText();

		return [docName, text];
	}

	let dbProcess = (sqlStr, name) => {
		let db = new DB();
		db.connect(config.DBConfig);
		let outPath = config.outSQLPath;

		let sqlAry = new Array()
		let nameAry = new Array();
		let sqlAryLen = 0;
		let nameAryLen = 0;

		if (sqlStr instanceof Array) {
			sqlAryLen = sqlStr.length;
		}
		if (name instanceof Array) {
			nameAryLen = name.length;
		}

		if (sqlAryLen == nameAryLen) {
			if (sqlAryLen == 0) {
				//均不是数组，创建一个表的情况
				sqlAry.push(sqlStr);
				nameAry.push(name);
			} else {
				//都是数组，创建多个表的情况
				sqlAry = sqlStr;
				nameAry = name;
			}
		} else if (sqlAryLen > nameAryLen && nameAryLen == 0) {// name不是数组，建立一个表外键的情况
			sqlAry = sqlStr;
			for (let i = 0; i < sqlAryLen; i++) {
				nameAry.push(name);
			}
		} else { return; }

		try {
			let res = null;
			for (let i = 0; i < sqlAry.length; i++) {
				const sqlStr = sqlAry[i];
				const name = nameAry[i];

				if (outPath != null && outPath != "") {
					let fileName = path.join(outPath, name + ".sql");
					try {
						let fd = fs.openSync(fileName, 'a');
						fs.appendFileSync(fd, sqlStr + '\n');
						fs.closeSync(fd);
					} catch (error) {
						vscode.window.showErrorMessage(error);
					}

				}

				db.execute(sqlStr);
			}
		} catch (error) {
			vscode.window.showErrorMessage(error.toString());
		}

		db.close();
		vscode.window.showInformationMessage("SqlBuilder processing finished!\n处理完成！");

	}

	let hello_cb = () => {
		vscode.window.showInformationMessage('config 配置详情:' + JSON.stringify(config));
		vscode.window.showInformationMessage('Hello! Welcome to use SQLBuilder! 你好, 欢迎使用SQLBuilder');
	}

	let hello = vscode.commands.registerCommand('sql-builder.hello', hello_cb);

	let executeFile = type => {
		let errorRow = null;
		let tableText = new TableText();
		const res = getAllText();

		tableText.create(res[1], res[0]);
		errorRow = tableText.execute(type, config.PKGenStra);

		if (errorRow != null) {
			vscode.window.showErrorMessage("Error: in row \"" + errorRow + "\"");
			return;
		}

		switch (type) {
			case 1:
				dbProcess(tableText.getSqlConStr(), res[0]);
				break;
			case 2:
				dbProcess(tableText.getSqlFKAry(), res[0]);
				break;
			default:
				break;
		}
	}

	let excute_cb = () => { executeFile(1); }

	let execute = vscode.commands.registerCommand('sql-builder.execute', excute_cb);

	let executeFk_cb = () => { executeFile(2); }

	let executeFk = vscode.commands.registerCommand('sql-builder.execute_fk', executeFk_cb);

	let showConfig_cb = () => { openFileInViewColumnTwo(__dirname + '/config.json'); }

	let showConfig = vscode.commands.registerCommand('sql-builder.config', showConfig_cb);

	let showExample_cb = () => { openFileInViewColumnTwo(__dirname + '/user_table.txt'); }

	let showExample = vscode.commands.registerCommand('sql-builder.example', showExample_cb);

	let executeTableTexts = fPath => {
		gTableTexts.readFiles(fPath);
		gTableTexts.execute(config.PKGenStra);
		vscode.window.showInformationMessage('Directory has been loaded! 目录\"' + fPath  +'\"已被加载!');
	}

	let handAllFiles_cb = () => {
		vscode.window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: true,
			filters: {
				'ALL Files': ['*']
			},
			openLabel: 'OpenFolder 打开目录'
		}).then(msg => { if (msg) { executeTableTexts(msg[0].fsPath); } });
	}

	let loadPath = vscode.commands.registerCommand('sql-builder.dir', handAllFiles_cb);

	let exutePath_cb = () => {
		if (gTableTexts.hadExc){
			dbProcess(gTableTexts.getSqlConAry(), gTableTexts.getTableNameAry());
		}else{
			vscode.window.showInformationMessage('Please select directory before input this command! 请先选择目录!');
		}
	}

	let exutePath = vscode.commands.registerCommand('sql-builder.excdir', exutePath_cb);

	let exutePathFK_cb = () => {
		if (gTableTexts.hadExc){
			gTableTexts.getSqlFKStrMap().forEach((v, k) => {
				dbProcess(v, k);
			});
		}else{
			vscode.window.showInformationMessage('Please select directory before input this command! 请先选择目录!');
		}
	}

	let exutePathFK = vscode.commands.registerCommand('sql-builder.excdir_fk', exutePathFK_cb);

	context.subscriptions.push(hello);
	context.subscriptions.push(execute);
	context.subscriptions.push(executeFk);
	context.subscriptions.push(showConfig);
	context.subscriptions.push(showExample);
	context.subscriptions.push(loadPath);
	context.subscriptions.push(exutePath);
	context.subscriptions.push(exutePathFK);
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
