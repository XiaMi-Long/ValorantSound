import * as vscode from 'vscode'

// 定义音乐菜单接口，键和值都是字符串类型
interface MusicMenu {
    [key: string]: string[]
}

// 定义 musicMenu 对象并赋值，对象内容为一个键值对，键为 '盖亚'，值为包含 6 个字符串的数组
export const musicMenu: MusicMenu = {
    盖亚: ['gaiya-1.mp3', 'gaiya-2.mp3', 'gaiya-3.mp3', 'gaiya-4.mp3', 'gaiya-5.mp3'],
    混沌: ['hundun-1.mp3', 'hundun-2.mp3', 'hundun-3.mp3', 'hundun-4.mp3', 'hundun-5.mp3'],
}
