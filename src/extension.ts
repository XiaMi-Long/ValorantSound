import * as vscode from 'vscode'
import { musicMenu } from './utils/music-menu'
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
                    case 'init-success':
                        this._view?.webview.postMessage({ command: 'init-success', data: this.getDefaultAudioUrls() })
                        return
                }
            },
            undefined,
            this._subscriptions
        )

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview)
    }

    /**
     * 获取用于选择的 HTML 代码
     *
     * 这个方法会构建一个 `<select>` 元素，并使用 `musicMenu` 对象中的键作为选项值。如果键与配置文件中指定的默认名称匹配，
     * 该选项将被设置为默认选中。
     *
     * @param webview - `vscode.Webview` 对象，用于获取扩展的 Uri
     * @returns 生成的 `<select>` 元素的 HTML 代码
     */
    private _getHtmlForSelect(webview: vscode.Webview): string {
        const defaultName = vscode.workspace.getConfiguration('valorantsound')
        let htmlStr = ' <select>'
        for (const [key, value] of Object.entries(musicMenu)) {
            if (key === defaultName.select) {
                htmlStr += `
                    <option value="${key}" selected>${key}</option>
                `
                continue
            }
            htmlStr += `
                    <option value="${key}">${key}</option>
                `
        }
        htmlStr += '</select>'
        return htmlStr
    }

    /**
     * 获取默认配置选中的音效url字符串
     * @returns json字符串
     */
    public getDefaultAudioUrls(): string {
        const defaultName = vscode.workspace.getConfiguration('valorantsound')
        return this._getHtmlForAudio(defaultName.select)
    }

    /**
     * 获取音频列表的 HTML 代码
     * @param {string} name - 音频列表的名称
     * @returns {string} - 音频列表的 HTML 代码
     */
    public _getHtmlForAudio(name: string): string {
        let str = ''
        const list = musicMenu[name]
        list.forEach((item) => {
            str += `<audio id="${name + '-' + item}" src="${this._view?.webview.asWebviewUri(
                vscode.Uri.joinPath(this._extensionUri, 'audio', name, `${item}`)
            )}" style="opacity:0;"></audio>`
        })
        return str
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // const audioHtml = this._getHtmlForAudio(webview)
        const selectHtml = this._getHtmlForSelect(webview)

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
            <div class="box">
                <div class="button">
                    初始化
                </div>
                <div class="tip">请选择声效</div>
                ${selectHtml}


                <div class="radio-box">
                </div>

                <div class="radio-loading-tip-box">
                </div>


            </div>





            <script  src="${scriptUri}"></script>
        </body>

        </html>`
    }
}

// <div class="radio-group">
// <button id="init">初始化</button>
// ${audioHtml}
// </div>
