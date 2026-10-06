let socket = new WebSocket("ws://127.0.0.1:8080/ws");
let key = "";
let text = "";
let messages = 0;
let messageText = document.getElementById("messageText");

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
        text = text.replaceAll(" ", "\n");
        messageText.textContent = text
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

displayMessage("HELLO")