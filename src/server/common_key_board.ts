import * as vscode from 'vscode'
import { TextDocumentChangeEvent, Webview } from 'vscode'

export function commonKeyBoard(event: TextDocumentChangeEvent, webView: Webview) {
    const changes = event.contentChanges
    // 如果是批量修改/删除直接跳过
    if (changes.length > 2 || changes.length === 0) {
        return
    }

    if (changes[0].rangeLength > 0) {
        // 如果是delete键
        if (changes[0].text.length === 0) {
            webView.postMessage({ command: 'next-play', keyboard: 'delete' })
            return
        }
    }

    if (changes[0].rangeLength === 0) {
        // 如果是回车
        if (changes[0].text.includes('\r\n')) {
            webView.postMessage({ command: 'next-play', keyboard: 'enter' })
            return
        }
        if (changes[1]) {
            if (changes[1].text.includes('\n')) {
                webView.postMessage({ command: 'next-play', keyboard: 'enter' })
            }
        }

        // 如果是回车键
        // 变化小等于1的tab键，不计入判断（防止和普通空格误解）
        if (changes[0].text.length > 1) {
            // 制表符分空格制表符和\t制表符
            if (changes[0].text === '\t' || changes[0].text.trim().length === 0) {
                webView.postMessage({ command: 'next-play', keyboard: 'tab' })
                return
            }
        }
    }
}
