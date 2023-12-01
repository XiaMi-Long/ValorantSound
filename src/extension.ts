import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
    const provider = new ValorantSoundViewProvider(context.extensionUri)

    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ValorantSoundViewProvider.viewType, provider))
}

export function deactivate() {}

class ValorantSoundViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ValorantSound.vsound'

    private _view?: vscode.WebviewView

    constructor(private readonly _extensionUri: vscode.Uri) {}

    resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext<unknown>,
        token: vscode.CancellationToken
    ): void | Thenable<void> {
        this._view = webviewView

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        }

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
    }

    private _getHtmlForAudio(webview: vscode.Webview): string {
        let htmlStr = ''
        const audioFiles = ['1', '月 球 虚 度', 'Ｃａｌｌ ｍｅ', '龙卷风-周杰伦']
        audioFiles.forEach((fileName, index) => {
            let isChecked = ''
            const url = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'audio', `${fileName}.mp3`))

            if (index === 0) {
                isChecked = 'checked'
            }

            htmlStr += `
                <input type="radio" id="${index}" name="radio-group" ${isChecked}>
                <label for="${index}">${fileName}</label>
                <audio src="${url}" custom-id="${index}"></audio>
            `
        })

        return htmlStr
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const audioHtml = this._getHtmlForAudio(webview)
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'view', 'index.js'))
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'view', 'reset.css'))
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'view', 'index.css'))

        return `<html>

        <head>

            <meta
            http-equiv="Content-Security-Policy"
            content="default-src 'none'; img-src ${webview.cspSource} https:; script-src ${webview.cspSource}; style-src ${webview.cspSource};media-src ${webview.cspSource};"
            />

            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">

            <title>VSound</title>
        </head>

        <body>
            <button>Play Sound</button>
            <div class="radio-group">
                ${audioHtml}
            </div>


            <script  src="${scriptUri}"></script>
        </body>

        </html>`
    }
}
