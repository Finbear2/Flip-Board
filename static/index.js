let socket = new WebSocket("ws://127.0.0.1:8080/ws");
let key = "";
let text = "";
let messages = 0;

const parent = document.querySelector("#clock");

const face = FlipClock.alphanumeric({
    value: FlipClock.faceValue(""),
    targetValue: FlipClock.faceValue(""),
    sequencer: {
        stopAfterChanges: 3
    },
    skipChars: 5
});

const clock = FlipClock.flipClock({
    parent,
    timer: 200,
    face: face,
    theme: FlipClock.theme({
        dividers: " ",
        css: FlipClock.css({
            animationDuration: "100ms",
            fontSize: "5rem"
        })
    })
});

socket.onopen = function (event) {
    document.getElementById("messages").textContent += "Connected to WebSocket server\n";
};

socket.onmessage = function (event) {
    if (messages == 0) {
        key = event.data;

        let keyText = document.getElementById("keyText");
        keyText.textContent = "Your key: " + key;
    } else {
        text = event.data;
        face.targetValue.value = text;

        // Restart the sequencer so it actually flips toward the new target.
        clock.start();
    }

    messages++;
};

socket.onclose = function (event) {
    document.getElementById("messages").textContent += "Disconnected from WebSocket server\n";
};

function sendMessage() {
    let message = document.getElementById("messageInput").value;
    let key = document.getElementById("keyInput").value;
    socket.send(JSON.stringify({
        message: message,
        key: key
    }));
    document.getElementById("messageInput").value = "";
}

face.targetValue.value = "HELLO"