package main

// Import thy packages
import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"math/rand"
	"net/http"
	"sync"
)

type Message struct {
	Message string `json:"message"`
	Key     string `json:"key"`
}

var connections = make(map[string]*websocket.Conn)
var connectionsMutex sync.Mutex

// Takes request and just allows it
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // Allow all connections
}

// Get the response writer to write responses and the request
func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial get request to websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()

	key := fmt.Sprintf("%d", rand.Intn(9000)+1000)

	connectionsMutex.Lock()
	connections[key] = ws
	connectionsMutex.Unlock()

	// Remove the connection when it closes.
	defer func() {
		connectionsMutex.Lock()
		delete(connections, key)
		connectionsMutex.Unlock()

		fmt.Println("Connection closed:", key)
	}()

	err = ws.WriteMessage(websocket.TextMessage, []byte(key))

	for {
		// Read message from browser
		_, msg, err := ws.ReadMessage()
		if err != nil {
			fmt.Println("read error:", err)
			break
		}

		var message Message

		err = json.Unmarshal(msg, &message)
		if err != nil {
			fmt.Println("JSON error:", err)
			return
		}

		connectionsMutex.Lock()
		target, exists := connections[message.Key]
		connectionsMutex.Unlock()

		if !exists {
			fmt.Println("No connection found for key:", message.Key)
			continue
		}

		fmt.Printf("Received: %s\n", message.Message)

		// Write message back to browser
		if err := target.WriteMessage(websocket.TextMessage, []byte(message.Message)); err != nil {
			fmt.Println("write error:", err)
			break
		}
	}
}

func main() {
	// Serve index.html when visiting http://127.0.0.1:8080/
	http.Handle("/", http.FileServer(http.Dir("./static")))

	http.HandleFunc("/ws", handleConnections)

	fmt.Println("WebSocket server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("ListenAndServe:", err)
	}
}
