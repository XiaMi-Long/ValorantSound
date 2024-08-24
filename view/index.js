window.onload = function () {
    const vscode = acquireVsCodeApi();
    const init = document.getElementById("init")
    const box1 = document.getElementById("box-1")
    const box2 = document.getElementById("box-2")
    const box3 = document.getElementById("box-3")
    const a1 = document.getElementById("1")
    const a2 = document.getElementById("2")
    const a3 = document.getElementById("3")

    init.addEventListener("click", () => {
        console.log(1);

        a1.play()
        a1.pause()
        vscode.postMessage({
            command: 'init-end',
            text: '初始化完成'
        })
    })

    box1.addEventListener("click", () => {
        a1.muted = false;
        a1.play();

    })
    box2.addEventListener("click", () => {
        a2.muted = false;
        a2.play();
    })
    box3.addEventListener("click", () => {
        a3.muted = false;
        a3.play();
    })

    window.addEventListener("message", (event) => {
        const message = event.data; // The JSON data our extension sent

        switch (message.command) {
            case 'playSound':
                a1.muted = false;
                a1.play();
                break;
        }

        console.log(event);

    })


}