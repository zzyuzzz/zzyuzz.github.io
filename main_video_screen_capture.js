var local_Video_stream = new MediaStream();
window.onload = function () {
    const videoElem = document.getElementById("video");
    const logElem = document.getElementById("log");
    const startElem = document.getElementById("start");
    const stopElem = document.getElementById("stop");

    // Options for getDisplayMedia()

    var displayMediaOptions = {
        video: {
            cursor: "always",
            width: {ideal: 2560, max: 2560 },
            height: {ideal: 1440, max: 1440 },
            frameRate: {ideal: 60, max:60}
        },
        audio: false
    };

    // Set event listeners for the start and stop buttons
    startElem.addEventListener("click", function (evt) {
        startCapture();
    }, false);

    stopElem.addEventListener("click", function (evt) {
        stopCapture();
    }, false);
    // console.log = msg => logElem.innerHTML += `${msg}<br>`;
    // console.error = msg => logElem.innerHTML += `<span class="error">${msg}</span><br>`;
    // console.warn = msg => logElem.innerHTML += `<span class="warn">${msg}<span><br>`;
    // console.info = msg => logElem.innerHTML += `<span class="info">${msg}</span><br>`;

    async function startCapture() {
        logElem.innerHTML = "";

        try {
            stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
            stream.getTracks().forEach(track => local_Video_stream.addTrack(track));
            videoElem.srcObject = local_Video_stream;
            dumpOptionsInfo();
        } catch (err) {
            console.error("Error: " + err);
        }
    }
    function stopCapture(evt) {
        let tracks = videoElem.srcObject.getTracks();

        tracks.forEach(track => track.stop());
        tracks.forEach(track => videoElem.srcObject.removeTrack(track));
        videoElem.srcObject = null;
    }
    function dumpOptionsInfo() {
        const videoTrack = videoElem.srcObject.getVideoTracks()[0];

        console.info("Track settings:");
        console.info(JSON.stringify(videoTrack.getSettings(), null, 2));
        console.info("Track constraints:");
        console.info(JSON.stringify(videoTrack.getConstraints(), null, 2));
    }



    // 老的浏览器可能根本没有实现 mediaDevices，所以我们可以先设置一个空的对象
    if (navigator.mediaDevices === undefined) {
        navigator.mediaDevices = {};
    }

    // 一些浏览器部分支持 mediaDevices。我们不能直接给对象设置 getUserMedia
    // 因为这样可能会覆盖已有的属性。这里我们只会在没有 getUserMedia 属性的时候添加它。
    if (navigator.mediaDevices.getUserMedia === undefined) {
        navigator.mediaDevices.getUserMedia = function (constraints) {

            // 首先，如果有 getUserMedia 的话，就获得它
            var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            // 一些浏览器根本没实现它 - 那么就返回一个 error 到 promise 的 reject 来保持一个统一的接口
            if (!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
            }

            // 否则，为老的 navigator.getUserMedia 方法包裹一个 Promise
            return new Promise(function (resolve, reject) {
                getUserMedia.call(navigator, constraints, resolve, reject);
            });
        }
    }


}

var promise;
var peer;
var g_id;
var conn;
var local_call;
function RegisterID() {
    g_id = document.getElementById("id_Rtext").value;
    peer = new Peer(id = g_id);
    document.getElementById("id_Rtext").disabled = "disabled";
    console.log("g_id: " + g_id);
    document.getElementById("RegisterID").disabled = "disabled";
    peer.on('open', function (id) {
        g_id = id;
        console.log('My peer ID is: ' + id);
        document.getElementById("Connect").removeAttribute("disabled");;
    });
    peer.on('call', function (call) {
        // Answer the call, providing our mediaStream
        local_call = call;
        console.log("called");
        call.on('stream', function (stream) {
            // `stream` is the MediaStream of the remote peer.
            // Here you'd add it to an HTML video/canvas element.
            const audioElem = document.getElementById("video2");
            audioElem.srcObject = stream;
        });
        // var constraints = {
        //     video: true,
        //     audio: true
        // }
        // navigator.mediaDevices.getDisplayMedia(constraints).then((stream) => call.answer(stream));
        call.answer(local_Video_stream);
    });

}

function Connect_button() {
    if (typeof (local_call) != "undefined") return;

    // Find the canvas element to capture
    const canvasElt = document.querySelector('canvas');
    const stream = canvasElt.captureStream(25);
    peer.call(document.getElementById("id_text").value, stream).on('stream', function (stream) {
        const audioElem = document.getElementById("video2");
        audioElem.srcObject = stream;
    })

    // var constraints = {
    //     // video: true,
    //     // audio: true
    //     video: true,
    //     audio: false
    // }

    // navigator.mediaDevices.getDisplayMedia(constraints)
    //     .then((stream) => peer.call(document.getElementById("id_text").value, stream))
    //     .then((call) => call.on('stream', function (stream) {
    //         // `stream` is the MediaStream of the remote peer.
    //         // Here you'd add it to an HTML video/canvas element.
    //         /*const audioElem = document.querySelector("audio");
    //         audioElem.srcObject = stream;*/
    //         const audioElem = document.getElementById("video2");
    //         audioElem.srcObject = stream;
    //     }))

}

