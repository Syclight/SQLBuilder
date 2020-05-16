const vscode = require('vscode');
const DB = require('./source/db');
const path = require("path")
const fs = require("fs");
const TableText = require('./source/tableText')
const config = require('./config.json');

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
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
		let path = config.outSQLPath;
		let filec = null;

		let sqlAry = new Array();
		if (sqlStr instanceof Array) {
			sqlAry = sqlStr;
		} else {
			sqlAry.push(sqlStr);
		}

		try {
			let res = null;
			sqlAry.forEach(sqlStr => {
				if (path != null && path != "") {
					let fileName = path + name + ".sql";
					fs.open(fileName, 'a', function (err, fd) {
						if (err) vscode.window.showErrorMessage(err.toString());
						fs.appendFile(fileName, sqlStr + '\n', 'utf8', function (err) {
							if (err) vscode.window.showErrorMessage(err.toString());
						});
						fs.close(fd, function (err) {
							if (err) vscode.window.showErrorMessage(err.toString());
						});
					});
				}
				let res = db.execute(sqlStr);
			});
			vscode.window.showInformationMessage(res);
		} catch (error) {
			vscode.window.showErrorMessage(error.toString());
		}

		db.close();
		vscode.window.showInformationMessage("SqlBuilder processing finied!\n处理完成！");

	}

	let disposable = vscode.commands.registerCommand('sql-builder.hello', function () {
		vscode.window.showInformationMessage('config 配置详情:' + JSON.stringify(config));
		vscode.window.showInformationMessage('Hellow! Welcome to use SQLBuilder! 你好, 欢迎使用SQLBuilder');

	});

	let execute = vscode.commands.registerCommand('sql-builder.execute', function () {
		let errorRow = null;
		let tableText = new TableText(1, config.PKGenStra);
		const res = getAllText();

		tableText.create(res[1], res[0]);
		errorRow = tableText.excute();

		if (errorRow != null) {
			vscode.window.showErrorMessage("Error: in row \"" + errorRow + "\"");
			return;
		}

		dbProcess(tableText.getSqlConStr(), res[0]);
	});

	let executeFk = vscode.commands.registerCommand('sql-builder.execute_fk', function () {
		let errorRow = null;
		let tableText = new TableText(2, config.PKGenStra);
		const res = getAllText();

		tableText.create(res[1], res[0]);
		errorRow = tableText.excute();

		if (errorRow != null) {
			vscode.window.showErrorMessage("Error: in row \"" + errorRow + "\"");
			return;
		}

		dbProcess(tableText.getSqlFKAry(), res[0]);
	});

	let showConfig = vscode.commands.registerCommand('sql-builder.config', function () {
		console.log(config);
		const options = {
			preview: false,
			viewColumn: vscode.ViewColumn.Two
		};
		vscode.window.showTextDocument(vscode.Uri.file(__dirname + '/config.json'), options);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(execute);
	context.subscriptions.push(executeFk);
	context.subscriptions.push(showConfig);
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
