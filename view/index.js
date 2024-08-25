


const vscode = acquireVsCodeApi();
const button = document.querySelector(".button")
const radioBox = document.querySelector('.radio-box')
const loadingTipBox = document.querySelector('.radio-loading-tip-box')
let audioElements = null


initSuccess(vscode)

window.addEventListener("message", (event) => {
    const message = event.data;
    switch (message.command) {
        case 'init-success':
            renderAudio(message.data)
            getAllAudioElement()
            listenerAudioUrlLoad()
            // a1.muted = false;
            // a1.play();
            break;
    }
})

window.onload = function () {







    // init.addEventListener("click", () => {
    //     console.log(1);

    //     a1.play()
    //     a1.pause()

    // })

    // box1.addEventListener("click", () => {
    //     a1.muted = false;
    //     a1.play();

    // })
    // box2.addEventListener("click", () => {
    //     a2.muted = false;
    //     a2.play();
    // })
    // box3.addEventListener("click", () => {
    //     a3.muted = false;
    //     a3.play();
    // })




}



/**
 * 通知vscode-webview外层，webview已经加载完毕
 * @param {*} vscode
 */
function initSuccess (vscode) {
    vscode.postMessage({
        command: 'init-success',
        text: '初始化完成'
    })
}

/**
 * 渲染音频列表到指定的 radioBox 容器
 * @param {string} str - 音频 URL 列表的 JSON 字符串
 * @returns {void}
 */
function renderAudio (str) {
    radioBox.innerHTML = str
}


/**
 * 获取页面上所有的 audio 元素
 *
 * 这个函数使用 document.getElementsByTagName 方法来获取页面上所有的 <audio> 标签，并将结果赋值给参数 audioElements。
 * 如果页面上没有 audio 元素，这个函数不会做任何事情。
 *
 * @param {HTMLCollection | null} audioElements - 页面上所有的 audio 元素集合，默认为 null
 * @return {void} 这个函数没有返回值，它的作用是修改 audioElements 参数引用的内容
 */
function getAllAudioElement () {
    audioElements = document.getElementsByTagName("audio")
}


/**
 * 为音频元素的加载事件添加监听器，并显示加载提示信息
 * @param {HTMLCollection | null} audioElements - 页面上所有的 audio 元素集合，默认为 null
 * @return {void} 这个函数没有返回值，它的作用是修改 loadingTipBox 的内容，并为 audioElements 中的每个元素添加加载事件监听器
 */
function listenerAudioUrlLoad () {
    let loadCount = 0;
    Array.from(audioElements).forEach((ele, index) => {
        createLoadingTip('正在加载第' + (index + 1) + '个音频')
        // 为每个音频元素添加加载事件监听器
        ele.addEventListener('loadeddata', function () {
            loadCount++
            if (loadCount === audioElements.length) {
                clearLoadingTip()
                createLoadingTip('加载完成！')
                setTimeout(() => {
                    clearLoadingTip()

                }, 2000);
                buttonClick()
            }

        });
    })

}


/**
 * 初始化按钮点击事件监听器
 * 这个函数为页面上的 `button` 元素添加点击事件监听器，当用户点击按钮时，在控制台输出数字 `6`
 */
function buttonClick () {
    button.addEventListener("click", () => {
        // 播放第一个音频初始化
        const audio = audioElements[0]
        audio.muted = false;
        audio.play();
        createLoadingTip('测试成功！')
        setTimeout(() => {
            clearLoadingTip()
        }, 2000);

    })
}

/**
 * 创建一个加载提示，并将其添加到页面上的 loadingTipBox 容器中
 *
 * @param {string} text - 要在加载提示中显示的文本
 * @returns {void} 这个函数没有返回值，它的作用是创建并显示加载提示
 */
function createLoadingTip (text) {
    const div = document.createElement('div')
    div.className = 'loading-tip'
    div.innerText = text
    loadingTipBox.appendChild(div)
}


/**
 * 清空加载提示信息
 *
 * 这个函数的作用是清空 loadingTipBox 容器的内容，从而移除页面上显示的加载提示信息。
 *
 * @returns {void} 这个函数没有返回值，它的作用是修改 loadingTipBox 的内容
 */
function clearLoadingTip () {
    // 清空 loadingTipBox 容器的内容
    loadingTipBox.innerHTML = ''
}
