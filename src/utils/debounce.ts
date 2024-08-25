import { Webview } from 'vscode'

// 本次是否执行,默认第一次执行
let isExecution = true

/**
 * 防抖函数
 *
 * @param fn - 要防抖的函数
 * @param time - 防抖延迟时间（毫秒）
 * @return 返回一个新函数，这个新函数在被调用时，会延迟 time 毫秒执行 fn 函数。如果在延迟期间，这个新函数再次被调用，那么它将取消前一次的延迟执行，而是重新开始延迟。这样可以避免由于用户频繁操作而导致的不必要的频繁执行。
 */
export function debounce(fn: Function, time: number, webView: Webview | undefined): any {
    return function (this: any, ...args: any[]): void {
        if (isExecution) {
            // 立即执行一次函数
            fn.apply(this, [...args, webView])

            // 标记为已执行状态，以便在延迟期间阻止其他执行
            isExecution = false

            // 延迟一段时间后，将标记重置为可以执行的状态
            setTimeout(() => {
                isExecution = true
            }, time)
        }
    }
}
