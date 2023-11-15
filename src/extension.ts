import * as vscode from 'vscode'
import cp from 'child_process'

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('valorantsound.showView', () => {
        console.log(context.extensionUri)

        let audioFilePath = vscode.Uri.joinPath(context.extensionUri, 'src', 'audio', 'audio.mp3').fsPath
        // 现在你可以使用这个路径来播放你的音频文件
        cp.exec()
    })

    context.subscriptions.push(disposable)
}

export function deactivate() {}
