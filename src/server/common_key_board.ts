import * as vscode from 'vscode'
import { TextDocumentChangeEvent, Webview } from 'vscode'

export function commonKeyBoard(event: TextDocumentChangeEvent, webView: Webview | undefined) {
    const level = 0
    const text = event.contentChanges[0]

    console.log(webView)
    console.log(event)
    webView?.postMessage({ command: 'next-play', level: '' })
    // vscode.
}
