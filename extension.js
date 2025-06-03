// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const utifJsPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'UTIF.js');
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "tiffviewer" is now active!');

	const openTiff = vscode.commands.registerCommand('tiffviewer.openTiff', async (uri) => {

		const fileDir = uri ? path.dirname(uri.fsPath) : '';
        const fileName = uri ? path.basename(uri.fsPath) : 'Tiff Viewer';

        // 生成一个唯一的 viewType 确保每次创建都是新的面板
        const uniqueViewType = 'tiffViewer.' + Date.now() + '.' + Math.random();

		const panel = vscode.window.createWebviewPanel(
			uniqueViewType, // Identifies the type of the webview. Used internally
			fileName, // Title of the panel displayed to the user
			vscode.ViewColumn.Three, // Editor column to show the new webview panel in
			{
				enableScripts: true,
				// 允许访问 media 文件夹和 TIFF 文件所在目录
				localResourceRoots: [
					vscode.Uri.joinPath(context.extensionUri, 'media'),
					vscode.Uri.file(fileDir)
				]
			}
		);
		console.log('Opening tiff file: ' + uri);


		const tiffFileUri = panel.webview.asWebviewUri(vscode.Uri.file(uri.fsPath));
		const utifJsUri = panel.webview.asWebviewUri(utifJsPath);

		panel.webview.html = getWebviewContent(tiffFileUri, utifJsUri);

	});

	context.subscriptions.push(openTiff);
}

function getWebviewContent(tiffFileUri, utifJsUri) {
    const htmlPath = path.join(__dirname, 'media', 'webview.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    // 将动态变量注入到页面，例如 tiffFileUri 和 utifJsUri
    // 这里使用简单的替换方式，要求在 webview.html 中有占位符如 {{tiffFileUri}}、{{utifJsUri}}
	html = html.replace(/\$\{tiffFileUri\}/g, tiffFileUri.toString())
               .replace(/\$\{utifJsUri\}/g, utifJsUri.toString());

    return html;
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
