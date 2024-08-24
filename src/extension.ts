import * as vscode from 'vscode'
import { debounce } from './utils/debounce'
import { commonKeyBoard } from './server/common_key_board'

export function activate(context: vscode.ExtensionContext) {
    const provider = new ValorantSoundViewProvider(context.extensionUri, context.subscriptions)

    // // 监听编辑器的文本变化事件
    // let disposable = vscode.workspace.onDidChangeTextDocument((event) => {
    //     // 获取编辑器
    //     const editor = vscode.window.activeTextEditor
    //     if (editor && event.document === editor.document) {
    //         // 获取最近一次编辑的变化
    //         const changes = event.contentChanges
    //         console.log(changes)
    //         console.log(changes[0].text.length)
    //         console.log('------------------------')

    //         if (changes.length > 0 && changes.length <= 2) {
    //             // 如果是回车
    //             if (changes[0].text.includes('\r\n') || changes[1].text.includes('\n')) {
    //                 provider._view?.webview.postMessage({ command: 'playSound' })
    //                 return
    //             }
    //             // 如果是Tab键
    //             if (changes.length === 1) {
    //                 // 变化小等于1的tab键，不计入判断（防止和普通空格误解）
    //                 if (changes[0].text.length > 1) {
    //                     // 制表符分空格制表符和\t制表符
    //                     if (changes[0].text === '\t') {
    //                         provider._view?.webview.postMessage({ command: 'playSound' })
    //                         return
    //                     }
    //                     if (changes[0].text.trim().length === 0) {
    //                         provider._view?.webview.postMessage({ command: 'playSound' })
    //                         return
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // })

    vscode.workspace.onDidChangeTextDocument(debounce(commonKeyBoard, 2000))

    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ValorantSoundViewProvider.viewType, provider))
}

export function deactivate() {}

/**
 * webview视图类
 */
class ValorantSoundViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'ValorantSound.vsound'

    public _view?: vscode.WebviewView

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _subscriptions: {
            dispose(): any
        }[]
    ) {}

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

        this._view?.webview.onDidReceiveMessage(
            (message) => {
                console.log(message)

                switch (message.command) {
                    case 'init-end':
                        vscode.window.showInformationMessage(message.text)
                        return
                }
            },
            undefined,
            this._subscriptions
        )

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
    }

    private _getHtmlForAudio(webview: vscode.Webview): string {
        let htmlStr = ''
        const audioFiles = ['1', '月 球 虚 度', 'Ｃａｌｌ ｍｅ']
        audioFiles.forEach((fileName, index) => {
            const url = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'audio', `${fileName}.mp3`))
            htmlStr += `
                    <div id="box-${index + 1}">第${index + 1}个歌曲</div>
                    <audio muted id="${index + 1}" src="${url}"></audio>

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
                <button id="init">初始化</button>
                ${audioHtml}
            </div>


            <script  src="${scriptUri}"></script>
        </body>

        </html>`
    }
}
