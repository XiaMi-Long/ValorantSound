// 获取 vscode 对象，以便与 VSCode 扩展进行交互
const vscode = acquireVsCodeApi();
// 获取页面上的按钮元素
const button = document.querySelector(".button");
// 获取页面上的单选框容器元素
const radioBox = document.querySelector('.radio-box');
// 获取页面上的加载提示容器元素
const loadingTipBox = document.querySelector('.radio-loading-tip-box');
// 是否已经初始化完成
let isInitSuccess = false;
// 初始化 audioElements 变量，用于存储所有音频元素
let audioElements = null;
// 目前正在播放第几个音频
let playingIndex = 0;
// button按钮的点击事件方法
let buttonClickEvent = null



// 调用 initSuccess 函数，可能是用于初始化某些操作或状态
initSuccess(vscode);

// 为 window 对象添加一个 message 事件监听器
window.addEventListener("message", (event) => {
    // 获取事件数据
    const message = event.data;
    // 根据命令类型进行switch判断
    switch (message.command) {
        // 如果命令是 init-success，表示初始化成功
        case 'init-success':
            // 渲染音频相关内容
            renderAudio(message.data);
            // 获取所有音频元素
            getAllAudioElement();
            // 为音频元素的加载事件添加监听器，并显示加载提示信息
            listenerAudioUrlLoad();
            // 额外初始化duvet

            break;
        case 'change-music':
            button.removeEventListener('click', buttonClickEvent)
            buttonClickEvent = null

            // 渲染音频相关内容
            renderAudio(message.data);
            // 获取所有音频元素
            getAllAudioElement();
            // 为音频元素的加载事件添加监听器，并显示加载提示信息
            listenerAudioUrlLoad();
            isInitSuccess = false
            break;
        // case 'config-update':
        //     vscode.postMessage({
        //         command: 'select-change',
        //         text: message.data
        //     })
        //     break;
        case 'next-play':
            playNextAudio()
            break;
        case 'play-duvet':
            const duvet = document.getElementById('duvet')
            if (duvet) {
                duvet.muted = false
                duvet.play()
            }

            break;


    }
});

window.onload = function () {
    const select = document.getElementById("select")
    if (select) {
        select.addEventListener('change', () => {
            vscode.postMessage({
                command: 'select-change',
                text: select.value
            })
        })
    }
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
 * 这个函数使用 document.getElementsByTagName 方法来获取页面上所有的 <audio> 标签，并将结果赋值给参数 audioElements。
 * @param {HTMLCollection | null} audioElements - 页面上所有的 audio 元素集合，默认为 null
 * @return {void} 这个函数没有返回值，它的作用是修改 audioElements 参数引用的内容
 */
function getAllAudioElement () {
    audioElements = document.querySelectorAll(".radio-box audio")
    playingIndex = 0
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
                createLoadingTip('加载完成！', true)
                buttonClick()
            }

        });
    })

}



/**
 * 为一个按钮绑定点击事件的函数
 * @function buttonClick
 * @description 这个函数会在页面加载完成后执行，它获取一个按钮元素，并为其添加一个点击事件监听器。当按钮被点击时，会触发`buttonClickEvent`函数。
 */
function buttonClick () {
    buttonClickEvent = () => {
        if (isInitSuccess) {
            createLoadingTip('测试成功！', true)
            return
        }
        // 播放所有音频
        Array.from(audioElements).forEach((ele, index) => {
            const audio = ele
            if (index === audioElements.length - 1) {
                audio.muted = false
            } else {
                audio.muted = true;
            }

            audio.play();
        })
        isInitSuccess = true
        createLoadingTip('测试成功！', true)

    }
    button.addEventListener("click", buttonClickEvent)
}


/**
 * 播放下一个音频文件
 * 在播放下一首音频之前，确保当前音频停止播放并重置播放时间
 * 如果播放列表结束，则重新开始播放列表的第一首音频
 * @function playNextAudio
 */
function playNextAudio () {
    // 检查是否初始化成功，否则显示加载提示
    if (!isInitSuccess) {
        createLoadingTip('请先初始化！', true)
    }

    // 检查当前播放索引值是否达到播放列表结尾，是的话重置索引到列表的开始位置
    if (playingIndex === audioElements.length) {
        playingIndex = 0
    }

    // 防止多个声音同时播放
    if (playingIndex > 0) {
        // 暂停当前音频
        audioElements[playingIndex - 1].pause()
        // 将当前音频的播放时间重置为 0
        audioElements[playingIndex - 1].currentTime = 0
    }

    // 播放索引值指定的音频文件
    playAudio(playingIndex)

    // 设置播放索引值到下一个位置
    setPlayIndex(playingIndex + 1)
}


/**
 * 播放列表中指定索引位置的音频
 *
 * @param {number} index - 音频在音频元素数组中的索引位置
 */
function playAudio (index) {
    const audio = audioElements[index]
    audio.muted = false
    audio.play();
}

/**
 * 设置播放索引值
 *
 * @param {number} num - 要设置的播放索引值
 */
function setPlayIndex (num) {
    playingIndex = num
}



/**
 * 创建一个加载提示，并将其添加到页面上的 loadingTipBox 容器中
 * @param {string} text - 要在加载提示中显示的文本
 * @returns {void} 这个函数没有返回值，它的作用是创建并显示加载提示
 */
function createLoadingTip (text, autoClose = false, closeTime = 2000,) {
    const div = document.createElement('div')
    div.className = 'loading-tip'
    div.innerText = text
    loadingTipBox.appendChild(div)

    if (autoClose) {
        setTimeout(() => {
            clearLoadingTip()
        }, closeTime);
    }
}


/**
 * 清空加载提示信息
 * 这个函数的作用是清空 loadingTipBox 容器的内容，从而移除页面上显示的加载提示信息。
 * @returns {void} 这个函数没有返回值，它的作用是修改 loadingTipBox 的内容
 */
function clearLoadingTip () {
    // 清空 loadingTipBox 容器的内容
    loadingTipBox.innerHTML = ''
}
