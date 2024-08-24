1. 插件开发路程
    - 尝试了使用 play-sound 进行音频的播放
        - 可以播放
        - 但是只能通过打开本机其他音频播放器来进行播放，不支持使用 vscode 来进行播放

```js
import * as vscode from 'vscode'
const fs = require('fs')
const path = require('path')
var player = require('play-sound')({})

export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('valorantsound.play', () => {
        vscode.window.showInformationMessage('start play')

        const extensionPath = context.extensionPath
        const musicPath = path.join(extensionPath, 'audio', '龙卷风-周杰伦.mp3')

        console.log(musicPath)

        player.play(musicPath, (err: any) => {
            if (err) {
                console.error('Error playing audio:', err)
            } else {
                console.log('Audio played successfully.')
            }
        })
    })
}

export function deactivate() {}
```

2.
